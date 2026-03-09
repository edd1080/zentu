# Estado actual

Fase activa: 1
Bloque activo: 1.4 (siguiente)
Última sesión: 2026-03-09

## Qué se construyó (sesión 2026-03-09)
- 11 archivos en `src/lib/llm/` — capa de abstracción LLM completa
- 3 adapters: Gemini REST, Together.ai (respaldo), OpenRouter (activo para fast)
- `callPrimaryLLM` — Gemini Flash 2.5, timeout 8s, 1 retry
- `callFastLLM` — Qwen2.5-72B via OpenRouter, timeout 3s, sin retry
- 3 clases de error: LLMTimeoutError, LLMApiError, LLMMalformedResponseError
- Logger estructurado (console → system_logs en Fase 3)
- Smoke tests 4/4 passing con APIs reales
- devDeps: dotenv, tsx

## Decisiones tomadas
- **OpenRouter reemplaza Together.ai como proveedor fast** — Together.ai no permite agregar fondos. Mismo modelo (Qwen2.5-72B-Instruct). Adapter de Together.ai se mantiene como opción futura.
- **dotenv carga `.env.local`** (no `.env`) — convención Next.js para secretos locales.
- **max_tokens=600** (no 500) — discrepancia TAD vs CLAUDE.md resuelta a favor de 600 (2/3 fuentes + ya en .env.example).
- **Fetch directo** sin SDKs para ambos proveedores — portabilidad, zero deps extra.

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

## DoD Bloque 1.3 ✅
- [x] Ambas funciones retornan respuestas reales con API keys configuradas (4/4 smoke tests)
- [x] Cambiar LLM_FAST_PROVIDER en .env.local no requiere cambios de código (demostrado: together → openrouter)
- [x] Errores de API (rate limit 429, payment required 402, timeout) capturados y loggeados en console

## Próximo paso
Bloque 1.4 — Autenticación con Supabase Auth. Leer docs/ux-flows.md (flujo de registro) y docs/data-entities.md (Owner entity) primero.

## Notas
- El package `geist` se instaló como dependencia pero se usan las fonts via `next/font/google`
- Supabase CLI v2.48.3 instalada; hay v2.75.0 disponible
- Los tipos generados incluyen Row/Insert/Update para cada tabla + Relationships
- Las 4 migraciones siguen orden de dependencias: base → knowledge → operation → system+seed
- Fast LLM latencia en JSON mode: 408ms (dentro del budget de 500ms para clasificación)
- Error prevention: 1 error nuevo registrado (dotenv/.env.local)

## Commits
- `40261af` — chore: project scaffold — docs, claude rules, planning structure, skills installed
- `2c1eb3f` — feat: bloque 1.1 — next.js scaffold, design tokens, supabase init
- `99ec108` — chore: supabase cloud linked, blocker resolved
- `dc943da` — feat: bloque 1.2 — esquema de base de datos completo
- `f08d315` — chore: session-end bloque 1.2 (tag: block-1.2-complete)
- `bb844b9` — feat: bloque 1.3 — capa de abstracción LLM completa
- `e7cf566` — fix: test-llm carga .env.local en vez de .env
- `1e745bf` — feat: agregar OpenRouter como proveedor fast LLM
