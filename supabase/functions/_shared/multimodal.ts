export async function callMultimodalLLM(
  systemPrompt: string,
  mediaBase64: string,
  mediaMimeType: string,
  mediaKind: 'audio' | 'image' | 'pdf'
): Promise<string> {
  const apiKey = Deno.env.get("LLM_PRIMARY_API_KEY")
  if (!apiKey) throw new Error("LLM_PRIMARY_API_KEY is not set")

  // PDFs require a model that supports them natively (Gemini). Images/audio use the primary model.
  const isPdf = mediaKind === 'pdf'
  const model = isPdf
    ? (Deno.env.get("LLM_MULTIMODAL_MODEL") || "google/gemini-2.0-flash-001")
    : (Deno.env.get("LLM_PRIMARY_MODEL") || "google/gemini-2.5-flash")

  const userContent: unknown[] = []

  if (mediaKind === 'audio') {
    userContent.push({
      type: "input_audio",
      input_audio: { data: mediaBase64, format: mediaMimeType.split('/')[1] || 'webm' }
    })
  } else {
    // Both images and PDFs use image_url format; Gemini supports PDF mime type natively
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${mediaMimeType};base64,${mediaBase64}` }
    })
  }

  userContent.push({
    type: "text",
    text: "Analiza el contenido multimedia y genera la propuesta estructurada."
  })

  // PDFs and images may need more tokens to summarize rich content
  const maxTokens = isPdf ? 1200 : 800

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    temperature: 0.3,
    max_tokens: maxTokens,
    response_format: { type: "json_object" }
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://zentu.chat",
      "X-Title": "Zentu-Primary"
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Multimodal LLM failed: ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content || ""
  // Strip markdown fences in case the model wraps JSON in ```json ... ```
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
}
