/**
 * callPrimaryLLM — calls the primary (quality) model
 *
 * Default: Gemini Flash 2.5 (temp 0.3, max 600 tokens)
 * Used for: response generation, knowledge extraction, first-week summaries
 * Timeout: 8s with 1 retry after 1s delay (TAD 3.5)
 */

import { getPrimaryConfig, PRIMARY_TIMEOUT_MS, RETRY_DELAY_MS } from "./config";
import { getAdapter } from "./get-adapter";
import { logLLMCall, successEntry, errorEntry } from "./logger";
import {
  type LLMAdapter,
  type LLMConfig,
  type LLMRequestOptions,
  type LLMResponse,
  LLMTimeoutError,
} from "./types";

export async function callPrimaryLLM(
  userPrompt: string,
  systemPrompt: string,
  options?: LLMRequestOptions,
): Promise<LLMResponse> {
  const config = getPrimaryConfig();
  const adapter = getAdapter(config.provider);
  const timeoutMs = PRIMARY_TIMEOUT_MS;

  try {
    const result = await callWithTimeout(
      adapter, userPrompt, systemPrompt, config, options, timeoutMs,
    );

    logLLMCall(successEntry(
      config.provider, config.model,
      result.tokensInput, result.tokensOutput, result.latencyMs,
    ));

    return result;
  } catch (firstError) {
    // TAD 3.5: timeout → 1 retry after 1s delay
    if (isTimeoutError(firstError)) {
      logLLMCall(errorEntry(
        config.provider, config.model, timeoutMs,
        "timeout", "LLM_TIMEOUT", "First attempt timed out, retrying...",
      ));

      await delay(RETRY_DELAY_MS);

      try {
        const retryResult = await callWithTimeout(
          adapter, userPrompt, systemPrompt, config, options, timeoutMs,
        );

        logLLMCall(successEntry(
          config.provider, config.model,
          retryResult.tokensInput, retryResult.tokensOutput,
          retryResult.latencyMs,
        ));

        return retryResult;
      } catch (retryError) {
        const latency = timeoutMs + RETRY_DELAY_MS + timeoutMs;
        logLLMCall(errorEntry(
          config.provider, config.model, latency,
          "timeout", "LLM_TIMEOUT", "Retry also timed out",
        ));
        throw new LLMTimeoutError(config.provider, config.model, latency);
      }
    }

    // TAD 3.5: API errors → no retry, propagate with context
    logLLMCall(errorEntry(
      config.provider, config.model, 0,
      "error", (firstError as Error).name,
      (firstError as Error).message,
    ));
    throw firstError;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function callWithTimeout(
  adapter: LLMAdapter,
  userPrompt: string,
  systemPrompt: string,
  config: LLMConfig,
  options: LLMRequestOptions | undefined,
  timeoutMs: number,
): Promise<LLMResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await adapter.call(userPrompt, systemPrompt, config, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function isTimeoutError(error: unknown): boolean {
  if (error instanceof LLMTimeoutError) return true;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
