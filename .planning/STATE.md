# Estado actual
Fase activa: 3
Bloque activo: 3.1
Última sesión: 2026-03-10

## Qué se construyó (sesión 2026-03-10)
- **Bloque 2.3 completado:** Se implementaron los flujos finales de Onboarding M1.4, M1.5 y M1.6.
- Creación de rutas de API para reglas de escalamiento, conexión/simulación de WhatsApp, y Sandbox efímero (`/api/onboarding/escalation-rules`, `/api/onboarding/whatsapp`, `/api/agent/chat`, `/api/onboarding/activate`).
- Creación de componentes UI de cliente reactivos (`m14-escalation-rules.tsx`, `m15-whatsapp-connect.tsx`, `m16-agent-testing.tsx`).
- Corrección de bugs en la recuperación de contexto del agente, inyectando la información estática del negocio (descripción, horarios) junto a los Knowledge Items de la base de datos `active: true`.
- Verificación exitosa de redireccionamiento al Home Dashboard condicionada por progreso en la tabla `onboarding_progress`.

## Decisiones tomadas
- **WhatsApp Simulation:** Se optó deliberadamente por saltar el *Embedded Signup* de Meta mediante un botón de "Simular Éxito" para acelerar la etapa local de desarrollo, mockeando un token y status conectado.
- **Agent Context Loading:** La consulta de conexto del LLM en el Sandbox une tanto los `knowledge_items` (capa estructurada actual) como las propiedades hardcoded de la tabla `businesses` (horarios expandidos de JSON, descripciones) para dar un prompt integral al agente.

## Blockers
- Ninguno. La Fase 2 está completamente finalizada (Autenticación y Onboarding de Dueño).

## DoD Bloque 2.3 ✅
- [x] Reglas de Escalamiento leídas y actualizadas en Supabase.
- [x] Simulador de Conexión de WhatsApp logguea cambios adecuadamente.
- [x] Agente Sandbox responde basándose en el contexto del onboarding.
- [x] Botón maestro de activación empuja a Dashboard exitosamente.

## Próximo paso
Bloque 3.1 — Inbox: Live Chat View & Agent Realtime Control.

## Commits
- `chore: session-end [bloque 2.3] onboarding m1.4 m1.5 m1.6 sandbox api bugs and ui` (Pendiente)
