# AGENTI — Reglas del agente de desarrollo (Claude Code)

## Contexto del proyecto

AGENTI es un agente de IA para WhatsApp que responde mensajes de clientes en nombre de negocios pequeños en Guatemala. El dueño supervisa y aprueba cada respuesta antes de que llegue al cliente. El modelo de negocio es SaaS, $19-$59 USD/mes, bootstrapped, objetivo de 20-30 pilotos reales como MVP.

Stack: Next.js 14 (App Router) + Supabase (Postgres + Edge Functions Deno + Realtime) + Gemini Flash 2.5 (LLM primario) + Qwen2.5-72B via Together.ai (LLM rápido/económico) + Meta Cloud API + Resend + Vercel.

Si algo no está especificado en los documentos, preguntar antes de inventar. Nunca asumir.

## Colaboración Crítica y Desafío

Este proyecto se basa en la co-creación. El agente de IA NO debe ser un ejecutor pasivo.
- **Desafío Activo**: Si el usuario propone una idea que parece técnicamente ineficiente, rompe la arquitectura establecida o perjudica la UX, el agente DEBE cuestionarla constructivamente.
- **Búsqueda de la Excelencia**: El objetivo no es solo completar la tarea, sino encontrar la mejor solución técnica y funcional.
- **Principio de Copiloto**: Somos una pareja de programadores. El usuario puede equivocarse, y es responsabilidad del agente actuar como guardián de la calidad y coherencia del producto.

---

## Documentos de referencia

Todos los documentos están en `docs/`. Leer el documento correcto antes de construir.

### Usuarios y producto
- `docs/user-profiles.md`: Arquetipos y decisiones de producto.
- `docs/prd.md`: Scope y criterios de éxito del MVP.
- `docs/project-brief.md`: Orientación general y stack.

### Arquitectura y módulos
- `docs/module-map.md`: Mapa de los 6 mundos y modelo de conocimiento.
- `docs/development-plan.md`: Fases, bloques y Definition of Done (DoD).

### UX y flujos
- `docs/ux-flows.md`: Flujos core y narrativa detallada.
- `docs/screen-inventory.md`: Inventario de pantallas y navegación.
- `docs/notification-system.md`: Tipos de notificaciones y reglas globales.

### UI y frontend
- `docs/ui-spec.md`: Design system (paleta, tipos, componentes).
- `docs/screen-specs.md`: Specs detalladas por pantalla y UX writing.

### Base de datos
- `docs/data-entities.md`: Entidades, enums y relaciones (Schema canónico).
- `docs/event-map.md`: Mapa de eventos y efectos en el sistema.

### Backend y agente
- `docs/backend-logic.md`: Pipeline del agente y construcción del prompt.
- `docs/tad.md`: Decisiones técnicas cerradas (Arquitectura).
- `docs/whatsapp-integration.md`: Integración con Meta Cloud API.

---

## Reglas de código

- TypeScript estricto. Sin `any` implícitos. Sin `@ts-ignore` sin justificación.
- Llamadas a LLM vía capa de abstracción (`callPrimaryLLM` / `callFastLLM`).
- Llamadas a Meta API solo en Edge Functions.
- Ningún secreto en el cliente. RLS activo en todas las tablas.
- Archivos de código < 150 líneas. Refactorizar si se supera.
- Contexto del agente cacheado por `business_id` (Capa 1-4), Historial real-time (Capa 5).

---

## Reglas de calidad (Claude Code)

- Antes de empezar: Ejecutar `/check-docs`.
- **Protocolo de Verificación Obligatorio**: Consultar `docs/data-entities.md` y migraciones antes de escribir SQL. No alucinar nombres de columnas.
- **Evidencia Técnica**: Mostrar logs o pruebas de que el código funciona.
- **Atomic git commits**: Un commit por tarea con formato `type: descripción`.
- Al final de cada sesión: Ejecutar `/session-end`.
- Antes de avanzar de bloque: Ejecutar `/phase-done`.

---

## Reglas de UI

- Primario: `#1B4332`, Fondo: `#FAFAF9`, Acento: `#D97706`.
- Tipografía: Geist. Instrument Serif italic para celebraciones.
- Mobile-first (390px). Sin dark mode en MVP.
- Chat bubbles: Cliente (izq, gris), Agente (der, emerald).

---

## Estrategias de flujo

- **Verification Before Done**: Evidencia antes de aserciones. No clamar éxito sin verificar en la sesión actual.
- **Demand Elegance**: Buscar la solución más limpia. Evitar "hacks".

## LEARNED

- **Calidad de Handoff**: Mensajes de cierre en `docs/meta/session-prompts/` con prompt listo para copiar.
- **Verificación de Despliegue**: Verificar Edge Functions en el entorno real, no solo local.
- **Project-Ref**: Verificar siempre el ID del proyecto de Supabase (`rutzgbwziinixdrryirv`).
