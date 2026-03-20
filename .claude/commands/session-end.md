---
description: >
  Finaliza una sesión de desarrollo de AGENTI con wrap-up ritual.
  Actualiza STATE.md, captura decisiones y lecciones, y prepara el handoff.
---

# Session End — AGENTI

Ejecuta este ritual al finalizar la sesión:

## 1. Inventario de la sesión

Responder estas tres preguntas:
- **¿Qué se construyó?** Lista concreta de archivos creados/modificados.
- **¿Qué decisiones se tomaron que no estaban en los docs?** Cualquier cosa que se resolvió en el momento y que debería documentarse.
- **¿Qué está bloqueado para la siguiente sesión?** Dependencias, decisiones pendientes, cosas que no funcionaron.

## 2. Errores y Lecciones

1. Revisar el skill `error-prevention`. Si cometí algún error durante la sesión:
   - Agregar entrada con formato `❌ NUNCA` / `✅ SIEMPRE` / `📅 fecha`
2. Actualizar `tasks/lessons.md` si se aprendió algo nuevo sobre el dominio del problema o herramientas.

## 3. Actualizar STATE.md

Actualizar `.planning/STATE.md` con:
- Fase y Bloque activo.
- Resumen de lo construido.
- Decisiones tomadas (desviaciones o lógica nueva).
- Blockers y Próximo paso.
- Marcar casillas del DoD si el bloque finalizó.

## 4. Handoff Document (Obligatorio)

Crear un documento en `docs/meta/session-prompts/YYYY-MM-DD_handoff_[bloque]_complete.md` con:
- **Prompt de Inicio:** Un bloque de texto listo para copiar y pegar que incluya: Fase/Bloque activo, estado detallado, pendientes, objetivos y decisiones críticas.
- **Inventario Técnico:** Listado exhaustivo de archivos modificados con su impacto.
- **Rigor:** Seguir el estándar de `2026-03-12-handoff-fase4-complete.md`.

## 5. Commit de cierre

- Verificar `npx tsc --noEmit` si hubo cambios en TypeScript.
- Realizar commit atómico con mensaje `type: descripción`.
- Si es cierre de bloque o fase, proponer tags correspondientes.
