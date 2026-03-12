import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

async function sendWhatsAppMessage(phoneId: string, token: string, toPhone: string, text: string) {
    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`
    
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhone,
        type: "text",
        text: { preview_url: false, body: text }
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const errData = await response.text()
        console.error(`Meta API Error Response (${response.status}):`, errData)
        throw new Error(`Meta API error (${response.status}): ${errData}`)
    }

    return await response.json()
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        console.error("No authorization header provided")
        return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    try {
        const { conversation_id, content, sender_type = 'agent' } = await req.json()

        if (!conversation_id || !content) {
            return new Response("Missing conversation_id or content", { status: 400, headers: corsHeaders })
        }

        // 1. Get conversation details to find business and client phone
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('business_id, client_phone')
            .eq('id', conversation_id)
            .single()

        if (convError || !conversation) throw new Error("Conversation not found")

        // 2. Get business WhatsApp credentials
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('id, whatsapp_phone_number_id, whatsapp_access_token')
            .eq('id', conversation.business_id)
            .single()

        if (bizError || !business || !business.whatsapp_phone_number_id || !business.whatsapp_access_token) {
            throw new Error("Business WhatsApp credentials not configured")
        }

        // 3. Send message via Meta API
        let messageStatus = 'sent'
        let waMessageId = null
        let metaError = null
        const traceId = crypto.randomUUID()

        try {
            const metaResponse = await sendWhatsAppMessage(
                business.whatsapp_phone_number_id,
                business.whatsapp_access_token,
                conversation.client_phone,
                content
            )
            waMessageId = metaResponse.messages?.[0]?.id || null
        } catch (err: any) {
            console.error("Failed to send WhatsApp message:", err)
            messageStatus = 'failed'
            metaError = err.message || String(err)
            
            // Log to system_logs for visibility
            try {
                await supabase.from('system_logs').insert([{
                    trace_id: traceId,
                    event_type: 'whatsapp_send_error',
                    business_id: conversation.business_id,
                    conversation_id: conversation_id,
                    outcome: 'error',
                    error_message: metaError,
                    metadata: { 
                        phone_id: business.whatsapp_phone_number_id,
                        to: conversation.client_phone,
                        content_preview: content.substring(0, 50)
                    }
                }])
            } catch (logErr) {
                console.error("Critical: Failed to log error to system_logs:", logErr)
            }
        }

        // 4. Insert into messages table
        const { data: newMsg, error: msgErr } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversation_id,
                direction: 'outbound',
                sender_type: sender_type,
                content: content,
                media_type: 'text',
                whatsapp_message_id: waMessageId,
                status: messageStatus
            }])
            .select('id')
            .single()

        if (msgErr) throw msgErr

        // 5. Update conversation last_message_at
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversation_id)

        if (messageStatus === 'failed') {
            return new Response(JSON.stringify({ 
                error: "Message recorded but failed to send via Meta", 
                details: metaError 
            }), { 
                status: 502, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            })
        }

        return new Response(JSON.stringify({ message_id: newMsg.id, status: 'sent', whatsapp_id: waMessageId }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } catch (error: any) {
        console.error("Send message error:", error)
        
        // Final fallback log
        try {
            await supabase.from('system_logs').insert([{
                trace_id: crypto.randomUUID(),
                event_type: 'send_message_crash',
                outcome: 'error',
                error_message: error.message || String(error)
            }])
        } catch (inner) {
            console.error("Logging failed too:", inner)
        }

        return new Response(JSON.stringify({ error: String(error.message || error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }
})
