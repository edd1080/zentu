/**
 * test-llm.ts — Smoke test for the LLM abstraction layer
 *
 * Usage: npx tsx src/lib/llm/test-llm.ts
 *
 * Requires env vars: LLM_PRIMARY_API_KEY, LLM_FAST_API_KEY
 * (set in .env.local, loaded by dotenv)
 *
 * Tests:
 *   1. callPrimaryLLM — Gemini Flash 2.5 returns a real response
 *   2. callFastLLM   — Qwen2.5-72B via Together.ai returns a real response
 *   3. JSON mode     — both models return valid JSON when requested
 */

/* eslint-disable no-console */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { callPrimaryLLM } from "./call-primary";
import { callFastLLM } from "./call-fast";

const SYSTEM = "Eres un asistente de prueba. Responde en español, muy breve.";
const USER = "¿Cuál es la capital de Guatemala?";

const JSON_SYSTEM =
  "Eres un clasificador. Responde SOLO con JSON válido, sin markdown.";
const JSON_USER =
  'Clasifica esta frase: "¿A qué hora abren?". Responde: {"intent":"string","confidence":number}';

async function testPrimary(): Promise<void> {
  console.log("\n─── Test 1: callPrimaryLLM ───");
  const res = await callPrimaryLLM(USER, SYSTEM);
  console.log("  Content:", res.content.slice(0, 120));
  console.log("  Provider:", res.provider, "| Model:", res.model);
  console.log("  Tokens:", res.tokensInput, "in /", res.tokensOutput, "out");
  console.log("  Latency:", res.latencyMs, "ms");
  assertNonEmpty(res.content, "Primary response");
}

async function testFast(): Promise<void> {
  console.log("\n─── Test 2: callFastLLM ───");
  const res = await callFastLLM(USER, SYSTEM);
  console.log("  Content:", res.content.slice(0, 120));
  console.log("  Provider:", res.provider, "| Model:", res.model);
  console.log("  Tokens:", res.tokensInput, "in /", res.tokensOutput, "out");
  console.log("  Latency:", res.latencyMs, "ms");
  assertNonEmpty(res.content, "Fast response");
}

async function testPrimaryJSON(): Promise<void> {
  console.log("\n─── Test 3: callPrimaryLLM (JSON mode) ───");
  const res = await callPrimaryLLM(JSON_USER, JSON_SYSTEM, { jsonMode: true });
  console.log("  Raw:", res.content.slice(0, 200));
  const parsed = JSON.parse(res.content);
  console.log("  Parsed:", parsed);
  assertNonEmpty(res.content, "Primary JSON response");
}

async function testFastJSON(): Promise<void> {
  console.log("\n─── Test 4: callFastLLM (JSON mode) ───");
  const res = await callFastLLM(JSON_USER, JSON_SYSTEM, { jsonMode: true });
  console.log("  Raw:", res.content.slice(0, 200));
  const parsed = JSON.parse(res.content);
  console.log("  Parsed:", parsed);
  assertNonEmpty(res.content, "Fast JSON response");
}

function assertNonEmpty(value: string, label: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${label} was empty`);
  }
}

async function main(): Promise<void> {
  console.log("🧪 LLM Abstraction Layer — Smoke Tests");
  console.log("========================================");

  let passed = 0;
  let failed = 0;

  for (const test of [testPrimary, testFast, testPrimaryJSON, testFastJSON]) {
    try {
      await test();
      console.log("  ✅ PASSED\n");
      passed++;
    } catch (error) {
      console.error("  ❌ FAILED:", (error as Error).message, "\n");
      failed++;
    }
  }

  console.log("========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) process.exit(1);
}

main();
