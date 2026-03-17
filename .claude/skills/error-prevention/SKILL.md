---
name: error-prevention
description: >
  Registro de errores propios cometidos durante el desarrollo de AGENTI.
  Cargar siempre al finalizar una tarea y antes de ejecutar migraciones SQL,
  modificar Edge Functions o cambiar lógica del pipeline del agente.
trigger: always_on
---

# Error Prevention — Lecciones aprendidas de AGENTI

> Solo se registran errores del agente de desarrollo. No errores de third parties.
> Revisar siempre al finalizar cada task y especialmente antes de SQL.

---

## SQL / Migraciones

- ❌ NUNCA definir funciones o triggers que referencien tablas antes de crear esas tablas.
  - ✅ Orden obligatorio: `CREATE TABLE` → funciones helper → triggers → RLS policies.

- ❌ NUNCA usar `DROP FUNCTION` si existen objetos dependientes (policies, triggers, views).
  - ✅ Usar `CREATE OR REPLACE` conservando la firma exacta (mismo nombre de parámetros).

- ❌ NUNCA cambiar el nombre de un parámetro en `CREATE OR REPLACE FUNCTION` si la función ya existe en el remote.
  - ✅ Inspeccionar la firma existente antes de escribir el SQL.

- ❌ NUNCA escribir una migración que no sea idempotente cuando trabaja con seed data.
  - ✅ Usar `INSERT ... ON CONFLICT DO NOTHING` o verificar existencia antes de insertar.

- ❌ NUNCA hacer `SELECT *` en queries de Supabase.
  - ✅ Siempre especificar las columnas necesarias.

- ❌ NUNCA olvidar el filtro `business_id` en cualquier query que toque datos de negocio.
  - ✅ Primer check antes de ejecutar cualquier query: ¿tiene `.eq('business_id', businessId)`?

## Edge Functions / Supabase

- ❌ NUNCA usar el `SUPABASE_SERVICE_ROLE_KEY` en código que corra en el cliente.
  - ✅ Service role key solo en Edge Functions y scripts server-side.

- ❌ NUNCA responder al webhook de Meta con un status distinto a 200 en el handler inicial.
  - ✅ Responder 200 primero, encolar, procesar async.

- ❌ NUNCA procesar un mensaje del webhook sin verificar la firma HMAC-SHA256 primero.
  - ✅ Verificación de firma es el primer paso, antes de cualquier lógica de negocio.

## LLM / Pipeline

- ❌ NUNCA llamar directamente a la API de Gemini o Together.ai desde lógica de negocio.
  - ✅ Toda llamada pasa por `lib/llm/callPrimaryLLM()` o `lib/llm/callFastLLM()`.

- ❌ NUNCA asumir que el output del LLM es JSON válido.
  - ✅ Siempre envolver el parsing en try/catch. Si falla → Escalation informative, no romper el pipeline.

- ❌ NUNCA cachear el Bloque 5 del prompt (historial de conversación).
  - ✅ Bloques 1-4 se cachean por `business_id`. Bloque 5 siempre real-time.

## Config / Env vars

- ❌ NUNCA usar `import "dotenv/config"` para cargar variables de entorno en proyectos Next.js.
  - ✅ Usar `dotenv.config({ path: ".env.local" })` — Next.js usa `.env.local` para secretos, no `.env`.
  - 📅 2026-03-09 | El smoke test no cargaba las API keys porque dotenv buscaba `.env` por defecto.

## TypeScript

- ❌ NUNCA usar `any`, `@ts-ignore` o `as unknown as X`.
  - ✅ Definir el tipo correcto o crear una interface. Si no hay tiempo, marcar con `// TODO: type properly` y crear issue.

- ❌ NUNCA olvidar validar con Zod en inputs externos (webhooks, formularios, params).
  - ✅ Zod schema se define antes de la lógica, no después.

---

- ❌ NUNCA escribir UUIDs manualmente en queries SQL — copiarlos siempre del resultado de un SELECT previo.
  - ✅ Antes de cualquier UPDATE/DELETE con WHERE id = '...', hacer SELECT del registro para confirmar el UUID exacto.
  - 📅 2026-03-17 | UUID escrito a mano (`cc34da30b`) difirió del real (`cc34af371c61`), causando error de sintaxis y UPDATE fallido silencioso.

- ❌ NUNCA asumir el `project-ref` de Supabase sin verificarlo — el CLI puede estar linkeado a un proyecto incorrecto.
  - ✅ Verificar con `supabase status` o revisar `supabase/config.toml` antes de cualquier `db push` o `functions deploy`.
  - 📅 2026-03-17 | El CLI estaba apuntando al proyecto `jmwdxopjyotvrvifcpuv` (incorrecto) en lugar de `rutzgbwziinixdrryirv`.

## Protocolo post-task

Al finalizar cada task:
1. Revisar si cometí algún error durante la ejecución.
2. Si sí → agregar la entrada aquí con formato: `❌ NUNCA` / `✅ SIEMPRE` / `📅 fecha | descripción`.
3. Si no → confirmar explícitamente: "Sin errores nuevos para registrar."
