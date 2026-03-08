# Estado actual

Fase activa: 1
Bloque activo: 1.3 (siguiente)
Última sesión: 2026-03-07

## Qué se construyó (sesión 2026-03-07, parte 2)
- 4 migraciones SQL: `20260308060001` a `20260308060004`
- 14 tablas con RLS, 24 enums, 3 triggers, índices compuestos
- 6 IndustryTemplates con seed data completo (Guatemala context)
- `src/lib/database.types.ts` — tipos TypeScript generados (1163 líneas)
- Helper function `get_business_id()` para simplificar RLS

## Decisiones tomadas
- Next.js 16.1.6 instalado (create-next-app genera la última estable, compatible con App Router)
- Geist + Geist Mono importados desde `next/font/google` (no del package `geist` directamente)
- Instrument Serif importada como italic-only desde Google Fonts
- Design tokens en CSS custom properties en globals.css (no en tailwind.config)
- turbopack.root configurado a "." para evitar warning de lockfile en home dir
- **Supabase Cloud** en lugar de Supabase local (sin Docker). Proyecto vinculado con `supabase link`
- Migraciones se ejecutan con `supabase db push` contra el proyecto remoto
- Ref del proyecto: `jmwdxopjyotvrvifcpuv` (región East US)
- Helper function `get_business_id()` SECURITY DEFINER + STABLE para simplificar RLS policies
- `system_logs`, `agent_context_cache`, `webhook_queue` NO creadas — no están en data-entities.md, se crean en Fase 3 cuando se implemente el backend (decisión validada por el dueño)
- Messages no tiene `business_id` directo (fiel a data-entities.md) — RLS usa subquery a conversations
- Notification.type es `text` (no enum) para flexibilidad — los tipos se definen en event-map.md y pueden cambiar

## Blockers
- Ninguno.

## DoD Bloque 1.1 ✅
- [x] `npm run dev` corre sin errores (HTTP 200 verificado)
- [x] `next build` compila sin errores de TypeScript
- [x] Variables de entorno en `.env.example` y `.env.local`
- [x] CLAUDE.md en la raíz del proyecto
- [x] `.planning/` con PROJECT.md, REQUIREMENTS.md, ROADMAP.md
- [x] Primer commit existe (40261af)
- [x] Supabase inicializado y vinculado a Cloud (conexión verificada HTTP 200)

## DoD Bloque 1.2 ✅
- [x] 4 migraciones corren en orden sin errores (`supabase db push` exitoso)
- [x] 14 tablas creadas con esquema fiel a data-entities.md
- [x] 24 enums creados con valores exactos
- [x] RLS activo en todas las tablas con policies scoped por business_id
- [x] 6 IndustryTemplates con 6 CompetencyTopics y 2-3 EscalationRules cada una
- [x] TypeScript types generados (1163 líneas) — `src/lib/database.types.ts`
- [x] Triggers automáticos para updated_at/last_updated
- [n/a] `supabase db reset` — no aplica (sin Docker), verificado vía db push

## Próximo paso
Bloque 1.3 — Capa de abstracción LLM: crear módulo que abstrae llamadas a Gemini Flash 2.5 (primario) y Qwen2.5-72B/Together.ai (rápido). Leer backend-logic.md y tad.md primero.

## Notas
- El package `geist` se instaló como dependencia pero se usan las fonts via `next/font/google`
- Supabase CLI v2.48.3 instalada; hay v2.75.0 disponible
- Los tipos generados incluyen Row/Insert/Update para cada tabla + Relationships
- Las 4 migraciones siguen orden de dependencias: base → knowledge → operation → system+seed
- Error prevention: sin errores nuevos registrados en esta sesión

## Commits
- `40261af` — chore: project scaffold — docs, claude rules, planning structure, skills installed
- `2c1eb3f` — feat: bloque 1.1 — next.js scaffold, design tokens, supabase init
- `99ec108` — chore: supabase cloud linked, blocker resolved
- `dc943da` — feat: bloque 1.2 — esquema de base de datos completo
