export interface LLMOptions {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "json_object" | "text";
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    latencyMs?: number;
}

/**
 * Calls the Primary LLM (Gemini 2.5 Flash by default) for heavy tasks like generating suggestions.
 * Designed to return structured JSON.
 */
export async function callPrimaryLLM(systemPrompt: string, userPrompt: string, options?: LLMOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const apiKey = Deno.env.get("LLM_PRIMARY_API_KEY");
    if (!apiKey) throw new Error("LLM_PRIMARY_API_KEY is not set");

    const modelParams = {
        model: Deno.env.get("LLM_PRIMARY_MODEL") || "gemini-2.5-flash",
        temperature: options?.temperature ?? (Number(Deno.env.get("LLM_PRIMARY_TEMPERATURE")) || 0.3),
        maxTokens: options?.maxTokens ?? (Number(Deno.env.get("LLM_PRIMARY_MAX_TOKENS")) || 600),
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelParams.model}:generateContent?key=${apiKey}`;

    const payload = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [{
            role: "user",
            parts: [{ text: userPrompt }]
        }],
        generationConfig: {
            temperature: modelParams.temperature,
            maxOutputTokens: modelParams.maxTokens,
            responseMimeType: options?.responseFormat === "json_object" ? "application/json" : "text/plain"
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API Error: ${response.status} - ${errorText}`);
        throw new Error(`Primary LLM failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const usage = data.usageMetadata;

    return {
        content,
        usage: usage ? {
            promptTokens: usage.promptTokenCount,
            completionTokens: usage.candidatesTokenCount,
            totalTokens: usage.totalTokenCount
        } : undefined,
        latencyMs: Date.now() - startTime
    };
}

/**
 * Calls the Fast/Cheap LLM (Qwen 2.5 72B via OpenRouter by default) for quick deterministic classifications.
 */
export async function callFastLLM(systemPrompt: string, userPrompt: string, options?: LLMOptions): Promise<LLMResponse> {
    const startTime = Date.now();
    const apiKey = Deno.env.get("LLM_FAST_API_KEY");
    if (!apiKey) throw new Error("LLM_FAST_API_KEY is not set");

    const modelParams = {
        model: Deno.env.get("LLM_FAST_MODEL") || "qwen/qwen-2.5-72b-instruct",
        temperature: options?.temperature ?? (Number(Deno.env.get("LLM_FAST_TEMPERATURE")) || 0.1),
        maxTokens: options?.maxTokens ?? (Number(Deno.env.get("LLM_FAST_MAX_TOKENS")) || 200),
    };

    const url = "https://openrouter.ai/api/v1/chat/completions";

    const payload: any = {
        model: modelParams.model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: modelParams.temperature,
        max_tokens: modelParams.maxTokens,
    };

    if (options?.responseFormat === "json_object") {
        payload.response_format = { type: "json_object" };
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            // Optional OpenRouter headers
            "HTTP-Referer": "https://agenti.sh",
            "X-Title": "AGENTI"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        throw new Error(`Fast LLM failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const usage = data.usage;

    return {
        content,
        usage: usage ? {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens
        } : undefined,
        latencyMs: Date.now() - startTime
    };
}
