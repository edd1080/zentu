# Estado actual

Fase activa: 1
Bloque activo: 1.2 (completado)
Última sesión: 2026-03-07

## Decisiones tomadas
- Next.js 16.1.6 instalado (create-next-app genera la última estable, compatible con App Router)
- Geist + Geist Mono importados desde `next/font/google` (no del package `geist` directamente)
- Instrument Serif importada como italic-only desde Google Fonts
- Design tokens en CSS custom properties en globals.css (no en tailwind.config)
- turbopack.root configurado a "." para evitar warning de lockfile en home dir
- **Supabase Cloud** en lugar de Supabase local (sin Docker). Proyecto vinculado con `supabase link`
- Migraciones se ejecutan con `supabase db push` contra el proyecto remoto
- Ref del proyecto: `jmwdxopjyotvrvifcpuv` (región East US)
- Helper function `get_business_id()` para simplificar RLS policies en todas las tablas
- `system_logs`, `agent_context_cache`, `webhook_queue` NO creadas en este bloque — no están en data-entities.md, se crean en Fase 3 cuando se implemente el backend
- Messages no tiene `business_id` directo (fiel a data-entities.md) — RLS usa subquery a conversations
- Notification.type es `text` (no enum) para flexibilidad — los tipos se definen en event-map.md y pueden cambiar

## Blockers
- Ninguno.

## DoD Bloque 1.1
- [x] `npm run dev` corre sin errores (HTTP 200 verificado)
- [x] `next build` compila sin errores de TypeScript
- [x] Variables de entorno en `.env.example` y `.env.local`
- [x] CLAUDE.md en la raíz del proyecto
- [x] `.planning/` con PROJECT.md, REQUIREMENTS.md, ROADMAP.md
- [x] Primer commit existe (40261af)
- [x] Supabase inicializado y vinculado a Cloud (conexión verificada HTTP 200)

## DoD Bloque 1.2
- [x] 4 migraciones corren en orden sin errores (`supabase db push` exitoso)
- [x] 14 tablas creadas: owners, businesses, agents, industry_templates, knowledge_sources, knowledge_items, competency_topics, autonomy_rules, escalation_rules, conversations, messages, suggestions, escalations, onboarding_progress, daily_summaries, notifications
- [x] 24 enums creados con valores exactos de data-entities.md
- [x] RLS activo en todas las tablas con policies scoped por business_id
- [x] 6 IndustryTemplates con 6 CompetencyTopics y 2-3 EscalationRules cada una (supera mínimo de 3/2)
- [x] TypeScript types generados (1163 líneas) — `src/lib/database.types.ts`
- [x] Triggers automáticos para updated_at/last_updated en knowledge_items, competency_topics, onboarding_progress
- [ ] `supabase db reset` — no aplica (sin Docker), verificado vía db push

## Notas
- El package `geist` se instaló como dependencia pero al final se usan las fonts via `next/font/google` que es la forma estándar de Next.js
- El proyecto usa Next.js 16.1.6 (la versión más reciente al crear el scaffold)
- Supabase CLI v2.48.3 instalada; hay v2.75.0 disponible (actualizar cuando sea conveniente)
- Los tipos generados incluyen Row/Insert/Update para cada tabla + Relationships
- Las 4 migraciones siguen orden de dependencias: base → knowledge → operation → system+seed
