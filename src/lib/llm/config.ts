/**
 * LLM Configuration — reads env vars and validates
 *
 * Cambiar LLM_PRIMARY_PROVIDER o LLM_FAST_PROVIDER en .env.local
 * cambia el proveedor sin modificar código.
 */

import type { LLMConfig, LLMProviderName } from "./types";

// ---------------------------------------------------------------------------
// Defaults (from CLAUDE.md + TAD 3.3)
// ---------------------------------------------------------------------------

const DEFAULTS = {
  primary: {
    provider: "gemini" as LLMProviderName,
    model: "gemini-2.5-flash",
    maxTokens: 600,
    temperature: 0.3,
  },
  fast: {
    provider: "openrouter" as LLMProviderName,
    model: "qwen/qwen-2.5-72b-instruct",
    maxTokens: 200,
    temperature: 0.1,
  },
} as const;

// ---------------------------------------------------------------------------
// Latency budgets (TAD 3.4)
// ---------------------------------------------------------------------------

/** Max latency for primary LLM call (ms) */
export const PRIMARY_TIMEOUT_MS = 8_000;

/** Max latency for fast LLM call (ms) */
export const FAST_TIMEOUT_MS = 3_000;

/** Delay before retry on timeout (ms) — TAD 3.5 */
export const RETRY_DELAY_MS = 1_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseProvider(value: string | undefined): LLMProviderName {
  if (value === "gemini" || value === "together" || value === "openrouter") {
    return value;
  }
  throw new Error(
    `Invalid LLM provider: "${value}". Expected "gemini", "together" or "openrouter".`,
  );
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalFloat(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseFloat(raw);
  if (isNaN(parsed)) return fallback;
  return parsed;
}

function optionalInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) return fallback;
  return parsed;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getPrimaryConfig(): LLMConfig {
  return {
    provider: parseProvider(
      process.env.LLM_PRIMARY_PROVIDER ?? DEFAULTS.primary.provider,
    ),
    model: process.env.LLM_PRIMARY_MODEL ?? DEFAULTS.primary.model,
    apiKey: requireEnv("LLM_PRIMARY_API_KEY"),
    maxTokens: optionalInt(
      "LLM_PRIMARY_MAX_TOKENS",
      DEFAULTS.primary.maxTokens,
    ),
    temperature: optionalFloat(
      "LLM_PRIMARY_TEMPERATURE",
      DEFAULTS.primary.temperature,
    ),
  };
}

export function getFastConfig(): LLMConfig {
  return {
    provider: parseProvider(
      process.env.LLM_FAST_PROVIDER ?? DEFAULTS.fast.provider,
    ),
    model: process.env.LLM_FAST_MODEL ?? DEFAULTS.fast.model,
    apiKey: requireEnv("LLM_FAST_API_KEY"),
    maxTokens: optionalInt(
      "LLM_FAST_MAX_TOKENS",
      DEFAULTS.fast.maxTokens,
    ),
    temperature: optionalFloat(
      "LLM_FAST_TEMPERATURE",
      DEFAULTS.fast.temperature,
    ),
  };
}
