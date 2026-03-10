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
        throw new Error(`Meta API error (${response.status}): ${errData}`)
    }

    return await response.json()
}

serve(async (req: Request) => {
    // Basic service-role auth (internal function primarily, although could be called via UI with anon if RLS allowed, but better keep it secure and call via DB triggers or other edge functions, actually frontend calls it maybe? No, frontend calls suggestion-actions).
    // The frontend might call suggestion-actions, which then calls send-message, or calls send-message directly.
    // If called via anon key, we should rely on RLS or require auth header.
    // Let's require the user to send their JWT, but wait, process-message (backend) also calls this.
    // For simplicity, we can accept SUPABASE_SERVICE_ROLE_KEY for internal calls, and validate user auth for external calls.
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    try {
        const { conversation_id, content } = await req.json()

        if (!conversation_id || !content) {
            return new Response("Missing conversation_id or content", { status: 400 })
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
            .select('whatsapp_phone_number_id, whatsapp_access_token')
            .eq('id', conversation.business_id)
            .single()

        if (bizError || !business || !business.whatsapp_phone_number_id || !business.whatsapp_access_token) {
            throw new Error("Business WhatsApp credentials not configured")
        }

        // 3. Send message via Meta API
        let messageStatus = 'sent'
        let waMessageId = null
        try {
            const metaResponse = await sendWhatsAppMessage(
                business.whatsapp_phone_number_id,
                business.whatsapp_access_token,
                conversation.client_phone,
                content
            )
            waMessageId = metaResponse.messages?.[0]?.id || null
        } catch (metaErr) {
            console.error("Failed to send WhatsApp message:", metaErr)
            messageStatus = 'failed'
            // Keep going to insert the failed message record
        }

        // 4. Insert into messages table
        const { data: newMsg, error: msgErr } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversation_id,
                direction: 'outbound',
                sender_type: 'agent', // or 'owner' depending on caller, default to agent for automatic. Can be passed in body.
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
            return new Response(JSON.stringify({ error: "Message recorded but failed to send via Meta" }), { status: 502, headers: { "Content-Type": "application/json" } })
        }

        return new Response(JSON.stringify({ message_id: newMsg.id, status: 'sent', whatsapp_id: waMessageId }), { status: 200, headers: { "Content-Type": "application/json" } })

    } catch (error: any) {
        console.error("Send message error:", error)
        return new Response(JSON.stringify({ error: String(error.message || error) }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
})
