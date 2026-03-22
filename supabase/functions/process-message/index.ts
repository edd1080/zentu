import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { callPrimaryLLM } from "../_shared/llm/index.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req: Request) => {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 })

    const authHeader = req.headers.get("Authorization")
    const apikey = req.headers.get("apikey")
    if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` && apikey !== SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Unauthorized request to process-message")
        return new Response("Unauthorized", { status: 401 })
    }

    let queueId: string | undefined

    try {
        const body = await req.json()
        queueId = body.queueId
        const payload = body.payload
        console.log(`Processing queueId: ${queueId}`)

        // Handle Meta Payload Structure
        const entry = payload.entry?.[0]
        const change = entry?.changes?.[0]
        const value = change?.value

        // Status updates (read, delivered, sent)
        if (value?.statuses) {
            if (queueId) await supabase.from('webhook_queue').update({ status: 'completed' }).eq('id', queueId)
            return new Response("Status update processed", { status: 200 })
        }

        const message = value?.messages?.[0]
        const contact = value?.contacts?.[0]
        const metadata = value?.metadata // contains phone_number_id

        if (!message || !metadata) {
            console.log(`Not a user message payload. Marking as completed.`)
            if (queueId) await supabase.from('webhook_queue').update({ status: 'completed' }).eq('id', queueId)
            return new Response("Non-message payload processed", { status: 200 })
        }

        const phoneNumberId = metadata.phone_number_id
        const clientPhone = contact?.wa_id || message.from
        const clientName = contact?.profile?.name || 'Cliente'
        const wamid = message.id
        const msgType = message.type
        const timestampMs = parseInt(message.timestamp) * 1000
        const timestampStr = isNaN(timestampMs) ? new Date().toISOString() : new Date(timestampMs).toISOString()

        console.log(`Received message type: ${msgType} from ${clientPhone} to ${phoneNumberId} (wamid: ${wamid})`)

        // 1. Find Business & Owner
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('id, name, owner_id')
            .eq('whatsapp_phone_number_id', phoneNumberId)
            .single()

        if (bizError || !business) {
            console.warn(`Business not found for phone_number_id: ${phoneNumberId}`)
            if (queueId) await supabase.from('webhook_queue').update({
                status: 'error',
                error_message: 'Business not found'
            }).eq('id', queueId)
            return new Response("Business not found", { status: 404 })
        }

        // 2. Deduplication
        const { data: existingMsg } = await supabase
            .from('messages')
            .select('id')
            .eq('whatsapp_message_id', wamid)
            .maybeSingle()

        if (existingMsg) {
            console.log(`Duplicate message ${wamid} detected, ignoring.`)
            if (queueId) await supabase.from('webhook_queue').update({
                status: 'completed',
                error_message: 'Duplicate ignored'
            }).eq('id', queueId)
            return new Response("Duplicate ignored", { status: 200 })
        }

        // 3. Find or Create Conversation
        let conversationId: string
        const { data: activeConv } = await supabase
            .from('conversations')
            .select('id, status')
            .eq('business_id', business.id)
            .eq('client_phone', clientPhone)
            .neq('status', 'archived')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (activeConv) {
            conversationId = activeConv.id
            // Reopen if resolved so the UI knows it needs attention again
            if (activeConv.status === 'resolved') {
                await supabase.from('conversations').update({ status: 'active' }).eq('id', conversationId)
            }
        } else {
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
                // 23505 = unique_violation: race condition — another process created the conversation first
                if (convError.code === '23505') {
                    console.log(`Race condition detected for phone ${clientPhone}, re-fetching conversation`)
                    const { data: racedConv, error: fetchErr } = await supabase
                        .from('conversations')
                        .select('id')
                        .eq('business_id', business.id)
                        .eq('client_phone', clientPhone)
                        .neq('status', 'archived')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()
                    if (fetchErr || !racedConv) throw fetchErr || new Error('Could not create or find conversation')
                    conversationId = racedConv.id
                } else {
                    throw convError
                }
            } else {
                conversationId = newConv!.id
            }
        }

        // 4. Insert Message
        let msgContent = msgType === 'text' ? (message.text?.body || '') : ''
        const { error: msgInsertError } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversationId,
                whatsapp_message_id: wamid,
                direction: 'inbound',
                sender_type: 'client',
                content: msgContent,
                media_type: msgType === 'text' ? null : msgType,
                created_at: timestampStr
            }])

        if (msgInsertError) {
            if (msgInsertError.code === '23505') {
                if (queueId) await supabase.from('webhook_queue').update({ status: 'completed', error_message: 'Duplicate unique constraint' }).eq('id', queueId)
                return new Response("Duplicate unique violation", { status: 200 })
            }
            throw msgInsertError
        }

        // Update last_message_at on the conversation so dashboard ordering is correct
        await supabase.from('conversations')
            .update({ last_message_at: timestampStr })
            .eq('id', conversationId)

        // Notification Info Fetch
        const { data: owner } = await supabase.from('owners').select('id, onesignal_id').eq('id', business.owner_id).single()
        const ownerOneSignalId = owner?.onesignal_id

        // 5. Context & Timing (Night Silence)
        const now = new Date()
        const hour = now.getHours()
        const isNight = hour >= 22 || hour < 7
        
        // 6. Emergency Keyword Filter (Deterministic Phase)
        const emergencyKeywords = ['urgente', 'emergencia', 'intoxicación', 'accidente', 'queja', 'robo', 'denuncia']
        const hasEmergency = emergencyKeywords.some(kw => msgContent.toLowerCase().includes(kw))

        if (hasEmergency && msgType === 'text') {
            await supabase.from('webhook_queue').update({ error_message: 'TRACE: Emergency keyword detected' }).eq('id', queueId!)
            const { error: insErr } = await supabase.from('escalations').insert([{
                business_id: business.id,
                conversation_id: conversationId,
                level: 'urgent',
                reason: `Palabra clave de emergencia detectada en: "${msgContent}"`,
                containment_message_sent: true,
                status: 'active'
            }])
            if (insErr) throw insErr
            
            // Mark conversation as escalated_urgent
            await supabase.from('conversations').update({ status: 'escalated_urgent' }).eq('id', conversationId)

            // Send immediate containment message
            await supabase.functions.invoke('send-message', {
                body: { conversation_id: conversationId, content: "Hemos registrado tu caso como urgente y un miembro de nuestro equipo lo revisará a la brevedad.", sender_type: 'system' },
                headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
            })
            
            // Trigger immediate push notification
            if (ownerOneSignalId) {
                // Urgent bypasses night silence, otherwise check timing
                if (isNight) {
                    console.log(`[PUSH] Night silence active, but bypassing for EMERGENCY in business ${business.id}`)
                }

                await supabase.functions.invoke('send-notification', {
                    body: { 
                        owner_id: business.owner_id, 
                        title: `🚨 URGENTE: ${business.name}`, 
                        body: `Mensaje de emergencia: "${msgContent.substring(0, 50)}..."`,
                        action_url: `${SUPABASE_URL?.replace('.supabase.co', '')}/dashboard` // Fallback URL or dashboard
                    },
                    headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
                })
                await supabase.from('escalations').update({ notified_push_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('status', 'active')
            }
            
            if (queueId) await supabase.from('webhook_queue').update({ status: 'completed' }).eq('id', queueId)
            return new Response("Emergency escalation processed", { status: 200 })
        }

        // 6.2 Passive Inbound Notification (for normal activity tracking)
        if (ownerOneSignalId && !isNight && !hasEmergency) {
             await supabase.functions.invoke('send-notification', {
                body: { 
                    owner_id: business.owner_id, 
                    title: `📥 Actividad: ${business.name}`, 
                    body: `${clientName} envió un mensaje. AGENTI está revisando.`,
                    action_url: "http://localhost:3001/dashboard"
                },
                headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
            })
        }

        // Night Silence bypass check
        if (isNight && !hasEmergency) {
            console.log("Night silence active. Delaying/Silencing non-urgent response suggestion generation.")
            // For now, we still process to have the suggestion ready, 
            // but in a real prod app we might flag the suggestion to 'silent_notification: true'
        }

        // 6. Multimedia Escalation
        if (msgType !== 'text') {
            await supabase.from('webhook_queue').update({ error_message: 'TRACE: Inserting Multi-Escalation' }).eq('id', queueId!)
            const { error: insErr } = await supabase.from('escalations').insert([{
                business_id: business.id,
                conversation_id: conversationId,
                level: 'informative',
                reason: `Mensaje multimedia recibido (${msgType})`,
                containment_message_sent: true,
                status: 'active'
            }])
            if (insErr) throw insErr

            // Send fallback message for multimedia
            await supabase.functions.invoke('send-message', {
                body: { conversation_id: conversationId, content: "Recibimos tu mensaje. Te atenderemos pronto.", sender_type: 'system' },
                headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
            })
        } else {
            // 7. LLM Pipeline
            await supabase.from('webhook_queue').update({ error_message: 'TRACE: LLM Pipeline Start' }).eq('id', queueId!)

            // Fetch/Build Context
            let { data: contextCache, error: cacheError } = await supabase
                .from('agent_context_cache')
                .select('context_string, updated_at')
                .eq('business_id', business.id)
                .single()

            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
            if (cacheError || !contextCache || new Date(contextCache.updated_at) < oneHourAgo) {
                await supabase.from('webhook_queue').update({ error_message: 'TRACE: Rebuilding context' }).eq('id', queueId!)
                await supabase.functions.invoke('build-agent-context', { body: { business_id: business.id } })
                const { data: nCache, error: nCacheErr } = await supabase.from('agent_context_cache').select('context_string').eq('business_id', business.id).single()
                if (nCacheErr) throw nCacheErr
                contextCache = nCache
            }

            // History
            const { data: historyData, error: hErr } = await supabase
                .from('messages')
                .select('sender_type, content')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(6)

            if (hErr) throw hErr

            const historyBlock = (historyData || []).reverse().map((m: any) => `${m.sender_type.toUpperCase()}: ${m.content}`).join('\n')

            const outputFormat = `
=== INSTRUCCIÓN DE SALIDA ===
Responde ÚNICAMENTE con un objeto JSON válido. Sin explicaciones.
{
  "should_respond": boolean (true si hay info suficiente),
  "response": "string (la respuesta amigable si should_respond es true)",
  "had_sufficient_context": boolean,
  "confidence_basis": "direct_knowledge" | "inference" | "template",
  "detected_intent": "snake_case_intent",
  "detected_intent_label": "Nombre del Intento",
  "escalation_needed": boolean,
  "escalation_level": "informative" | "sensitive" | "urgent" | null,
  "escalation_reason": "string o null"
}
CLIENTE: ${msgContent}`

            await supabase.from('webhook_queue').update({ error_message: 'TRACE: Calling Gemini' }).eq('id', queueId!)
            const llmResponse = await callPrimaryLLM(contextCache!.context_string, historyBlock + '\n' + outputFormat, { responseFormat: "json_object" })

            let agentOutput: any
            try {
                let cleanJson = llmResponse.content.trim().replace(/^```json/, '').replace(/```$/, '').trim()
                agentOutput = JSON.parse(cleanJson)
            } catch {
                agentOutput = { should_respond: false, had_sufficient_context: false, escalation_needed: true, escalation_level: 'informative', escalation_reason: "Error parsing LLM output" }
            }

            // 8. Calculation & Guardrails (Simulated for prices/schedules)
            let confidenceTier: 'high' | 'medium' | 'low' = 'low'
            let confidenceScore = 0.3

            if (agentOutput.had_sufficient_context && agentOutput.confidence_basis === 'direct_knowledge') {
                confidenceTier = 'high'
                confidenceScore = 0.95
            } else if (agentOutput.confidence_basis === 'inference') {
                confidenceTier = 'medium'
                confidenceScore = 0.65
            }

            // Simple price guardrail: if response has a number with Q/$/decimal but no context used, drop to low
            if (confidenceTier === 'high' && /Q\d+|\$\d+/.test(agentOutput.response) && !agentOutput.had_sufficient_context) {
                confidenceTier = 'low'
                confidenceScore = 0.4
            }

            // 9. Entities Insertion
            if (agentOutput.escalation_needed || agentOutput.should_respond === false) {
                await supabase.from('webhook_queue').update({ error_message: 'TRACE: Inserting Escalation' }).eq('id', queueId!)
                const isContainment = agentOutput.escalation_level === 'urgent' || agentOutput.escalation_level === 'sensitive'
                const { error: insErr } = await supabase.from('escalations').insert([{
                    business_id: business.id,
                    conversation_id: conversationId,
                    level: agentOutput.escalation_level || 'informative',
                    reason: agentOutput.escalation_reason || agentOutput.confidence_basis || 'Falta de contexto',
                    containment_message_sent: isContainment,
                    status: 'active',
                    metadata: { detected_intent: agentOutput.detected_intent }
                }])
                if (insErr) throw insErr

                // Update conversation status
                await supabase.from('conversations').update({ 
                    status: `escalated_${agentOutput.escalation_level || 'informative'}` 
                }).eq('id', conversationId)

                if (isContainment) {
                    const containmentText = agentOutput.escalation_level === 'urgent' ? 
                        "Hemos registrado tu caso como urgente y un miembro de nuestro equipo lo revisará a la brevedad." : 
                        "Estamos revisando tu consulta y te responderemos de forma personalizada en breve."
                    await supabase.functions.invoke('send-message', {
                        body: { conversation_id: conversationId, content: containmentText, sender_type: 'system' },
                        headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
                    })

                    // Trigger immediate push notification for LLM detected escalation
                    if (ownerOneSignalId) {
                        const isUrgent = agentOutput.escalation_level === 'urgent'
                        
                        // Only send if NOT night or if URGENT
                        if (!isNight || isUrgent) {
                            const levelEmoji = isUrgent ? '🚨' : '⚠️'
                            await supabase.functions.invoke('send-notification', {
                                body: { 
                                    owner_id: business.owner_id, 
                                    title: `${levelEmoji} Escalamiento: ${business.name}`, 
                                    body: agentOutput.escalation_reason || "Nueva consulta requiere tu atención.",
                                    action_url: "http://localhost:3001/dashboard"
                                },
                                headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
                            })
                            await supabase.from('escalations').update({ notified_push_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('status', 'active')
                        } else {
                            console.log(`[PUSH] Silencing '${agentOutput.escalation_level}' escalation push due to night hours.`)
                        }
                    }
                }
            } else {
                // Check for active autonomy rule (autonomous_with_guardrails)
                const { data: autonomyRules } = await supabase
                    .from('autonomy_rules')
                    .select('id')
                    .eq('business_id', business.id)
                    .eq('active', true)
                    .eq('level', 'autonomous_with_guardrails')
                    .limit(1)

                const hasAutonomy = (autonomyRules?.length ?? 0) > 0
                const shouldAutoSend = hasAutonomy && confidenceTier === 'high'

                await supabase.from('webhook_queue').update({ error_message: 'TRACE: Inserting Suggestion' }).eq('id', queueId!)
                const { error: insErr } = await supabase.from('suggestions').insert([{
                    business_id: business.id,
                    conversation_id: conversationId,
                    content: agentOutput.response,
                    confidence: confidenceScore,
                    confidence_tier: confidenceTier,
                    status: shouldAutoSend ? 'auto_sent' : 'pending',
                    metadata: {
                        detected_intent: agentOutput.detected_intent,
                        detected_intent_label: agentOutput.detected_intent_label,
                        knowledge_items_used: agentOutput.knowledge_items_used
                    }
                }])
                if (insErr) throw insErr

                if (shouldAutoSend) {
                    // Send message directly to client and resolve conversation
                    await supabase.functions.invoke('send-message', {
                        body: { conversation_id: conversationId, content: agentOutput.response, sender_type: 'agent' },
                        headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
                    })
                    await supabase.from('conversations').update({
                        status: 'resolved',
                        resolved_by: 'agent_autonomous',
                        last_message_at: new Date().toISOString(),
                    }).eq('id', conversationId)
                } else {
                    // Collaborator mode: queue for owner approval
                    await supabase.from('conversations').update({
                        status: 'pending_approval'
                    }).eq('id', conversationId)

                    // Push notification for Suggestion
                    if (ownerOneSignalId && !isNight) {
                        await supabase.functions.invoke('send-notification', {
                            body: {
                                owner_id: business.owner_id,
                                title: `💬 Sugerencia: ${business.name}`,
                                body: `AGENTI preparó una respuesta para ${clientName}.`,
                                action_url: "http://localhost:3001/dashboard"
                            },
                            headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
                        })
                    }
                }
            }
        }

        if (queueId) await supabase.from('webhook_queue').update({ status: 'completed' }).eq('id', queueId)
        return new Response("OK", { status: 200 })


    } catch (error) {
        console.error("Fatal error", error)
        if (queueId) {
            await supabase.from('webhook_queue').update({
                status: 'error',
                error_message: String(error.stack || error.message || error)
            }).eq('id', queueId)
        }
        return new Response("Error", { status: 500 })
    }
})
