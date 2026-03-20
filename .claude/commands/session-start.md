---
description: >
  Inicia una sesión de desarrollo de AGENTI. Lee el estado actual del proyecto,
  carga el contexto necesario y prepara el contexto para trabajar en la fase activa.
---

# Session Start — AGENTI

Sigue estos pasos al iniciar la sesión:

1. **Recuperar Contexto Maestro**:
   - Leer `.planning/STATE.md` para entender: Fase activa, bloque, últimos cambios y blockers.
   - Leer `tasks/lessons.md` y `.claude/skills/error-prevention/SKILL.md` para evitar repetir errores.

2. **Verificar Objetivos del Bloque**:
   - Leer el Definition of Done (DoD) del bloque activo en `docs/development-plan.md`.
   - Revisar el Roadmap en `.planning/ROADMAP.md` si es necesario mayor detalle.

3. **Consultar Documentación**:
   - Ejecutar `/check-docs` para identificar qué archivos en `docs/` son aplicables hoy.

4. **Declaración de Intenciones**:
   - Formular un "Plan de sesión" estructurado con objetivos claros.
   - Confirmar el plan: "Vamos a construir [qué] para completar [bloque]. DoD: [criterio principal]."

5. **Sincronización Final**:
   - Preguntar al usuario si hay cambios de dirección o prioridades antes de empezar.
