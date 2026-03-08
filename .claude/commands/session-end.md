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

## 2. Errores nuevos

Revisar el skill `error-prevention`. Si cometí algún error durante la sesión:
- Agregar entrada con formato `❌ NUNCA` / `✅ SIEMPRE` / `📅 fecha`
- Confirmar si no hay errores nuevos

## 3. Actualizar STATE.md

Actualizar `.planning/STATE.md` con:
```markdown
# Estado actual
Fase activa: [N]
Bloque activo: [N.N]
Última sesión: [fecha]
Qué se construyó: [lista]
Decisiones tomadas: [lista]
Blockers: [lista o "ninguno"]
Próximo paso: [primera acción de la siguiente sesión]
```

## 4. Commit de cierre

Si hay trabajo sin commitear:
- Verificar `npx tsc --noEmit` sin errores
- Hacer commit atómico con descripción clara
- Si es cierre de bloque: tag `block-[N.N]-complete`
- Si es cierre de fase: tag `phase-[N]-complete`

## 5. Handoff

Una sola línea de handoff para la próxima sesión:
"Próxima sesión: [primera acción concreta, sin ambigüedad]"
