---
description: >
  Verifica qué documento de referencia leer antes de implementar la tarea actual.
  Usar antes de empezar cualquier tarea no trivial.
---

# Check Docs — AGENTI

Antes de implementar, ejecuta este protocolo:

## 1. Análisis de la tarea

Identificar el dominio de la tarea actual:
- ¿Toca la base de datos, tablas o migraciones? → `docs/data-entities.md`
- ¿Implementa un evento o acción del usuario? → `docs/event-map.md`
- ¿Construye el webhook, LLM, pipeline o Edge Functions? → `docs/tad.md` + `docs/backend-logic.md`
- ¿Integra Meta API, WhatsApp o Embedded Signup? → `docs/whatsapp-integration.md`
- ¿Construye un componente, pantalla o flujo de UI? → `docs/ui-spec.md` + `docs/screen-specs.md`
- ¿Hay duda de si algo está en el scope del MVP? → `docs/prd.md`
- ¿Necesito orientación general del stack o arquitectura? → `docs/project-brief.md`

## 2. Skills aplicables

Identificar qué skills son relevantes:
- Migraciones SQL o queries Supabase → `supabase-patterns`
- Tokens, RLS, webhook, secretos → `security`
- Pipeline, LLM, Suggestions, Escalations → `agent-pipeline`
- Componentes, colores, tipografía, estados → `ui-conventions`
- Siempre al finalizar → `error-prevention`

## 3. Declaración de plan

Antes de escribir código, declarar:
```
Voy a implementar: [descripción]
Archivos que voy a crear o modificar: [lista]
Documentos consultados: [lista]
Skills que aplican: [lista]
No está en el scope del MVP: [lista de cosas que podría hacer pero no haré]
```

Si hay ambigüedad o conflicto entre lo que se pide y lo que dice un doc → STOP, citar el doc y proponer opciones.
