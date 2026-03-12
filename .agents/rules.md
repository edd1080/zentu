# AGENTI — Reglas del agente de desarrollo

## Contexto del proyecto

AGENTI es un agente de IA para WhatsApp que responde mensajes de clientes en nombre de negocios pequeños en Guatemala. El dueño supervisa y aprueba cada respuesta antes de que llegue al cliente. El modelo de negocio es SaaS, $19-$59 USD/mes, bootstrapped, objetivo de 20-30 pilotos reales como MVP.

Stack: Next.js 14 (App Router) + Supabase (Postgres + Edge Functions Deno + Realtime) + Gemini Flash 2.5 (LLM primario) + Qwen2.5-72B via Together.ai (LLM rápido/económico) + Meta Cloud API + Resend + Vercel.

Si algo no está especificado en los documentos, preguntar antes de inventar. Nunca asumir.

---

## Documentos de referencia

Todos los documentos están en `docs/`. Leer el documento correcto antes de construir. La tabla indica qué contiene cada uno y cuándo es relevante.

### Usuarios y producto

| Documento | Contenido | Cuándo leerlo |
|---|---|---|
| `docs/user-profiles.md` | 3 arquetipos de usuario (Mirna/salón, Carlos/restaurante, Dr. Roberto/clínica), walkthrough cognitivo completo de cada uno, matriz comparativa, 3 decisiones de producto resueltas sobre número único, info dinámica y reglas de escalamiento | Antes de diseñar cualquier pantalla o flujo de onboarding |
| `docs/prd.md` | Qué construir, qué no construir, criterios de éxito medibles del MVP, scope explícito, exclusiones, riesgos conocidos | Antes de empezar cualquier bloque nuevo, para confirmar que la tarea está en scope |
| `docs/project-brief.md` | Orientación general del proyecto, stack completo con justificación, estructura de módulos, mapa de Edge Functions, cron jobs, variables de entorno, tabla de referencia de todos los docs | Primera lectura de cada sesión si STATE.md indica bloque nuevo |

### Arquitectura y módulos

| Documento | Contenido | Cuándo leerlo |
|---|---|---|
| `docs/module-map.md` | Mapa completo de los 6 mundos/módulos (M0 Landing, M1 Onboarding, M2 Operación diaria, M3 Entrenamiento, M4 Configuración, M5 Inteligencia), relaciones entre módulos, modelo de conocimiento en 4 capas | Antes de construir cualquier módulo o cuando necesites entender cómo conectan dos partes del producto |
| `docs/development-plan.md` | 7 fases, 16 bloques, DoD de cada bloque, criterio de avance entre fases, estructura de archivos `.planning/`, base del CLAUDE.md, STATE.md inicial | Antes de empezar cada bloque, para leer el DoD exacto que debes cumplir |

### UX y flujos

| Documento | Contenido | Cuándo leerlo |
|---|---|---|
| `docs/ux-flows.md` | 7 flujos core completos con narrativa detallada, estados del sistema, edge cases, condiciones de error — flujo de onboarding, conversación colaborativa, escalamiento, entrenamiento | Antes de implementar cualquier flujo de usuario; define el comportamiento esperado end-to-end |
| `docs/screen-inventory.md` | 41 pantallas priorizadas en 3 grupos (MVP crítico / MVP completo / post-MVP), 10 objetos de interfaz con definición y ubicación, modelo de navegación con justificación del bottom nav de 5 tabs | Antes de construir cualquier pantalla; confirmar que es MVP y cuál es su prioridad |
| `docs/notification-system.md` | 15 tipos de notificaciones, 8 reglas globales (silencio nocturno, agrupación, límite diario), canales por tipo, lógica de escalamiento urgente de 5 minutos | Antes de implementar cualquier notificación push o mensaje de WhatsApp al dueño |

### UI y frontend

| Documento | Contenido | Cuándo leerlo |
|---|---|---|
| `docs/ui-spec.md` | Design system completo: paleta de colores con tokens, escala tipográfica, sistema de espaciado, componentes con estados, reglas de accesibilidad, patrones de motion | Antes de escribir cualquier componente de UI; es la fuente de verdad visual |
| `docs/screen-specs.md` | Specs detalladas de frontend por módulo, 6 bloques de construcción reutilizables, sistema de UX writing con 4 tonos, reglas de estados vacíos y de carga | Al construir pantallas específicas; tiene el detalle de cada elemento por pantalla |

### Base de datos

| Documento | Contenido | Cuándo leerlo |
|---|---|---|
| `docs/data-entities.md` | 14 entidades con todos los atributos, tipos, enums, relaciones y transiciones de estado — Owner, Business, Agent, KnowledgeItem (4 capas), Conversation, Message, Suggestion, Escalation, Notification y más | Antes de cualquier migración, query o Edge Function; es el schema canónico |
| `docs/event-map.md` | 25 eventos en 5 bloques (registro, onboarding, operación, entrenamiento, notificaciones), trigger de cada evento, efectos en datos, efectos en UI, notificación disparada, estado siguiente | Antes de implementar cualquier interacción que cambia estado; define qué pasa en el sistema cuando algo ocurre |

### Backend y agente

| Documento | Contenido | Cuándo leerlo |
|---|---|---|
| `docs/backend-logic.md` | Pipeline completo del agente en 10 pasos, construcción exacta del prompt en 6 bloques con formato real, cálculo de confidence_tier, lógica de Suggestion vs Escalation, mecanismo de abstracción de conocimiento, 12 Edge Functions con responsabilidad de cada una, 6 cron jobs, 7 invariantes de backend | Antes de tocar cualquier Edge Function, cron job o lógica del agente |
| `docs/tad.md` | Decisiones técnicas cerradas y no negociables: arquitectura WhatsApp, motor del agente, estrategia LLM con abstracción, observabilidad, lista de partes determinísticas | Antes de proponer cualquier cambio arquitectural; si está en el TAD, está cerrado |
| `docs/whatsapp-integration.md` | Meta Cloud API completo, Embedded Signup paso a paso, manejo de coexistencia de número, arquitectura del webhook, envío de mensajes con reintentos, estados de conexión, seguridad | Antes de cualquier trabajo relacionado con WhatsApp o Meta |

---

## Reglas de código

- TypeScript estricto. Sin `any` implícitos. Sin `@ts-ignore` sin comentario explicativo que justifique por qué.
- Todas las llamadas a LLM pasan por la capa de abstracción (`callPrimaryLLM` / `callFastLLM`). Nunca llamar a Gemini o Together.ai directamente desde componentes o páginas.
- Todas las llamadas a Meta API ocurren en Edge Functions. Nunca en el cliente.
- Ningún secreto en el cliente. Ningún token de Meta accesible desde el navegador. Variables de entorno con prefijo `NEXT_PUBLIC_` solo para datos no sensibles.
- RLS activo en todas las tablas de Supabase. Sin excepción. Toda query filtra por `business_id` del usuario autenticado.
- Cada Edge Function tiene responsabilidad única. Sin Edge Functions que hagan dos cosas distintas.
- El webhook de WhatsApp responde HTTP 200 ANTES de procesar el mensaje. Nunca al revés. Meta cancela la entrega si no recibe 200 en 5 segundos.
- Capa 1 (structured) y Capa 2 (operational) de KnowledgeItems nunca se sobreescriben por aprendizaje implícito. Solo el dueño puede modificarlas explícitamente.
- Ningún archivo de código supera 150 líneas. Si llega a ese límite, refactorizar antes de continuar.
- El contexto del agente (Bloques 1-4 del prompt) se cachea por `business_id` con TTL de 1 hora. El Bloque 5 (historial de conversación) nunca se cachea — siempre en tiempo real.

---

## Reglas de calidad

- Antes de empezar cualquier tarea, ejecutar `/check-docs` para identificar qué documentos aplican.
- Verificar que el código funciona antes de marcar una tarea como completa. Nunca marcar done sin probar el flujo completo.
- Atomic git commits: un commit por tarea completada, con mensaje descriptivo en formato `type: descripción`.
- Si algo no funciona después de 2 intentos, documentar el problema en STATE.md y parar. No seguir intentando sin diagnóstico.
- Al final de cada sesión, ejecutar `/session-end` para actualizar STATE.md con decisiones tomadas y lecciones aprendidas.
- Antes de avanzar de bloque, ejecutar `/phase-done` para verificar el DoD completo del bloque.

---

## Reglas de UI

- El design system está en `docs/ui-spec.md`. No inventar colores, tipografías ni componentes nuevos sin consultar ese documento primero.
- Color primario: `#1B4332` (deep emerald). Fondo: `#FAFAF9` (warm white). Acento: `#D97706` (amber). Texto principal: `#1C1917`.
- Tipografía UI: Geist. Tipografía de celebración (solo para momentos de logro): Instrument Serif italic.
- Navegación: 5 tabs en bottom nav — Inicio, Conversaciones, Agente, Entrenar, Ajustes. Sin tabs adicionales en MVP.
- Mobile-first siempre. Diseñar para 390px de ancho. Sin dark mode en MVP.
- Sin animaciones complejas en MVP. Transiciones simples: 200ms ease para feedback de tap, nada más.
- Los chat bubbles del cliente van a la izquierda (fondo gris claro). Las respuestas del agente van a la derecha (fondo emerald suave). Las respuestas aprobadas por el dueño llevan un checkmark de aprobación.

---

## Reglas del agente de IA

- El pipeline del agente tiene un presupuesto de latencia: 500ms clasificación, 2000ms generación de Suggestion, 3s total p90. Si una implementación supera estos números en prueba, optimizar antes de continuar.
- El `confidence_tier` es determinístico — se calcula con `had_sufficient_context` + `approval_rate_7d` + `confidence_basis`. No lo evalúa el LLM.
- Temperatura LLM primario: 0.3. Temperatura LLM rápido: 0.1. Max tokens primario: 600. Max tokens rápido: 200.
- Los `knowledge_items_used` en el output del LLM son descripciones breves en texto, no UUIDs. El sistema resuelve los IDs por comparación semántica posterior.
- Los mensajes de WhatsApp al dueño requieren Meta Message Templates aprobados. Crear y aprobar templates antes del go-live en Fase 6.

---

## Superpowers y sistema GSD

Este proyecto usa `obra/superpowers` como framework de desarrollo. Las skills de Superpowers se activan automáticamente según el contexto. El sistema GSD de AGENTI tiene precedencia sobre los comandos de planning de Superpowers — usar `.planning/STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md` y `PROJECT.md` como fuente de verdad del estado del proyecto.

Las skills de TDD, debugging sistemático, code review y verification-before-completion de Superpowers se aplican tal cual — no hay conflicto con el sistema GSD en esas áreas.

---

## Self-correction

Cuando corrijas un error o descubras un patrón que no debería repetirse:
1. Sigue el protocolo de la skill `self-improvement`.
2. Registra la lección en `tasks/lessons.md` siguiendo el template.
3. Agrega la regla aprendida a la sección LEARNED de este archivo.
4. Si es un patrón de seguridad o de arquitectura, agrégala también al skill correspondiente.

## Estrategias de flujo

- **Subagent Strategy**: Offload research, exploration, and parallel analysis to subagents using `dispatching-parallel-agents`. One task per subagent.
- **Verification Before Done**: Evidence before assertions. Use `verification-before-completion`. Never claim success without running the verification command in the current session.
- **Demand Elegance**: For non-trivial changes, pause and ask "is there a more elegant way?". Avoid hacky solutions.

## LEARNED

- **Calidad de Handoff:** Los documentos de cierre de sesión en `docs/meta/session-prompts/` deben incluir siempre un prompt listo para copiar y un inventario técnico detallado. El estándar mínimo es el establecido en `2026-03-12-handoff-fase4-complete.md`.
