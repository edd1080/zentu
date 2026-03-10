const fs = require('fs');
const crypto = require('crypto');

const APP_SECRET = "6ae8bbe87615bb7dbe368248eb670f2e";
const SUPABASE_PROJECT_URL = "https://rutzgbwziinixdrryirv.supabase.co";

function generateSignature(payloadStr) {
    const hmac = crypto.createHmac('sha256', APP_SECRET);
    hmac.update(payloadStr);
    return `sha256=${hmac.digest('hex')}`;
}

async function sendTest(messageBody) {
    const mockPayload = {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "123456789",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                        "display_phone_number": "1234567890",
                        "phone_number_id": "simulated_phone_id"
                    },
                    "contacts": [{
                        "profile": { "name": "Simulated User" },
                        "wa_id": "50233445566"
                    }],
                    "messages": [{
                        "from": "50233445566",
                        "id": `wamid.HBgL${Math.random().toString(36).substring(7)}`,
                        "timestamp": Math.floor(Date.now() / 1000).toString(),
                        "type": "text",
                        "text": { "body": messageBody }
                    }]
                },
                "field": "messages"
            }]
        }]
    };

    const payloadStr = JSON.stringify(mockPayload);
    const signature = generateSignature(payloadStr);

    console.log(`\nTesting: "${messageBody}"`);
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
        console.log(`Response: ${res.status} - ${await res.text()}`);
        console.log(`Latency: ${Math.round(endTime - startTime)}ms`);
    } catch (e) {
        console.error("Failed to connect to edge function server.", e);
    }
}

async function runTests() {
    // 1. Emergency Case (Trigger deterministic filter)
    await sendTest("Tengo una emergencia médica por una intoxicación.");

    // 2. High Confidence Case (Assume context available for "Cafe EB")
    await sendTest("¿A qué hora abren?");

    // 3. Out of Bounds (Trigger Informative Escalation via LLM)
    await sendTest("Explícame la teoría de la relatividad general.");
}

runTests();
