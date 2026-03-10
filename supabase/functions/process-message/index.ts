import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 })

    const authHeader = req.headers.get("Authorization")
    if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
        console.error("Unauthorized request to process-message")
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        const { queueId, payload } = await req.json()
        console.log(`Processing queueId: ${queueId}`)

        // Handle Meta Payload Structure
        // Expected structure: payload.entry[0].changes[0].value.messages[0]
        const entry = payload.entry?.[0]
        const change = entry?.changes?.[0]
        const value = change?.value

        // Status updates (read, delivered, sent) - Can be ignored for now and marked as completed
        if (value?.statuses) {
            await supabase.from('webhook_queue').update({ status: 'completed' }).eq('id', queueId)
            return new Response("Status update processed", { status: 200 })
        }

        const message = value?.messages?.[0]
        const contact = value?.contacts?.[0]
        const metadata = value?.metadata // contains phone_number_id

        if (!message || !metadata) {
            console.log(`Not a user message payload. Marking as completed.`)
            await supabase.from('webhook_queue').update({ status: 'completed' }).eq('id', queueId)
            return new Response("Non-message payload processed", { status: 200 })
        }

        const phoneNumberId = metadata.phone_number_id
        const clientPhone = contact?.wa_id || message.from
        const clientName = contact?.profile?.name || 'Cliente'
        const wamid = message.id
        const msgType = message.type
        // Convert timestamp from unix seconds to timestamp string
        const timestampMs = parseInt(message.timestamp) * 1000
        const timestampStr = isNaN(timestampMs) ? new Date().toISOString() : new Date(timestampMs).toISOString()

        console.log(`Received message type: ${msgType} from ${clientPhone} to ${phoneNumberId} (wamid: ${wamid})`)

        // 1. Find Business
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('id, name')
            .eq('whatsapp_phone_number_id', phoneNumberId)
            .single()

        if (bizError || !business) {
            console.warn(`Business not found for phone_number_id: ${phoneNumberId}`)
            await supabase.from('webhook_queue').update({
                status: 'error',
                error_message: 'Business not found'
            }).eq('id', queueId)
            return new Response("Business not found", { status: 404 })
        }

        // 2. Filtro Determinístico 1: Deduplicación nativa o chequeo explícito
        // Check if message with this wamid already exists
        const { data: existingMsg } = await supabase
            .from('messages')
            .select('id')
            .eq('whatsapp_message_id', wamid)
            .maybeSingle()

        if (existingMsg) {
            console.log(`Duplicate message ${wamid} detected, ignoring.`)
            await supabase.from('webhook_queue').update({
                status: 'completed',
                error_message: 'Duplicate ignored'
            }).eq('id', queueId)
            return new Response("Duplicate ignored", { status: 200 })
        }

        // 3. Find or Create Conversation
        let conversationId

        // We look for any active conversation from this client to this business within the last 24h
        // In our simplified DB, we look for 'active' status
        const { data: activeConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('business_id', business.id)
            .eq('client_phone', clientPhone)
            .eq('status', 'active') // Assuming unresolved
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (activeConv) {
            conversationId = activeConv.id
        } else {
            // Create new conversation
            console.log(`Creating new conversation for phone ${clientPhone}`)
            const { data: newConv, error: convError } = await supabase
                .from('conversations')
                .insert([{
                    business_id: business.id,
                    client_phone: clientPhone,
                    client_name: clientName,
                    status: 'active'
                }])
                .select('id')
                .single()

            if (convError) {
                console.error("Error creating conversation", convError)
                throw convError
            }
            conversationId = newConv.id
        }

        // 4. Extract content & Insert Message
        let msgContent = ''
        if (msgType === 'text') {
            msgContent = message.text?.body || ''
        }

        const { error: msgInsertError } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversationId,
                whatsapp_message_id: wamid,
                direction: 'inbound',
                sender_type: 'client',
                content: msgContent,
                media_type: msgType === 'text' ? null : msgType, // only store if multimedia or just leave msgType
                created_at: timestampStr
            }])

        if (msgInsertError) {
            // 23505 is PostgreSQL unique violation code
            if (msgInsertError.code === '23505') {
                console.log(`Duplicate message ${wamid} caught on unique constraint`)
                await supabase.from('webhook_queue').update({
                    status: 'completed',
                    error_message: 'Duplicate unique constraint'
                }).eq('id', queueId)
                return new Response("Duplicate unique violation", { status: 200 })
            } else {
                console.error("Failed to insert message:", msgInsertError)
                throw msgInsertError
            }
        }

        console.log(`Message ${wamid} stored successfully in conversation ${conversationId}`)

        // 5. Filtro Determinístico 2: Multimedia Escalation
        if (msgType !== 'text') {
            console.log(`Multimedia message received: ${msgType}. Escalating immediately.`)
            await supabase.from('escalations').insert([{
                conversation_id: conversationId,
                level: 'informative',
                reason: `Mensaje multimedia recibido y no procesable automáticamente (${msgType})`,
                status: 'pending'
            }])

            // Stop LLM Flow completely here.
        } else {
            // If it is text, the LLM pipeline would continue here.
            // (LLM pipeline to be built in Block 3.2)
            console.log(`Text message. Ready for LLM pipeline (Block 3.2).`)
        }

        // 6. Mark queue as completed
        await supabase.from('webhook_queue').update({ status: 'completed' }).eq('id', queueId)

        return new Response("Message processed successfully", { status: 200 })

    } catch (error) {
        console.error("Fatal error processing queue message", error)

        // We should safely try to mark the queue as errored if we have queueId available
        try {
            const bodyContent = await req.clone().json().catch(() => ({}));
            if (bodyContent.queueId) {
                await supabase.from('webhook_queue')
                    .update({ status: 'error', error_message: String(error) })
                    .eq('id', bodyContent.queueId);
            }
        } catch (ignore) { }

        return new Response("Internal Server Error", { status: 500 })
    }
})
