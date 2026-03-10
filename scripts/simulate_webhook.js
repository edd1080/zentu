const fs = require('fs');
const crypto = require('crypto');

const APP_SECRET = "test_secret_for_local";
const SUPABASE_PROJECT_URL = "https://rutzgbwziinixdrryirv.supabase.co";

function generateSignature(payloadStr) {
    const hmac = crypto.createHmac('sha256', APP_SECRET);
    hmac.update(payloadStr);
    return `sha256=${hmac.digest('hex')}`;
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
                            "phone_number_id": "simulated_phone_id"
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
const signature = generateSignature(payloadStr);

async function runSimulator() {
    console.log(`Sending Payload to Edge Function ${SUPABASE_PROJECT_URL}/functions/v1/whatsapp-webhook`);
    const startTime = performance.now();
    try {
        const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/whatsapp-webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Hub-Signature-256": signature
            },
            body: payloadStr
        });
        const endTime = performance.now();
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
