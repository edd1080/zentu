---
description: >
  Verifica que el bloque o fase actual cumple su Definition of Done
  antes de avanzar al siguiente. Usar antes de marcar cualquier bloque como completo.
---

# Phase Done — AGENTI

Ejecuta este protocolo de verificación antes de marcar un bloque como completo:

## 1. Leer el DoD

Abrir `docs/development-plan.md` (o `.planning/ROADMAP.md`) y localizar el Definition of Done del bloque actual.
Listar cada criterio del DoD explícitamente.

## 2. Verificar cada criterio

Para cada criterio del DoD:
- Ejecutar la verificación correspondiente (prueba manual, test automatizado, revisión de código)
- Marcar como ✅ PASA o ❌ FALLA con evidencia concreta
- Si falla → documentar qué falta y proponer el plan para completarlo

## 3. Verificaciones técnicas obligatorias

Independientemente del DoD específico:
- `npx tsc --noEmit` — sin errores de tipos
- **Regla de 150 líneas**: Sin archivos mayores a 150 líneas (refactorizar si es necesario)
- Sin `console.log` de debug en código que va a producción
- Sin `TODO` o `FIXME` sin issue asociado
- Todas las variables de entorno usadas existen en `.env.example`
- RLS activo en toda tabla nueva creada en este bloque

## 4. Resultado

Si todos los criterios pasan:
- Hacer commit de cierre con tag `block-[N.N]-complete`
- Actualizar `STATE.md` con el bloque completado
- Reportar: "Bloque [N.N] completo. Próximo bloque: [N.N+1]"

Si algún criterio falla:
- Listar exactamente qué falta
- Estimar el trabajo restante
- NO avanzar al siguiente bloque hasta que todos pasen
