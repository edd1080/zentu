import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const audioFile = formData.get("audio") as File;

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        // Convert file to array buffer and then to base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString("base64");

        // Perform a one-off fetch to Gemini to avoid breaking the global LLM adapter layer
        // which currently only supports text parts.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("GEMINI_API_KEY not set for voice transcription. Falling back.");
            return NextResponse.json(
                { text: "(Simulación de transcripción, falta API KEY de Gemini)" },
                { status: 200 }
            );
        }

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: "Eres un asistente de transcripción experto. Tu única tarea es escuchar el audio proporcionado y transcribirlo a texto exacto, corrigiendo pequeñas disfluencias pero manteniendo el sentido. Solo devuelve la transcripción directa sin introducciones ni comentarios extras." }]
                    },
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    inlineData: {
                                        mimeType: audioFile.type || "audio/webm",
                                        data: base64Audio
                                    }
                                },
                                {
                                    text: "Por favor transcribe este audio."
                                }
                            ]
                        }
                    ]
                })
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Gemini API returned ${res.status}`);
        }

        const data = await res.json();
        const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return NextResponse.json({ text: transcript });
    } catch (err) {
        console.error("POST /api/onboarding/voice error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
