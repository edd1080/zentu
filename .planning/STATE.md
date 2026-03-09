# Estado actual
Fase activa: 2
Bloque activo: 2.2 (siguiente)
Última sesión: 2026-03-09

## Qué se construyó (sesión 2026-03-09)
- Transición a nuevo agente (Antigravity), migrando `CLAUDE.md` a `.agents/rules.md`.
- Conexión a nuevo entorno Supabase (`rutzgbwziinixdrryirv.supabase.co`) actualizada en `.env.local`.
- 5 migraciones `.sql` empujadas e instaladas en el nuevo proyecto Supabase a través del MCP Server.
- Validación de que el bypass para OTP de WhatsApp (`000000`) funciona exitosamente para entornos de desarrollo `NODE_ENV === "development"`.
- Adición de enlaces rápidos a Login y Register en la landing page (`src/app/page.tsx`).
- Fix en `src/lib/supabase/middleware.ts` para permitir el acceso a `/verify-phone` después de crear cuenta en vez de rebotar directo a `/dashboard`.
- Skills vitales instaladas (`impeccable`, `superpowers`, `vercel-react-best-practices`, `vercel-composition-patterns`, `supabase-postgres-best-practices`) bypassando errores EPERM crónicos.

## Decisiones tomadas
- **Clonado manual de skills**. Ante bloqueos sistemáticos `EPERM` mediante `npx skills add` por permisos de `root` en `~/.npm`, se clonaron directamente los repositorios al workspace, integrando más de 25 skills bajo `.agents/skills/`.
- **MCP Server sobre Supabase CLI local**. Se aplicaron las migraciones mediante Model Context Protocol (MCP) en la nube en lugar del CLI, al estar la ejecución local rota por npm.

## Blockers
- Ninguno. Listos para empezar Bloque 2.2.

## DoD Bloque 2.1 ✅
- [x] Configuración de UI Auth (Login, Register, Phone Verify).
- [x] Supabase Auth integrado y funcional en desarrollo.
- [x] RPC `create_owner_with_business` creando registros atómicos.
- [x] Middlewares para Next.js protegiendo rutas.
- [x] Verificado el inicio de sesión y bypass del número de teléfono ("000000").
- [x] Skill-set final establecido en `.agents/skills`.

## Próximo paso
Bloque 2.2 — Onboarding M1.2 y M1.3.

## Commits
- `chore: session-end [bloque 2.1] auth setup & supabase MCP fix` (Pendiente)
