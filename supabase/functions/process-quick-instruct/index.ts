import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { callPrimaryLLM } from "../_shared/llm/index.ts"
import { callMultimodalLLM } from "../_shared/multimodal.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Extract JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("AGENTI: No Authorization header found")
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')

    // 2. Create service role client and verify user with their token
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error("AGENTI: Auth failed:", authError?.message || "No user")
      return new Response(JSON.stringify({
        error: 'auth_failed',
        message: authError?.message || 'No user session found',
        hint: 'Intenta cerrar sesión y volver a entrar.'
      }), { status: 401, headers: corsHeaders })
    }

    // 3. Secrets check
    const geminiKey = Deno.env.get("LLM_PRIMARY_API_KEY")
    if (!geminiKey) {
      console.error("AGENTI: LLM_PRIMARY_API_KEY not found")
      return new Response(JSON.stringify({ error: 'llm_key_missing', message: 'LLM API Key not configured' }), { status: 500, headers: corsHeaders })
    }

    // 4. Parse body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error("AGENTI: Invalid JSON body:", e)
      return new Response(JSON.stringify({ error: 'invalid_body', message: 'Invalid JSON body' }), { status: 400, headers: corsHeaders })
    }

    const { content, type, business_id, audioBase64, fileBase64, mimeType } = body

    // 5. Verify ownership
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', business_id)
      .eq('owner_id', user.id)
      .single()

    if (bizError || !business) {
      console.error("AGENTI: Business not found:", bizError?.message)
      return new Response(JSON.stringify({ error: 'business_not_found', message: 'Business not found or unauthorized' }), { status: 404, headers: corsHeaders })
    }

    // 6. Load existing topics so LLM can reuse them instead of inventing new ones
    const { data: existingTopics } = await supabase
      .from('competency_topics')
      .select('name')
      .eq('business_id', business_id)

    const topicsList = existingTopics && existingTopics.length > 0
      ? existingTopics.map((t: { name: string }) => `"${t.name}"`).join(', ')
      : 'ninguno aún'

    const typeLabel = type === 'voice_note' ? 'nota de voz' : type === 'pdf' ? 'documento PDF' : type === 'image_ocr' ? 'imagen' : 'texto'
    const isMultimodal = (type === 'voice_note' && audioBase64) || ((type === 'image_ocr' || type === 'pdf') && fileBase64)

    // 7. Build system prompt
    const systemPromptBase = `Eres el Gerente de Inteligencia de AGENTI.
Tu tarea es transformar una instrucción informal del dueño de un negocio en un ítem de conocimiento estructurado (KnowledgeItem).

TEMAS EXISTENTES DEL NEGOCIO: ${topicsList}
REGLA CRÍTICA: Si el contenido encaja en uno de los temas existentes, usa ESE NOMBRE EXACTAMENTE como aparece arriba. Solo crea un nombre nuevo si el contenido no encaja en ninguno de los temas existentes.

REGLAS DE TRANSFORMACIÓN:
1. Analiza el contenido (texto, transcripción de voz, o descripción de media).
2. Clasifica el contenido en una de las 4 capas de conocimiento:
   - 'structured': Datos fijos (horarios, precios, dirección).
   - 'operational': Políticas, procesos, "cómo hacemos las cosas".
   - 'narrative': Tono de voz, descripciones, instrucciones de comportamiento.
   - 'learned': Hechos específicos aprendidos de la interacción.

FORMATO DE SALIDA (JSON):
{
  "content": "string (el contenido limpio y bien redactado)",
  "layer": "structured" | "operational" | "narrative" | "learned",
  "topic": "string (nombre EXACTO de un tema existente, o uno nuevo si no encaja en ninguno)",
  "metadata": {
    "confidence": number (0-1),
    "requires_verification": boolean,
    "source_type": "quick_instruct"
  },
  "justification": "string (breve explicación de por qué lo clasificaste así)"
}`

    const systemPrompt = isMultimodal
      ? `${systemPromptBase}\n\nEl dueño del negocio ha enviado una ${typeLabel}. Analiza su contenido y genera la propuesta.`
      : `${systemPromptBase}\n\nInstrucción del dueño (${typeLabel}): ${content}`

    // 8. Call LLM (multimodal or text)
    let llmContent: string
    if (isMultimodal) {
      const mediaBase64 = type === 'voice_note' ? audioBase64 : fileBase64
      const mediaKind: 'audio' | 'image' = type === 'voice_note' ? 'audio' : 'image'
      llmContent = await callMultimodalLLM(systemPrompt, mediaBase64, mimeType, mediaKind)
    } else {
      const llmResponse = await callPrimaryLLM(systemPrompt, "Genera la propuesta estructurada ahora.", { responseFormat: "json_object" })
      llmContent = llmResponse.content
    }

    let proposal
    try {
      proposal = JSON.parse(llmContent)
    } catch (e) {
      console.error("AGENTI: JSON Parse Error", llmContent)
      throw new Error("Error procesando la respuesta de la IA")
    }

    return new Response(JSON.stringify({ proposal }), { headers: corsHeaders, status: 200 })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("AGENTI: Catch general:", msg)
    return new Response(JSON.stringify({ error: 'internal_error', message: msg }), {
      headers: corsHeaders,
      status: 400,
    })
  }
})
