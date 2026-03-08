# Estado actual

Fase activa: 1
Bloque activo: 1.1
Última sesión: 2026-03-07

## Decisiones tomadas
- Next.js 16.1.6 instalado (create-next-app genera la última estable, compatible con App Router)
- Geist + Geist Mono importados desde `next/font/google` (no del package `geist` directamente)
- Instrument Serif importada como italic-only desde Google Fonts
- Design tokens en CSS custom properties en globals.css (no en tailwind.config)
- turbopack.root configurado a "." para evitar warning de lockfile en home dir

## Blockers
- Docker no está instalado en esta máquina. `supabase start` requiere Docker para los contenedores de Postgres, Auth, etc.
- ACCIÓN REQUERIDA: instalar Docker Desktop o OrbStack antes de continuar con Bloque 1.2

## DoD Bloque 1.1
- [x] `npm run dev` corre sin errores (HTTP 200 verificado)
- [x] `next build` compila sin errores de TypeScript
- [x] Variables de entorno en `.env.example` y `.env.local`
- [x] CLAUDE.md en la raíz del proyecto
- [x] `.planning/` con PROJECT.md, REQUIREMENTS.md, ROADMAP.md
- [x] Primer commit existe (40261af)
- [x] Supabase inicializado (`supabase init` → config.toml creado)
- [ ] `supabase start` levanta la DB local — BLOQUEADO: requiere Docker

## Notas
- El package `geist` se instaló como dependencia pero al final se usan las fonts via `next/font/google` que es la forma estándar de Next.js
- El proyecto usa Next.js 16.1.6 (la versión más reciente al crear el scaffold)
