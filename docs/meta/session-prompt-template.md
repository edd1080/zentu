# AGENTI — Session Prompt Template v1.0
## Texto de inicio para cada sesión de Claude Code

**Versión:** 1.0
**Tipo:** Session Layer Doc — plantilla que el fundador completa al abrir Claude Code.
**Propósito:** Dar a Claude Code suficiente contexto para arrancar sin preguntas innecesarias,
orientado a la tarea concreta de la sesión, en menos de 2 minutos de setup.

---

## Cómo usar este documento

1. Copiar la plantilla de la sección que aplica (sesión normal, sesión de debug, sesión de revisión)
2. Rellenar los campos entre corchetes — máximo 2 minutos
3. Pegar en Claude Code al abrir la sesión
4. Ejecutar `/session-start` para que Claude Code cargue el contexto del STATE.md

---

## Plantilla A — Sesión de desarrollo normal

> Usar para: construir un bloque nuevo, continuar un bloque en progreso, completar tareas del plan.

```
Vamos a trabajar en AGENTI. Contexto rápido:

Fase activa: [ej. Fase 1 — Fundación]
Bloque activo: [ej. Bloque 1.2 — Esquema de base de datos]
Estado: [ej. en progreso / empezando desde cero]

Lo que quedó pendiente de la última sesión:
[una o dos líneas de lo que no se terminó, o "nada, empezamos bloque nuevo"]

Lo que quiero completar hoy:
[una o dos líneas del objetivo concreto de esta sesión]

Cambios o decisiones desde la última sesión:
[cualquier cosa que haya cambiado fuera de Claude Code — decisión de producto, cambio de enfoque, o "ninguno"]

Ejecuta /session-start para cargar el contexto completo y confirma el plan antes de empezar.
```

---

## Plantilla B — Sesión de debug

> Usar cuando algo no funciona y ya intentaste resolverlo al menos una vez.

```
Vamos a trabajar en AGENTI. Necesito debug.

Problema:
[descripción clara del síntoma — qué se esperaba, qué está pasando]

Contexto:
- Bloque donde ocurre: [ej. Bloque 3.1 — Webhook]
- Cuándo empezó: [ej. después de agregar la validación de firma]
- Ya intenté: [qué probaste y qué pasó]

Archivos probablemente involucrados:
[lista de archivos sospechosos, o "no sé cuáles son"]

Invoca el agente debugger para diagnóstico sistemático. No quiero un parche rápido — quiero la causa raíz.
```

---

## Plantilla C — Sesión de revisión antes de avanzar de bloque

> Usar antes de marcar un bloque como completo y avanzar al siguiente.

```
Vamos a trabajar en AGENTI. Quiero verificar que el bloque [N.N] está completo.

Bloque a revisar: [ej. Bloque 2.1 — Autenticación]

Lo que se construyó en este bloque:
[lista breve de lo que se implementó]

Ejecuta /phase-done para verificar el DoD completo.
Después invoca el agente reviewer para revisar seguridad y arquitectura antes de avanzar.
```

---

## Plantilla D — Sesión de tarea rápida (ad-hoc)

> Usar para bugs, correcciones de UI, ajustes pequeños que no son parte de un bloque del plan.

```
Vamos a trabajar en AGENTI. Tarea rápida:

Qué hacer: [descripción concreta de la tarea]
Archivos afectados: [lista o "no sé"]
Bloque activo del plan (no tocarlo): [ej. Bloque 3.2]

Usa /gsd:quick para esto — no es parte del plan de desarrollo, es una corrección puntual.
```

---

## Plantilla E — Primera sesión (setup inicial del proyecto)

> Usar solo una vez, al crear el proyecto por primera vez.

```
Vamos a inicializar el proyecto AGENTI desde cero.

Este es el contexto completo del proyecto:
- Qué es: agente de IA para WhatsApp que responde mensajes de clientes de PYMEs en Guatemala
- Stack: Next.js 14 + Supabase + Edge Functions (Deno) + Gemini Flash 2.5 + Meta Cloud API
- Plan de desarrollo: 7 fases documentadas en docs/development-plan.md
- Sistema de workflow: GSD (get-shit-done) + reglas en .claude/

Tengo todos los documentos de referencia en docs/:
- project-brief.md, prd.md, data-entities.md, event-map.md, tad.md
- whatsapp-integration.md, backend-logic.md, ui-spec.md, screen-specs.md
- development-plan.md

La estructura de .claude/ ya está configurada con CLAUDE.md, skills, commands y agents.

El primer objetivo es completar el Bloque 1.1 del plan (setup del proyecto):
- Crear proyecto Next.js con App Router, TypeScript y Tailwind
- Configurar Supabase local
- Instalar GSD
- Crear los archivos .planning/ iniciales desde los docs del proyecto
- Primer commit

Antes de escribir código, lee docs/project-brief.md y docs/prd.md.
Luego ejecuta /check-docs para confirmar qué más leer antes del Bloque 1.1.
```

---

## Guía de referencia rápida — qué plantilla usar

| Situación | Plantilla |
|---|---|
| Continuar el trabajo normal del plan | A |
| Empezar un bloque nuevo | A |
| Algo no funciona y ya lo intenté | B |
| Antes de avanzar de bloque o fase | C |
| Bug, corrección de UI, ajuste rápido | D |
| Primera sesión del proyecto | E |

---

## Notas de uso

**El campo "Cambios desde la última sesión" en la Plantilla A es el más importante.**
Claude Code no recuerda conversaciones anteriores. Cualquier decisión de producto, cambio de enfoque o nueva restricción que hayas tomado fuera de Claude Code tiene que estar en ese campo. Si no lo pones, Claude Code va a asumir que nada cambió y puede construir sobre una base desactualizada.

**No sobre-explicar en las plantillas.**
Claude Code tiene acceso a todos los documentos en docs/ y a STATE.md. No necesitas resumir el proyecto completo en el prompt de sesión — necesitas darle la orientación específica de esta sesión. Menos es más.

**Después de rellenar la plantilla, ejecutar siempre `/session-start`.**
Ese comando carga el STATE.md y confirma el plan de la sesión antes de empezar a construir. Los 2 minutos que toma evitan 30 minutos de trabajo en la dirección equivocada.

**Al final de cada sesión, ejecutar siempre `/session-end`.**
Ese comando actualiza STATE.md, captura decisiones y errores, y prepara el handoff para la próxima sesión. Sin ese paso, la próxima sesión empieza a ciegas.

---

## Ejemplo de sesión completamente rellenada

Esta es la Plantilla A rellenada para una sesión real en el Bloque 3.3:

```
Vamos a trabajar en AGENTI. Contexto rápido:

Fase activa: Fase 3 — Motor del agente
Bloque activo: Bloque 3.3 — Clasificación, generación y evaluación
Estado: empezando desde cero, el Bloque 3.2 quedó completo en la sesión anterior

Lo que quedó pendiente de la última sesión:
El build-agent-context quedó funcionando con cache de 1 hora. La invalidación de caché
también funciona. Los tests del Bloque 3.2 pasaron todos.

Lo que quiero completar hoy:
Implementar el pipeline completo desde clasificación de intención hasta creación de
Suggestion o Escalation. Quiero terminar con al menos un test end-to-end funcionando:
mensaje de prueba entra al pipeline, sale una Suggestion con confidence_tier calculado.

Cambios o decisiones desde la última sesión:
Decidí que el confidence_tier mínimo para enviar autónomo (cuando el dueño active Nivel 1)
va a ser "high", no "medium". Eso afecta el cálculo en Bloque 3.3. El resto sin cambios.

Ejecuta /session-start para cargar el contexto completo y confirma el plan antes de empezar.
```

---

*AGENTI — Session Prompt Template v1.0*
