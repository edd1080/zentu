/**
 * LLM Abstraction Layer — Shared Types
 *
 * Tipos compartidos para la capa de abstracción LLM de AGENTI.
 * Toda llamada a modelo de lenguaje pasa por esta capa.
 */

// ---------------------------------------------------------------------------
// Provider & Config
// ---------------------------------------------------------------------------

export type LLMProviderName = "gemini" | "together" | "openrouter";

export interface LLMConfig {
  provider: LLMProviderName;
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
}

// ---------------------------------------------------------------------------
// Request & Response
// ---------------------------------------------------------------------------

export interface LLMRequestOptions {
  /** Override max tokens for this call */
  maxTokens?: number;
  /** Override temperature for this call */
  temperature?: number;
  /** Request JSON output from the model */
  jsonMode?: boolean;
  /** Abort signal for timeout control */
  signal?: AbortSignal;
}

export interface LLMResponse {
  content: string;
  provider: LLMProviderName;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Adapter Interface
// ---------------------------------------------------------------------------

export interface LLMAdapter {
  call(
    userPrompt: string,
    systemPrompt: string,
    config: LLMConfig,
    options?: LLMRequestOptions,
  ): Promise<LLMResponse>;
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

export type LLMOutcome = "success" | "error" | "timeout" | "fallback";

export interface LLMLogEntry {
  provider: LLMProviderName;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
  outcome: LLMOutcome;
  errorType?: string;
  errorMessage?: string;
}

// ---------------------------------------------------------------------------
// Errors — 3 tipos per TAD 3.5
// ---------------------------------------------------------------------------

export class LLMTimeoutError extends Error {
  readonly code = "LLM_TIMEOUT" as const;

  constructor(
    public readonly provider: LLMProviderName,
    public readonly model: string,
    public readonly latencyMs: number,
  ) {
    super(`LLM timeout after ${latencyMs}ms (${provider}/${model})`);
    this.name = "LLMTimeoutError";
  }
}

export class LLMApiError extends Error {
  readonly code = "LLM_API_ERROR" as const;

  constructor(
    public readonly provider: LLMProviderName,
    public readonly model: string,
    public readonly statusCode: number,
    public readonly apiMessage: string,
  ) {
    super(
      `LLM API error ${statusCode}: ${apiMessage} (${provider}/${model})`,
    );
    this.name = "LLMApiError";
  }
}

export class LLMMalformedResponseError extends Error {
  readonly code = "LLM_MALFORMED_RESPONSE" as const;

  constructor(
    public readonly provider: LLMProviderName,
    public readonly model: string,
    public readonly rawResponse: string,
  ) {
    super(`LLM returned malformed response (${provider}/${model})`);
    this.name = "LLMMalformedResponseError";
  }
}

export type LLMError =
  | LLMTimeoutError
  | LLMApiError
  | LLMMalformedResponseError;
