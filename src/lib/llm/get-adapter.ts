/**
 * getAdapter — resolves provider name to its adapter implementation
 *
 * Maps LLMProviderName to the correct adapter. Exhaustive switch
 * ensures TypeScript catches missing providers at compile time.
 */

import type { LLMAdapter, LLMProviderName } from "./types";
import { geminiAdapter } from "./adapters/gemini";
import { togetherAdapter } from "./adapters/together";
import { openrouterAdapter } from "./adapters/openrouter";

export function getAdapter(provider: LLMProviderName): LLMAdapter {
  switch (provider) {
    case "gemini":
      return geminiAdapter;
    case "together":
      return togetherAdapter;
    case "openrouter":
      return openrouterAdapter;
  }
}
