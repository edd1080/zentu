export async function callMultimodalLLM(
  systemPrompt: string,
  mediaBase64: string,
  mediaMimeType: string,
  mediaKind: 'audio' | 'image'
): Promise<string> {
  const apiKey = Deno.env.get("LLM_PRIMARY_API_KEY")
  if (!apiKey) throw new Error("LLM_PRIMARY_API_KEY is not set")

  const model = Deno.env.get("LLM_PRIMARY_MODEL") || "google/gemini-2.5-flash"

  const userContent: unknown[] = []

  if (mediaKind === 'audio') {
    userContent.push({
      type: "input_audio",
      input_audio: { data: mediaBase64, format: mediaMimeType.split('/')[1] || 'webm' }
    })
  } else {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${mediaMimeType};base64,${mediaBase64}` }
    })
  }

  userContent.push({
    type: "text",
    text: "Analiza el contenido multimedia y genera la propuesta estructurada."
  })

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    temperature: 0.3,
    max_tokens: 600,
    response_format: { type: "json_object" }
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://agenti.sh",
      "X-Title": "AGENTI-Primary"
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Multimodal LLM failed: ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ""
}
