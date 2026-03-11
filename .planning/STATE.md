# Estado actual
Fase activa: 4
Bloque activo: Bloque 4.2 — Escalations & Urgency Flows (Empezando)
Última sesión: 2026-03-11

## Qué se construyó (sesión 2026-03-11 debugging)
- **Bloque 3.3 completado:** Filtros de emergencia previos a LLM, refinamiento de prompts y `confidence_tiers`. Validado localmente.
- **Bloque 3.4 completado:** Backend de acciones y aprendizaje.
  - Creación de Edge Function utility `send-message` conectada a Meta API.
  - Creación de Edge Function controller `suggestion-actions` que maneja resoluciones del frontend (Approve, Edit, Reject).
  - Creación de Edge Function asíncrona `classify-correction` que materializa correcciones manuales en `knowledge_items` operativos (bucle cerrado).
- **Bloque 4.1 completado:** Dashboard UI y motor en tiempo real.
  - Implementación visual interactiva completa de Inbox Page (filtros dinámicos) y Thread Page (mensajes, avatar, badges).
  - Integración bidireccional de widgets modulares para Approvar, Editar o Rechazar sugerencias en UI.
  - Despliegue de DB Triggers que actualizan dinámicamente el `last_message_at` para ordenar las bandejas.
  - Suscripción directa de Supabase Realtime usando WebSockets para ver mensajes nuevos que entran solos vía el Webhook de Meta.
- **Debugging de Mensajería y UI (2026-03-11):**
  - Fix de un bug crítico en `process-message` que fragmentaba hilos de conversación cuando el estado dejaba de ser `active`. Ahora las conversaciones se reusan y reactivan correctamente.
  - Solución de problemas de UI donde las sugerencias tapaban los mensajes.
  - Habilitación del input manual de texto en el Dashboard conectado a la función `send-message`.
  - Fix de un bug de Next.js Turbopack (`React.use(params)`) cambiándolo por `useParams()`.
  - Diagnóstico de falla en mensajes salientes debido a la expiración del Access Token de Meta Graph API. Renovación de token completada por el usuario.

## Decisiones tomadas
- **Bypass de Despliegue (MCP):** Ante un error de permisos `EPERM` en Mac sobre `.env.local` que bloqueaba el CLI de Supabase, se optó por desplegar las Edge Functions vía **MCP Supabase Server**, permitiendo continuar el desarrollo sin comprometer la seguridad o los permisos del SO.
- **Rutas de Imports (MCP Issue):** El despliegue a través del MCP exige utilizar *URLs absolutas o resolubles nativamente* de Deno local (ej. `../_shared/llm/index.ts`) en lugar de alias mapeados (`src/`) que provocarían cuelgues HTTP 503 en el entorno real por falta de `deno.json` embebido en el bundle. Se corrigieron todas las rutas compartidas y resubieron las funciones.
- **Detección de Emergency Logic:** Deterministic filter implemented before LLM call.

## Blockers
- Ninguno técnico. La comunicación End-to-End desde enviar en WhatsApp personal hasta verlo reflejado en la bandeja y procesado por el Agente funciona sin problemas localmente. Se descubrió y manejó la expiración del token temporal de Meta.

## DoD Bloque 3.3 ✅
- [x] Confidence score ponderado y jerarquías (Alta, Media, Baja).
- [x] Filtros pre-LLM para palabras críticas.
- [x] Validar que Output se inserta correctamente.

## DoD Bloque 4.1 ✅
- [x] Construcción Pixel-perfect de todas las pantallas del Handler (Sidebar, TopBar, Inbox Split View, Thread).
- [x] Visualización de Suggestion Widget + Acciones Integradas a JS Functions.
- [x] Visualización de Escalation Banner.
- [x] Conexión real de DB Messages y Realtime Insertions.

## Próximo paso
- [ ] Bloque 4.2 — Escalations & Urgency Flows (Fase 4 - Vistas del Dashboard para Casos Críticos)

## Commits
- `chore: session-end debugging dashboard, process-message fix, meta token update` (Pendiente)
