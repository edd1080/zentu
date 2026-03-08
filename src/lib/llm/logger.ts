/**
 * LLM Logger — structured logging for LLM calls
 *
 * Logs to console now. In Phase 3, wire to system_logs table
 * with trace_id, business_id, and full LLM metrics.
 *
 * Per TAD 4.3: never log message content, only metadata.
 */

import type { LLMLogEntry } from "./types";

export function logLLMCall(entry: LLMLogEntry): void {
  const timestamp = new Date().toISOString();
  const prefix = entry.outcome === "success" ? "✓" : "✗";

  const summary = [
    `[LLM ${prefix}]`,
    `${entry.provider}/${entry.model}`,
    `${entry.latencyMs}ms`,
    `in:${entry.tokensInput} out:${entry.tokensOutput}`,
    entry.outcome,
  ].join(" | ");

  if (entry.outcome === "success") {
    console.log(`${timestamp} ${summary}`);
  } else {
    console.error(
      `${timestamp} ${summary}`,
      entry.errorType ? `[${entry.errorType}]` : "",
      entry.errorMessage ?? "",
    );
  }
}

/**
 * Build a log entry from a successful LLM response.
 */
export function successEntry(
  provider: LLMLogEntry["provider"],
  model: string,
  tokensInput: number,
  tokensOutput: number,
  latencyMs: number,
): LLMLogEntry {
  return {
    provider,
    model,
    tokensInput,
    tokensOutput,
    latencyMs,
    outcome: "success",
  };
}

/**
 * Build a log entry from a failed LLM call.
 */
export function errorEntry(
  provider: LLMLogEntry["provider"],
  model: string,
  latencyMs: number,
  outcome: LLMLogEntry["outcome"],
  errorType: string,
  errorMessage: string,
): LLMLogEntry {
  return {
    provider,
    model,
    tokensInput: 0,
    tokensOutput: 0,
    latencyMs,
    outcome,
    errorType,
    errorMessage,
  };
}
