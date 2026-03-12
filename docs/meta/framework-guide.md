# Guía del Framework de Desarrollo: Bloque a Bloque (Manual Maestro)

Esta guía documenta el framework de desarrollo diseñado a prueba y error para la orquestación eficiente entre humanos y agentes de IA. Este método asegura la consistencia arquitectónica, evita la pérdida de contexto y permite una escalabilidad predecible hasta producción.

---

## 1. El "Estado Cero": El Big Bang del Proyecto

Todo proyecto bajo este framework NO inicia en el IDE, sino en una conversación estratégica con un LLM (Claude/GPT).

### Paso 1: Ideación y Definición
Se usa el LLM para definir el ADN del proyecto. El resultado de esta fase debe ser la creación manual (o asistida) de la estructura inicial de carpetas y los "Documentos Maestros".

### Paso 2: El Prompt de Contexto Maestro
Se genera un documento (ej. `docs/meta/initial-prompt.md`) que contiene instrucciones sobre el rol del agente, el stack tecnológico y las reglas de oro. Este prompt se pega al inicio de cada nueva sesión si el agente no tiene memoria persistente.

### Paso 3: Planeación Extendida (Camino a Producción)
A diferencia de otros métodos, aquí **se mapea todo el camino hasta producción desde el día 1**. No se planean solo las siguientes dos semanas. Se crea un `ROADMAP.md` exhaustivo que detalla cada fase hasta el Go-Live. Esto evita que el agente "improvise" el futuro cuando termina un bloque.

---

## 2. Inventario de Documentos (Source of Truth)

Un proyecto Agentis se rige por estos documentos, organizados por propósito:

### A. Core Planning (`.planning/`)
-   **[`PROJECT.md`](file:///Users/ecalderonl/Desktop/agentis/.planning/PROJECT.md):** Visión, propuesta de valor, stack y arquitectura de alto nivel.
-   **[`ROADMAP.md`](file:///Users/ecalderonl/Desktop/agentis/.planning/ROADMAP.md):** Flujo lineal de fases y bloques con sus DoDs (Definition of Done) específicos.
-   **[`REQUIREMENTS.md`](file:///Users/ecalderonl/Desktop/agentis/.planning/REQUIREMENTS.md):** Reglas de negocio, constraints técnicos y casos de uso.
-   **[`STATE.md`](file:///Users/ecalderonl/Desktop/agentis/.planning/STATE.md):** Registro vivo del progreso, decisiones tomadas y blockers actuales.

### B. Especificaciones de Producto (`docs/`)
-   **[`prd.md`](file:///Users/ecalderonl/Desktop/agentis/docs/prd.md):** Product Requirements Document.
-   **[`tad.md`](file:///Users/ecalderonl/Desktop/agentis/docs/tad.md):** Technical Architecture Document.
-   **[`screen-specs.md`](file:///Users/ecalderonl/Desktop/agentis/docs/screen-specs.md):** Detalle píxel-perfect y lógica de cada pantalla.
-   **[`development-plan.md`](file:///Users/ecalderonl/Desktop/agentis/docs/development-plan.md):** Guía técnica de implementación por módulos.
-   **[`backend-logic.md`](file:///Users/ecalderonl/Desktop/agentis/docs/backend-logic.md):** Definición de Edge Functions y flujos de datos.

### C. Aprendizaje y Mejora (`tasks/`)
-   **[`lessons.md`](file:///Users/ecalderonl/Desktop/agentis/tasks/lessons.md):** El cerebro del proyecto. Aquí se guardan los errores cometidos y las correcciones del usuario para que nunca se repitan.

---

## 3. Catálogo de Skills (Habilidades del Agente)

El agente tiene instaladas habilidades especializadas en `.agents/skills/`. Estas son las más críticas:

| Skill | Propósito |
| :--- | :--- |
| `self-improvement` | Gestiona el bucle de aprendizaje en `lessons.md`. |
| `test-driven-development` | Obliga a escribir tests antes que el código de producción. |
| `frontend-design` | Asegura que la UI sea premium (Vibrant colors, glassmorphism, etc.). |
| `systematic-debugging` | Proceso riguroso para encontrar errores sin dar vueltas. |
| `writing-plans` | Genera los planes de implementación antes de codificar. |
| `verification-before-completion` | Valida el DoD antes de decir "terminé". |
| `subagent-driven-development` | Orquesta tareas complejas delegando a sub-agentes. |

---

## 4. Workflows: Comandos de Proceso (Slash Commands)

Los comandos en `.agents/workflows/` definen la etiqueta de trabajo:

1.  **`/session-start`**: Recupera el contexto de `STATE.md`, `lessons.md` y propone el plan del día.
2.  **`/planning-protocol`**: Fuerza la lectura de specs (`screen-specs.md`, `prd.md`) antes de crear un plan.
3.  **`/check-docs`**: Identifica qué documentos son relevantes para la tarea actual.
4.  **`/phase-done`**: Auditoría final del DoD contra el código real antes de avanzar de bloque.
5.  **`/session-end`**: Actualiza el estado, guarda lecciones y prepara el handoff.

---

## 5. Guía de Replicación Paso a Paso

¿Quieres iniciar un nuevo proyecto con este framework? Sigue este tutorial:

### Paso 1: Configuración del Repositorio
Crea las carpetas base:
-   `mkdir .planning .agents docs tasks`
-   Copia los workflows base a `.agents/workflows/`.

### Paso 2: Definición de Documentación (Estado Cero)
No codifiques nada. Ve a tu LLM y dile: *"Vamos a planear un proyecto [X]. Necesito que generes el PRD, el ROADMAP completo hasta producción (al menos 6 fases), y el INITIAL_STATE"*.
-   Pega estos archivos en sus carpetas correspondientes.

### Paso 3: Instalación de Skills
Copia las carpetas de skills necesarias de un proyecto existente a tu carpeta `.agents/skills/`. Asegúrate de que `self-improvement` y `writing-plans` estén presentes.

### Paso 4: La Regla de Oro (150 Líneas)
Configura tu `CLAUDE.md` o `.agents/rules.md` para prohibir archivos de más de 150 líneas. Esto fuerza la modularidad y facilita la lectura del agente.

### Paso 5: El Primer Sprint
Ejecuta `/session-start`. El agente leerá tu planificación extendida y te dirá: *"Estoy listo para el Bloque 1.1: Setup Estructural. ¿Procedo a crear el Implementation Plan?"*. Confirma con "GO".

---

## 6. Reglas Generales y Cultura de Trabajo

-   **Prohibido el Cortoplacismo:** Si el agente sugiere algo que rompe la arquitectura futura definida en el `ROADMAP.md`, rechaza la sugerencia.
-   **Evidencia sobre Afirmación:** El agente nunca debe decir "ya está listo" sin mostrar el output de los tests o la verificación manual.
-   **Aprendizaje Atómico:** Cada error detectado por el usuario debe terminar en `lessons.md` mediante la skill `self-improvement`.
-   **Planificación Obligatoria:** Ningún cambio significativo ocurre sin un `implementation_plan.md` aprobado previamente.
