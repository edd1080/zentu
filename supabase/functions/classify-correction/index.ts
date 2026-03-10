import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { callFastLLM } from "../_shared/llm/index.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req: Request) => {
    // Internal function generally, use service role check
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) return new Response('Unauthorized', { status: 401 })

    try {
        const { suggestion_id, source_id, business_id, original_response, corrected_response, intent } = await req.json()

        const prompt = `
Dado que un asistente de negocios propuso esta respuesta: "${original_response}"
Y el dueño del negocio la corrigió con: "${corrected_response}"
En el contexto de una consulta sobre: "${intent || 'desconocido'}"

Extrae el dato de negocio específico que el dueño está corrigiendo o agregando.
Exprésalo como un hecho concreto del negocio, no como una respuesta a un cliente.
Determina si pertenece a: structured (dato preciso verificable), operational (regla de comportamiento), narrative (descripción o tono), o learned (respuesta aprendida para este tipo de consulta).

Responde solo con JSON:
{
  "abstracted_content": "[el dato como hecho concreto del negocio]",
  "suggested_layer": "structured|operational|narrative|learned",
  "confidence": [0.0 a 1.0 de qué tan claro es el dato extraído]
}`

        const llmResponse = await callFastLLM("Eres un analista de datos expertos.", prompt, { responseFormat: "json_object" })
        
        let parsed: any
        try {
            parsed = JSON.parse(llmResponse.content.trim().replace(/^```json/, '').replace(/```$/, '').trim())
        } catch {
            throw new Error("Failed to parse LLM response")
        }

        let layer = parsed.suggested_layer
        let content = parsed.abstracted_content
        let isConfirmed = false

        // Validation Rules
        if (parsed.confidence < 0.7) {
            content = corrected_response // Fallback to literal text
            layer = 'learned'
            isConfirmed = true // needs explicit review by owner later
        } else {
            // simple check: if contains numbers -> structured
            if (/\d/.test(content)) layer = 'structured'
            // if contains "no", "nunca", "siempre" -> operational
            if (/(?:\b|')(nunca|no|siempre|prohibido|jamás)(?:\b|')/i.test(content)) layer = 'operational'
        }

        // Insert Knowledge Item
        const { error: insErr } = await supabase.from('knowledge_items').insert([{
            business_id,
            source_id,
            layer,
            content,
            validity: 'permanent', // we log it as permanent initially, owner has 5s to change it on frontend, but standard is permanent unless frontend sends an update call
            confirmed_by_owner: isConfirmed // false if AI extracted, true if manual fallback
        }])

        if (insErr) throw insErr

        // Invalidate cache
        await supabase.from('agent_context_cache').delete().eq('business_id', business_id)

        return new Response(JSON.stringify({ success: true, layer, content }), { status: 200, headers: { "Content-Type": "application/json" } })

    } catch (error: any) {
        console.error("Error in classify-correction:", error)
        return new Response(JSON.stringify({ error: String(error.message || error) }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
})
