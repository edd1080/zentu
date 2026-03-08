/**
 * Gemini Adapter — calls Google Gemini REST API
 *
 * Endpoint: POST generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Auth: x-goog-api-key header
 * Docs: https://ai.google.dev/api/generate-content
 */

import {
  type LLMAdapter,
  type LLMConfig,
  type LLMRequestOptions,
  type LLMResponse,
  LLMApiError,
  LLMMalformedResponseError,
} from "../types";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

export const geminiAdapter: LLMAdapter = {
  async call(
    userPrompt: string,
    systemPrompt: string,
    config: LLMConfig,
    options?: LLMRequestOptions,
  ): Promise<LLMResponse> {
    const start = Date.now();

    const url = `${BASE_URL}/models/${config.model}:generateContent`;

    const body = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? config.temperature,
        maxOutputTokens: options?.maxTokens ?? config.maxTokens,
        ...(options?.jsonMode && {
          responseMimeType: "application/json",
        }),
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown");
      throw new LLMApiError(
        config.provider,
        config.model,
        response.status,
        errorBody,
      );
    }

    const data = (await response.json()) as GeminiResponse;

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new LLMMalformedResponseError(
        config.provider,
        config.model,
        JSON.stringify(data).slice(0, 500),
      );
    }

    return {
      content: text,
      provider: config.provider,
      model: config.model,
      tokensInput: data.usageMetadata?.promptTokenCount ?? 0,
      tokensOutput: data.usageMetadata?.candidatesTokenCount ?? 0,
      latencyMs,
    };
  },
};
