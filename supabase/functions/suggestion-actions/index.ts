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
        const { suggestion_id, action, final_content } = await req.json()

        if (!suggestion_id || !action) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
        }

        // 1. Fetch Suggestion
        const { data: suggestion, error: sugErr } = await supabase
            .from('suggestions')
            .select('*')
            .eq('id', suggestion_id)
            .single()

        if (sugErr || !suggestion) throw new Error("Suggestion not found")

        const conversationId = suggestion.conversation_id
        let messageToSend = null
        let resolveAs = 'owner_approved'

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
        } else {
            throw new Error("Invalid action")
        }

        // 2. Send Message
        if (messageToSend) {
            // Invoke send-message Edge Function
            const { error: sendErr } = await supabase.functions.invoke('send-message', {
                body: { conversation_id: conversationId, content: messageToSend, sender_type: 'owner' },
                headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } // using service key internally
            })
            if (sendErr) {
                console.error("Failed to invoke send-message:", sendErr)
                // Continue despite failure, maybe log to system_logs
            }

            // Mark conversation as resolved
            await supabase.from('conversations').update({ status: 'resolved', resolved_by: resolveAs }).eq('id', conversationId)
        }

        // 3. Trigger Learning Loop for Edit/Reject
        if (action === 'edit' || (action === 'reject' && final_content)) {
            // Create Knowledge Source
            const { data: ks, error: ksErr } = await supabase.from('knowledge_sources').insert([{
                business_id: suggestion.business_id,
                type: 'correction',
                raw_content: JSON.stringify({ original: suggestion.content, corrected: final_content, intent: suggestion.detected_intent_label }),
                processed_by: 'system'
            }]).select('id').single()
            
            if (!ksErr && ks) {
                 // Trigger classification asynchronously
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

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } catch (error: any) {
        console.error("Suggestion action error:", error)
        return new Response(JSON.stringify({ error: String(error.message || error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }
})
