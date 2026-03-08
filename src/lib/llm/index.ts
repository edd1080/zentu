/**
 * LLM Abstraction Layer — public API
 *
 * Import everything from '@/lib/llm':
 *   import { callPrimaryLLM, callFastLLM } from '@/lib/llm'
 *
 * These are the ONLY two entry points for LLM calls in AGENTI.
 * No other file should import adapters or config directly.
 */

export { callPrimaryLLM } from "./call-primary";
export { callFastLLM } from "./call-fast";
export {
  type LLMResponse,
  type LLMRequestOptions,
  LLMTimeoutError,
  LLMApiError,
  LLMMalformedResponseError,
} from "./types";
