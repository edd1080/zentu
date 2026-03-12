import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { suggestion_id, escalation_id, conversation_id, action, final_content } = await req.json()

        if (!action || (!suggestion_id && !escalation_id && !conversation_id)) {
            return new Response(JSON.stringify({ error: "Missing required fields (action and one id)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
        }

        let targetConversationId = conversation_id
        let messageToSend = null
        let resolveAs = 'owner_approved'

        // 1. Handle Suggestion Actions
        if (suggestion_id) {
            const { data: suggestion, error: sugErr } = await supabase
                .from('suggestions')
                .select('*')
                .eq('id', suggestion_id)
                .single()

            if (sugErr || !suggestion) throw new Error("Suggestion not found")
            targetConversationId = suggestion.conversation_id

            if (action === 'approve') {
                await supabase.from('suggestions').update({ status: 'approved', resolved_at: new Date().toISOString(), resolved_by_owner: true }).eq('id', suggestion_id)
                messageToSend = suggestion.content
            } else if (action === 'edit') {
                if (!final_content) throw new Error("Missing final_content for edit")
                await supabase.from('suggestions').update({ status: 'edited', final_content, resolved_at: new Date().toISOString(), resolved_by_owner: true }).eq('id', suggestion_id)
                messageToSend = final_content
                resolveAs = 'owner_manual'
            } else if (action === 'reject') {
                await supabase.from('suggestions').update({ status: 'rejected', final_content, resolved_at: new Date().toISOString(), resolved_by_owner: true }).eq('id', suggestion_id)
                if (final_content) {
                    messageToSend = final_content
                    resolveAs = 'owner_manual'
                }
            }

            // Trigger Learning Loop for Edit/Reject
            if (action === 'edit' || (action === 'reject' && final_content)) {
                const { data: ks, error: ksErr } = await supabase.from('knowledge_sources').insert([{
                    business_id: suggestion.business_id,
                    type: 'correction',
                    raw_content: JSON.stringify({ original: suggestion.content, corrected: final_content, intent: suggestion.detected_intent_label }),
                    processed_by: 'system'
                }]).select('id').single()
                
                if (!ksErr && ks) {
                    supabase.functions.invoke('classify-correction', {
                        body: {
                            suggestion_id: suggestion.id,
                            source_id: ks.id,
                            business_id: suggestion.business_id,
                            original_response: suggestion.content,
                            corrected_response: final_content,
                            intent: suggestion.detected_intent_label
                        },
                        headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
                    }).catch((err: any) => console.error("Error triggering classify-correction:", err))
                }
            }
        }

        if (action === 'attend_escalation') {
            const { data: esc, error: escErr } = await supabase
                .from('escalations')
                .update({ status: 'attended', resolved_at: new Date().toISOString() })
                .eq(escalation_id ? 'id' : 'conversation_id', escalation_id || targetConversationId)
                .eq('status', 'active')
                .select('conversation_id')
                .maybeSingle()

            if (escErr) throw escErr
            if (esc) targetConversationId = esc.conversation_id
            
            // Mark conversation as active (waiting for manual input)
            await supabase.from('conversations').update({ status: 'active' }).eq('id', targetConversationId)
        }

        // 3. Send Message if applicable
        if (messageToSend && targetConversationId) {
            const { error: sendErr } = await supabase.functions.invoke('send-message', {
                body: { conversation_id: targetConversationId, content: messageToSend, sender_type: 'owner' },
                headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
            })
            if (sendErr) console.error("Failed to invoke send-message:", sendErr)

            await supabase.from('conversations').update({ status: 'resolved', resolved_by: resolveAs }).eq('id', targetConversationId)
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } catch (error: any) {
        console.error("Suggestion action error:", error)
        return new Response(JSON.stringify({ error: String(error.message || error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }
})
