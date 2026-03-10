// scripts/test_webhook_local.ts
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Utility to run simulator
async function runSimulator() {
    const env = await load({ envPath: ".env.local" });
    const APP_SECRET = env["WHATSAPP_APP_SECRET"] || "test_secret_for_local";
    const SUPABASE_PROJECT_URL = env["NEXT_PUBLIC_SUPABASE_URL"] || "https://rutzgbwziinixdrryirv.supabase.co";

    async function generateSignature(payloadStr: string): Promise<string> {
        const encoder = new TextEncoder()
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(APP_SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        )
        const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadStr))
        const hex = Array.from(new Uint8Array(signatureBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        return `sha256=${hex}`
    }

    const mockPayload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "123456789",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "1234567890",
                                "phone_number_id": "848821958315147" // Hardcoded business phone number ID from one of the active businesses in DB! (We need a valid one to not get 404, we'll try this one or you can replace it in the script) 
                            },
                            "contacts": [
                                {
                                    "profile": { "name": "Simulated User" },
                                    "wa_id": "50233445566"
                                }
                            ],
                            "messages": [
                                {
                                    "from": "50233445566",
                                    "id": `wamid.HBgL${Math.random().toString(36).substring(7)}`,
                                    "timestamp": Math.floor(Date.now() / 1000).toString(),
                                    "type": "text",
                                    "text": {
                                        "body": "Hola, ¿cómo estás hoy?"
                                    }
                                }
                            ]
                        },
                        "field": "messages"
                    }
                ]
            }
        ]
    };

    const payloadStr = JSON.stringify(mockPayload);
    const signature = await generateSignature(payloadStr);

    console.log(`Sending Payload to Edge Function ${SUPABASE_PROJECT_URL}/functions/v1/whatsapp-webhook`);
    const startTime = performance.now()
    try {
        const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/whatsapp-webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Hub-Signature-256": signature
            },
            body: payloadStr
        });
        const endTime = performance.now()
        console.log(`Response status: ${res.status}`);
        console.log(`Response text: ${await res.text()}`);
        console.log(`Latency: ${Math.round(endTime - startTime)}ms`);

        if (Math.round(endTime - startTime) > 500) {
            console.log("⚠️ WARNING: Latency exceeded 500ms!");
        } else {
            console.log("✅ Latency requirement met (< 500ms)!");
        }
    } catch (e) {
        console.error("Failed to connect to edge function server.", e)
    }
}

runSimulator();
