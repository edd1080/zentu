---
description: Verifica rigurosamente el DoD antes de permitir el avance al siguiente bloque.
---
No puedes avanzar al siguiente bloque sin ejecutar esta validación exhaustiva:

1. Usa la herramienta `view_file` para leer el archivo `.planning/ROADMAP.md` y busca el DoD exacto del bloque que acabas de terminar.
2. Contraste de Realidad: Por cada punto en el DoD, evalúa si la implementación actual en el código responde fiel y completamente a lo solicitado.
3. Verificaciones de Calidad: 
   - ¿TypeScript compila sin errores?
   - ¿Los archivos modificados cumplen la regla de menos de 150 líneas?
   - ¿Has respetado las reglas estrictas de UI (si aplica) y de la Base de Datos (RLS activo en nuevas tablas)?
4. Si detectas un gap entre el DoD y el código, informa al usuario inmediatamente ("Hay elementos pendientes para cumplir el DoD") y NO des por terminada la fase.
5. Si el DoD se cumple al 100%, actualiza `.planning/STATE.md` cerrando el bloque activo y preparándolo para el siguiente (`Bloque N+1`). Informa al usuario que el bloque está oficialmente cerrado.
