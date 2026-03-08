# Estado actual

Fase activa: 1
Bloque activo: 1.1 (completado, pendiente commit final)
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

## Blockers
- Ninguno. El blocker de Docker se resolvió usando Supabase Cloud.

## DoD Bloque 1.1
- [x] `npm run dev` corre sin errores (HTTP 200 verificado)
- [x] `next build` compila sin errores de TypeScript
- [x] Variables de entorno en `.env.example` y `.env.local`
- [x] CLAUDE.md en la raíz del proyecto
- [x] `.planning/` con PROJECT.md, REQUIREMENTS.md, ROADMAP.md
- [x] Primer commit existe (40261af)
- [x] Supabase inicializado y vinculado a Cloud (conexión verificada HTTP 200)

## Notas
- El package `geist` se instaló como dependencia pero al final se usan las fonts via `next/font/google` que es la forma estándar de Next.js
- El proyecto usa Next.js 16.1.6 (la versión más reciente al crear el scaffold)
- Supabase CLI v2.48.3 instalada; hay v2.75.0 disponible (actualizar cuando sea conveniente)
