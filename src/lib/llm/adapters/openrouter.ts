/**
 * OpenRouter Adapter — calls OpenRouter OpenAI-compatible API
 *
 * Endpoint: POST openrouter.ai/api/v1/chat/completions
 * Auth: Bearer token
 * Docs: https://openrouter.ai/docs/api-reference/overview
 */

import {
  type LLMAdapter,
  type LLMConfig,
  type LLMRequestOptions,
  type LLMResponse,
  LLMApiError,
  LLMMalformedResponseError,
} from "../types";

const BASE_URL = "https://openrouter.ai/api/v1";

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export const openrouterAdapter: LLMAdapter = {
  async call(
    userPrompt: string,
    systemPrompt: string,
    config: LLMConfig,
    options?: LLMRequestOptions,
  ): Promise<LLMResponse> {
    const start = Date.now();

    const body = {
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: options?.temperature ?? config.temperature,
      max_tokens: options?.maxTokens ?? config.maxTokens,
      ...(options?.jsonMode && {
        response_format: { type: "json_object" },
      }),
    };

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
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

    const data = (await response.json()) as OpenAIChatResponse;

    const text = data.choices?.[0]?.message?.content;
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
      tokensInput: data.usage?.prompt_tokens ?? 0,
      tokensOutput: data.usage?.completion_tokens ?? 0,
      latencyMs,
    };
  },
};
