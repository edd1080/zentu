---
description: Cierra la sesión activa haciendo inventario, revisando errores y actualizando el estado de planificación.
---
Al finalizar el trabajo de una sesión, ejecuta los siguientes pasos en orden:

1. **Inventario:** Revisa mentalmente (o listando los archivos modificados) qué se construyó exactamente en esta sesión. ¿Qué archivos se crearon o modificaron?
2. **Revisión de Errores:** Verifica si enfrentaste errores recurrentes, conflictos de dependencias o problemas arquitectónicos. También verifica que no hayas violado ninguna regla de `CLAUDE.md`.
3. **Lecciones Aprendidas:** Si recibiste correcciones del usuario o descubriste patrones a evitar, actualiza `tasks/lessons.md` siguiendo la skill de `self-improvement`.
4. **Actualización de Estado:** Usa la herramienta `replace_file_content` para actualizar el archivo `.planning/STATE.md`:
   - En la sección "Qué se construyó", añade el resumen de la sesión actual.
   - En "Decisiones tomadas", documenta cualquier desviación de la arquitectura original o decisiones de diseño.
   - En "Blockers", expón tareas bloqueadas.
   - En "DoD", marca las casillas completadas si corresponde.
   - Actualiza "Última sesión" a la fecha actual.
5. **Commit:** (Opcional, sujeto a instrucción del usuario) Si el usuario lo permite, prepara o sugiere el commit de cierre estilo "chore: session-end [bloque]".
