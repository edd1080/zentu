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

- ❌ NUNCA filtrar conversaciones por `created_at` cuando la intención es "actividad en el período".
  - ✅ Usar `last_message_at`: una conversación se crea una vez pero puede tener mensajes durante días. `created_at` solo indica cuándo nació, no cuándo hubo actividad.
  - ✅ Aplica tanto en Edge Functions como en queries del frontend.
  - 📅 2026-03-20 | `generate-daily-summary` y `intelligence/page.tsx` usaban `created_at` y reportaban "sin actividad" aunque había mensajes nuevos hoy. Fix: cambiar a `.gte("last_message_at", since)`.

- ❌ NUNCA olvidar el filtro `business_id` en cualquier query que toque datos de negocio.
  - ✅ Primer check antes de ejecutar cualquier query: ¿tiene `.eq('business_id', businessId)`?

- ❌ NUNCA escribir una query o insertar datos sin verificar el schema en `docs/data-entities.md`.
  - ✅ Consultar el documento de entidades y las migraciones es el primer paso antes de programar lógica de persistencia.
  - 📅 2026-03-13 | Mismatch en `knowledge_items` (usando `topic` en vez de `topic_id`) causó error 400.

## Edge Functions / Supabase

- ❌ NUNCA usar el `SUPABASE_SERVICE_ROLE_KEY` en código que corra en el cliente.
  - ✅ Service role key solo en Edge Functions y scripts server-side.

- ❌ NUNCA responder al webhook de Meta con un status distinto a 200 en el handler inicial.
  - ✅ Responder 200 primero, encolar, procesar async.

- ❌ NUNCA procesar un mensaje del webhook sin verificar la firma HMAC-SHA256 primero.
  - ✅ Verificación de firma es el primer paso, antes de cualquier lógica de negocio.

- ❌ NUNCA marcar como "done" una tarea que incluya nuevas Edge Functions sin verificar su despliegue real en el proyecto de Supabase.
  - ✅ Usar `supabase functions list` o herramientas MCP para confirmar que la función está ACTIVE y es accesible.
  - 📅 2026-03-13 | El agente dio por terminada la tarea sin haber desplegado las funciones `process-quick-instruct` y `confirm-instruction`.

- ❌ NUNCA desplegar una Edge Function (pública O invocada por cliente autenticado) con `verify_jwt = true`.
  - ✅ Usar SIEMPRE `verify_jwt = false` en `config.toml` + `--no-verify-jwt` en el deploy. Manejar autenticación manualmente dentro con `supabase.auth.getUser(jwt)`.
  - ✅ Con `verify_jwt = true`, el gateway de Supabase puede rechazar tokens válidos con 401 antes de que el código corra. No hay forma de depurarlo desde el cliente.
  - 📅 2026-03-20 | `update-business-profile` devolvía 401 con `verify_jwt = true` aunque el usuario estaba autenticado. Fix: `verify_jwt = false` + autenticación interna.
  - ✅ Dos pasos obligatorios: (1) `[functions.nombre-funcion] verify_jwt = false` en `supabase/config.toml`, y (2) `supabase functions deploy nombre-funcion --no-verify-jwt`.
  - ✅ Si solo se hace uno de los dos, Supabase puede re-habilitar JWT verification al re-desplegar.
  - 📅 2026-03-19 | `whatsapp-webhook` y `process-message` comenzaron a retornar 401 después de redespliegues porque faltaba `verify_jwt = false` en config.toml. Meta no podía verificar el webhook, y process-message recibía 401 de whatsapp-webhook al invocarlo internamente.

- ❌ NUNCA asumir que el header de autenticación que llega a una Edge Function invocada por otra función es `Authorization`.
  - ✅ El Supabase SDK puede enviar el service role key en el header `apikey`, no en `Authorization`. Verificar ambos headers:
    ```typescript
    const authHeader = req.headers.get("Authorization")
    const apikey = req.headers.get("apikey")
    if (authHeader !== `Bearer ${KEY}` && apikey !== KEY) { return 401 }
    ```
  - 📅 2026-03-19 | `process-message` rechazaba llamadas de `whatsapp-webhook` porque solo verificaba `Authorization` y el SDK enviaba `apikey`.

- ❌ NUNCA configurar un secreto de Supabase con el NOMBRE de la variable como valor (ej. valor = "LLM_PRIMARY_MODEL" en vez del modelo real).
  - ✅ Verificar siempre que el valor del secreto es el dato real, no el nombre de la variable.
  - 📅 2026-03-19 | `LLM_PRIMARY_MODEL` fue configurado con valor "LLM_PRIMARY_MODEL" (el nombre) en vez de "openai/gpt-4o-mini", causando error "not a valid model ID".

## LLM / Pipeline

- ❌ NUNCA llamar directamente a la API de Gemini o Together.ai desde lógica de negocio.
  - ✅ Toda llamada pasa por `lib/llm/callPrimaryLLM()` o `lib/llm/callFastLLM()`.

- ❌ NUNCA asumir que el output del LLM es JSON válido.
  - ✅ Siempre envolver el parsing en try/catch. Si falla → Escalation informative, no romper el pipeline.

- ❌ NUNCA enviar un PDF como `image_url` a un modelo OpenAI/Azure.
  - ✅ PDFs requieren un modelo que los soporte nativamente (Gemini). Usar `google/gemini-2.0-flash-001` o superior via OpenRouter.
  - ✅ Imágenes y PDFs se envían con `image_url` + `data:mime;base64,...` — pero el MODELO debe ser Gemini para PDFs.
  - 📅 2026-03-20 | `callMultimodalLLM` enviaba PDFs a `openai/gpt-4o-mini` (Azure), que devuelve 400 "Invalid image URL". Fix: bifurcar por `mediaKind === 'pdf'` y usar `LLM_MULTIMODAL_MODEL` (default `google/gemini-2.0-flash-001`).

- ❌ NUNCA confiar en que el LLM devuelva JSON puro sin fences de markdown.
  - ✅ Siempre limpiar la respuesta antes de `JSON.parse`: `raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()`
  - 📅 2026-03-20 | `callMultimodalLLM` fallaba con "Error procesando la respuesta" porque Gemini devuelve ```json...``` en algunos casos.

- ❌ NUNCA marcar como `[x]` en el DoD un criterio que no se haya probado end-to-end manualmente.
  - ✅ El criterio solo se marca como completo cuando se ejecuta el flujo completo y se confirma el resultado (KnowledgeItem creado, UI actualizada, etc.).
  - 📅 2026-03-20 | "Test 1.3 PDFs/imágenes" fue marcado como completo sin haber probado con un archivo real. Se detectó al hacer el test — había bugs en modelo y UX.

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

## Protocolo post-task

Al finalizar cada task:
1. Revisar si cometí algún error durante la ejecución.
2. Si sí → agregar la entrada aquí con formato: `❌ NUNCA` / `✅ SIEMPRE` / `📅 fecha | descripción`.
3. Si no → confirmar explícitamente: "Sin errores nuevos para registrar."
