# Estado actual
Fase activa: 2
Bloque activo: 2.3 (siguiente)
Última sesión: 2026-03-09

## Qué se construyó (sesión 2026-03-09)
- **Bloque 2.2 completado:** Se implementó y pulió el flujo del onboarding M1.2 y M1.3.
- Creación de rutas de API (`/api/onboarding/industry`, `/api/onboarding/knowledge`, `/api/onboarding/progress`, `/api/onboarding/voice`, `/api/onboarding/link`).
- Creación de componentes de UI progresivos para captura de horarios, nombre/descripción, servicios y tono de marca (`m13-knowledge-capture.tsx` y subcomponentes).
- UI Polish del scroll progresivo (smooth scroll nativo) y UX reactiva.
- Adaptación de Gemini Flash Multimodal dentro de la capa `lib/llm` para transcribir audios de 30s al vuelo.
- Inyección de migraciones remotas en vivo de Supabase vía MCP (Seed Industry Data, adición de columnas a `competency_topics` y casting de Textos a Enums).
- Solución de routing bug en `middleware.ts` para redirigir siempre al dashboard o onboarding.

## Decisiones tomadas
- **SQL Data Typecasting en Cloud:** Tras enfrentar un error 500 crónico durante la inserción de las plantillas de industria (RPC), se modificó directamente el script en la BD vía Supabase MCP para aplicar casting implícito (`::public.industry_type`) en lugar del ORM de Node para mayor fidelidad a PostgreSQL.
- **Formato Progresivo:** Todos los formularios de M1.3 existen en un solo route que revela dinámicamente bloques para aprovechar estados locales reáctivos sin recargas y mejorar la percepción de velocidad.

## Blockers
- Ninguno. Listos para empezar Bloque 2.3 (M1.4 - Escalation Rules).

## DoD Bloque 2.2 ✅
- [x] Seleccionar industria -> crea `CompetencyTopics` y `EscalationRules`.
- [x] Campo libre M1.3 -> Crea un `KnowledgeItem`.
- [x] Nota de voz -> Produce `KnowledgeItem` con `source_type=voice_note` a través de Multimodal Gemini API.
- [x] Porcentaje de completitud reacciona en la UI sin recargar (`knowledge_completeness`).
- [x] Errores al fetchear enlaces del negocio son no-bloqueantes.

## Próximo paso
Bloque 2.3 — Configuración de Escalation Rules (M1.4).

## Commits
- `chore: session-end [bloque 2.2] onboarding flow m1.2 m1.3, supabase rpc fixes, and ui polish` (Pendiente)
