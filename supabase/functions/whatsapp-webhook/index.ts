import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// Type declaration for Supabase Edge Runtime global
declare const EdgeRuntime: {
    waitUntil(promise: Promise<unknown>): void
}

const VERIFY_TOKEN = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN") || "agenti-token-seguro-123"
const APP_SECRET = Deno.env.get("WHATSAPP_APP_SECRET") || "6ae8bbe87615bb7dbe368248eb670f2e"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

async function verifySignature(req: Request, rawBody: string): Promise<boolean> {
    const signature = req.headers.get("x-hub-signature-256")
    if (!signature || !APP_SECRET) return false

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(APP_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    )

    const expectedSignature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBody)
    )

    // Convert ArrayBuffer to hex string
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    return `sha256=${expectedHex}` === signature
}

serve(async (req) => {
    // 1. Handle Webhook Verification (GET) from Meta
    if (req.method === "GET") {
        const url = new URL(req.url)
        const mode = url.searchParams.get("hub.mode")
        const token = url.searchParams.get("hub.verify_token")
        const challenge = url.searchParams.get("hub.challenge")

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("Webhook verified successfully!")
            return new Response(challenge, { status: 200 })
        }
        return new Response("Forbidden", { status: 403 })
    }

    // 2. Handle Incoming Messages (POST)
    if (req.method === "POST") {
        try {
            // Must read raw body to verify signature
            const rawBody = await req.text()

            // Verify signature to validate request is from Meta
            const isValid = await verifySignature(req, rawBody)
            if (!isValid) {
                console.error("Invalid webhook signature")
                return new Response("Invalid signature", { status: 403 })
            }

            const payload = JSON.parse(rawBody)

            // Store in webhook_queue for resilience
            const { data: queueObj, error: queueError } = await supabase
                .from('webhook_queue')
                .insert([{ payload, status: 'pending' }])
                .select('id')
                .single()

            if (queueError) {
                console.error("Failed to enqueue webhook", queueError)
                return new Response("Internal Server Error", { status: 500 })
            }

            const queueId = queueObj.id
            console.log(`Payload enqueued as ${queueId}`)

            // trigger process-message function asynchronously
            const invokeProcessMessage = async () => {
                try {
                    const { error } = await supabase.functions.invoke('process-message', {
                        body: { queueId, payload },
                        headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
                    })
                    if (error) {
                        console.error(`Error invoking process-message for queueId ${queueId}`, error)
                        await supabase.from('webhook_queue').update({
                            status: 'error',
                            error_message: `Invocation failed: ${String(error)}`
                        }).eq('id', queueId)
                    } else {
                        console.log(`process-message successfully invoked for queueId ${queueId}`)
                    }
                } catch (err) {
                    console.error(`Exception invoking process-message for queueId ${queueId}`, err)
                    await supabase.from('webhook_queue').update({
                        status: 'error',
                        error_message: `Invocation exception: ${String(err)}`
                    }).eq('id', queueId)
                }
            }

            // Allow background execution without keeping the response pending
            if (typeof EdgeRuntime !== 'undefined' && typeof EdgeRuntime.waitUntil === 'function') {
                EdgeRuntime.waitUntil(invokeProcessMessage())
            } else {
                // Fallback for local testing if EdgeRuntime is not defined
                invokeProcessMessage().catch(console.error)
            }

            // IMPORTANT: Return HTTP 200 immediately back to Meta
            return new Response("OK", { status: 200 })

        } catch (error) {
            console.error("Error processing webhook POST", error)
            return new Response("Internal Server Error", { status: 500 })
        }
    }

    return new Response("Method not allowed", { status: 405 })
})
