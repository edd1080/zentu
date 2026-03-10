import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { callPrimaryLLM } from "@/lib/llm";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Auth check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: business } = await supabase
            .from("businesses")
            .select("id, name, industry, description, address, schedule")
            .eq("owner_id", user.id)
            .single();

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const body = await request.json();
        const { messages } = body; // Array of { role, content }

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
        }

        // 2. Fetch Knowledge (Brain Context)
        const { data: kiData, error: kiError } = await supabase
            .from("knowledge_items")
            .select("content, source_id")
            .eq("business_id", business.id)
            .eq("active", true);

        if (kiError) {
            console.error("Knowledge fetch error:", kiError);
        }

        const knowledgeContext = kiData && kiData.length > 0
            ? kiData.map(k => `- ${k.content}`).join("\n")
            : "";

        let formattedSchedule = "No especificados";
        if (business.schedule) {
            if (typeof business.schedule === 'object') {
                formattedSchedule = JSON.stringify(business.schedule, null, 2);
            } else {
                formattedSchedule = String(business.schedule);
            }
        }

        const fullContext = `
INFORMACIÓN PRINCIPAL DEL NEGOCIO:
- Nombre: ${business.name}
- Descripción: ${business.description || 'No especificada'}
- Dirección: ${business.address || 'No especificada'}
- Horarios de Atención:
${formattedSchedule}

CONOCIMIENTO ADICIONAL (Servicios, productos, reglas):
${knowledgeContext || 'Ninguno'}
        `.trim();

        // 3. Build System Prompt
        const systemPrompt = `
Eres AGENTI, el asistente virtual automatizado para el negocio: "${business.name}" (Industria: ${business.industry}).
Tu objetivo principal es responder a los clientes de forma amable y concisa utilizando ÚNICAMENTE la siguiente base de conocimiento proporcionada por el dueño.

REGLAS ESTRICTAS:
1. Usa lenguaje natural, directo, y con el tono adecuado.
2. Si te preguntan algo que NO está en el contexto, responde amablemente que no tienes esa información y que un humano los atenderá pronto (simulando un escalamiento).
3. Eres un bot de chat en WhatsApp, usa respuestas muy cortas y amables, máximo 2-3 oraciones breves.

BASE DE CONOCIMIENTO DEL NEGOCIO:
${fullContext}
`;

        // 4. Build User Prompt (Conversation History)
        const chatHistory = messages.map((m: any) => `${m.role === "user" ? "Cliente" : "Agente"}: ${m.content}`).join("\n");
        const userPrompt = `
Historial de la conversación reciente:
${chatHistory}

Proporciona la siguiente respuesta del "Agente":
`;

        // 5. Call LLM
        const llmResponse = await callPrimaryLLM(userPrompt, systemPrompt, { temperature: 0.2, maxTokens: 400 });

        // Clean up any strict formatting the LLM might add, like "Agente: "
        let cleanContent = llmResponse.content.trim();
        if (cleanContent.startsWith("Agente:")) {
            cleanContent = cleanContent.replace(/^Agente:\s*/i, "");
        }

        return NextResponse.json({ success: true, response: cleanContent });

    } catch (err: any) {
        console.error("POST /api/agent/chat error:", err);
        return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
    }
}
