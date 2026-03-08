/**
 * callFastLLM — calls the fast/cheap model
 *
 * Default: Qwen2.5-72B via Together.ai (temp 0.1, max 200 tokens)
 * Used for: intent classification, guardrails, knowledge abstraction
 * Timeout: 3s with 0 retries — speed over resilience (TAD 3.5)
 */

import { getFastConfig, FAST_TIMEOUT_MS } from "./config";
import { getAdapter } from "./get-adapter";
import { logLLMCall, successEntry, errorEntry } from "./logger";
import {
  type LLMRequestOptions,
  type LLMResponse,
  LLMTimeoutError,
} from "./types";

export async function callFastLLM(
  userPrompt: string,
  systemPrompt: string,
  options?: LLMRequestOptions,
): Promise<LLMResponse> {
  const config = getFastConfig();
  const adapter = getAdapter(config.provider);
  const timeoutMs = FAST_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await adapter.call(userPrompt, systemPrompt, config, {
      ...options,
      signal: controller.signal,
    });

    logLLMCall(successEntry(
      config.provider, config.model,
      result.tokensInput, result.tokensOutput, result.latencyMs,
    ));

    return result;
  } catch (error) {
    clearTimeout(timer);

    // TAD 3.5: fast model has 0 retries — fail immediately
    if (isTimeoutError(error)) {
      logLLMCall(errorEntry(
        config.provider, config.model, timeoutMs,
        "timeout", "LLM_TIMEOUT", "Fast model timed out (no retry)",
      ));
      throw new LLMTimeoutError(config.provider, config.model, timeoutMs);
    }

    logLLMCall(errorEntry(
      config.provider, config.model, 0,
      "error", (error as Error).name,
      (error as Error).message,
    ));
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isTimeoutError(error: unknown): boolean {
  if (error instanceof LLMTimeoutError) return true;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  return false;
}
