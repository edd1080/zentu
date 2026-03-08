# AGENTI — Estrategia de Skills y Agentes v1.0
## Guía de selección, instalación y uso inteligente del ecosistema de Claude Code

**Versión:** 1.0
**Tipo:** Strategy Layer Doc — decisiones de qué instalar, cuándo y por qué.
**Responde:** ¿Más skills = mejor? ¿Cuáles instalan los que en verdad saben?

---

## La pregunta más importante: ¿cuándo más es peor?

Antes de hablar de qué instalar, hay que entender cómo funcionan las skills técnicamente. Cuando Claude Code arranca una sesión, lee el frontmatter (el resumen corto) de TODAS las skills instaladas para saber cuándo activar cada una. Ese frontmatter vive en el system prompt de cada sesión.

Las implicaciones son directas:

**Con pocas skills bien elegidas:** Claude tiene contexto limpio, activa la skill correcta en el momento correcto, ejecuta con precisión.

**Con muchas skills mal elegidas:** El system prompt se llena de instrucciones que se contradicen, el routing se confunde, Claude activa skills que no corresponden, o peor — ignora la skill correcta porque hay demasiado ruido. También aumenta el costo por sesión.

La regla de los practicantes con más experiencia en el ecosistema (obra, Vercel Labs, los propios ingenieros de Anthropic): **10-15 skills focalizadas en el stack y el tipo de trabajo específico baten a 40 skills genéricas, siempre.**

El número mágico documentado en producción: entre 8 y 15 skills activas por proyecto. Más de 20 empieza a generar degradación measurable en precisión.

---

## Los 4 niveles del ecosistema actual

Antes de la lista de recomendaciones, el mapa del territorio:

**Nivel 1 — Oficial Anthropic:** Skills que Anthropic mantiene y usa en producción (`anthropics/skills`). Las más probadas, más seguras, más confiables. Cubren documento creation, frontend design, webapp testing, MCP builder.

**Nivel 2 — Labs de primer nivel:** Vercel Labs, Supabase, Better Auth, obra/superpowers. Equipos con millones de usuarios reales, skills auditadas, actualizadas regularmente. Estas son las que instalan los senior devs.

**Nivel 3 — Comunidad validada:** Skills con 400+ installs verificadas, repositorios activos, auditorías de seguridad pasadas (Socket, Snyk). Requieren más evaluación antes de instalar.

**Nivel 4 — Comunidad experimental:** Todo lo demás. Puede ser brillante o puede ser un SKILL.md de 10 líneas envuelto en marketing. Evaluar antes de instalar.

Para AGENTI, la recomendación es: Nivel 1 completo + Nivel 2 selectivo + máximo 2-3 de Nivel 3 con auditoría previa.

---

## Stack recomendado para AGENTI

### Tier Core (instalar antes de la primera sesión de desarrollo)
Estas van antes de escribir la primera línea de código.

**`obra/superpowers`**
El más importante de todos. No es una skill — es un framework completo de desarrollo que incluye 20+ skills que se activan automáticamente según el contexto. Lo que aporta a AGENTI específicamente:

- `brainstorming` — activa cuando describes una feature nueva; refina requirements con preguntas Socráticas antes de que Claude toque código
- `writing-plans` — convierte el diseño aprobado en tareas de 2-5 minutos con rutas exactas de archivos y pasos de verificación
- `subagent-driven-development` — despacha un subagente por tarea con revisión en dos etapas (spec compliance + code quality); permite que Claude trabaje 1-2 horas autónomamente sin desviarse del plan
- `systematic-debugging` — proceso de 4 fases (causa raíz, análisis de patrones, prueba de hipótesis, implementación); elimina el ciclo de prueba-y-error aleatorio que destruye horas de trabajo
- `test-driven-development` — RED-GREEN-REFACTOR obligatorio; si escribiste código antes del test, el código se borra, sin excepciones
- `verification-before-completion` — requiere evidencia concreta (output de comandos reales) antes de marcar cualquier tarea como completa
- `requesting-code-review` — activa entre tareas; revisa contra el plan, reporta issues por severidad; issues críticos bloquean progreso

Instalación:
```
/plugin marketplace add obra/superpowers
```

El CLAUDE.md ya que construimos tiene elementos similares, pero Superpowers los hace mandatorios en lugar de sugeridos. Es la diferencia entre "debería hacer TDD" y "el código escrito antes del test se borra sin excepción". Esa rigidez intencional es exactamente lo que necesita un proyecto bootstrapped donde cada hora cuenta.

---

**`vercel-labs/agent-skills` — vercel-react-best-practices`**
57 reglas de performance en Next.js/React organizadas por impacto. Para AGENTI esto no es opcional — nuestro stack es exactamente Next.js 14 + App Router + TypeScript. Las reglas más críticas para nuestro caso:

- `async-parallel` — `Promise.all()` para operaciones independientes (relevante en cada Edge Function del pipeline)
- `bundle-barrel-imports` — importar directamente, no desde barrel files (problema clásico con Tailwind + componentes)
- `server-cache-react` — `React.cache()` para deduplicación por request (crítico para el contexto del agente)
- `rerender-derived-state` — suscribir a booleans derivados, no al estado crudo (afecta el inbox de conversaciones en tiempo real)
- `rendering-content-visibility` — para listas largas de conversaciones (el inbox puede tener 100+ chats)

Instalación:
```
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
```

---

**`vercel-labs/agent-skills` — vercel-composition-patterns`**
El complemento del anterior. Donde `vercel-react-best-practices` cubre performance, este cubre arquitectura de componentes. Para AGENTI es especialmente relevante en el módulo de Conversaciones y el sistema de notificaciones, que tienen componentes complejos con múltiples estados. La regla `architecture-avoid-boolean-props` sola justifica la instalación — es el patrón que más degrada la calidad de los componentes cuando Claude Code los genera sin restricción.

Instalación:
```
npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns
```

---

**`supabase/agent-skills` — supabase-postgres-best-practices`**
Mantenida por el equipo oficial de Supabase. Cubre exactamente lo que definimos en nuestro TAD y Data Entities: RLS patterns, Edge Functions (Deno), query optimization, Realtime subscriptions, manejo de migrations. Sin esta skill, Claude Code va a generar queries sin índices, RLS policies incompletas, y Edge Functions con el antipatrón de responder después de procesar (nuestro primer invariante en el backend: responder 200 ANTES de procesar). Con la skill instalada, estos patrones son parte del conocimiento base.

Instalación:
```
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices
```

---

**`anthropics/skills` — frontend-design`**
Ya está disponible en Claude Code. La mencionamos porque Impeccable (ver más abajo) la extiende directamente. Por sí sola genera UI production-grade que evita el "AI slop" estético genérico. Relevante en las Fases 2-4 cuando construimos el dashboard del dueño.

Activación en Claude Code:
```
/plugin install example-skills@anthropic-agent-skills
```

---

**`anthropics/skills` — webapp-testing`**
Para las Fases 3-5 cuando el pipeline del agente ya está corriendo. Testing automatizado de flujos completos: mensaje entra, pipeline procesa, Suggestion se crea, dueño aprueba. Sin esta skill Claude Code trata los tests como opcionales. Con ella los trata como criterio de completitud.

---

### Tier Design (instalar antes de Fase 2 — cuando empieza el trabajo de UI)

**`pbakaus/impeccable`**
Impeccable es una extensión del `frontend-design` de Anthropic, no un reemplazo. La instalas encima, y agrega:
- 17 comandos de diseño que ponen vocabulario de diseñador en tus manos: `/polish`, `/audit`, `/distill`, `/bolder`, `/balance`, `/hierarchy`, etc.
- Un sistema de anti-patrones expandido (el "Before/After" que muestra en el sitio — el "After" es la diferencia entre UI genérica e interfaz que se siente construida por un diseñador)
- La versión enhanced del skill base con patrones más específicos de tipografía, color, layout y motion

Para AGENTI específicamente: el sistema de diseño que definimos (emerald + warm white + amber, Geist, mobile-first, WhatsApp-native) necesita que Claude Code lo aplique con consistencia en cada pantalla. Impeccable hace que los comandos como `/audit` corran contra esos principios, no contra defaults genéricos.

Instalación:
```
/plugin marketplace add pbakaus/impeccable
```

---

**`better-auth/skills` — better-auth-best-practices`**
Relevante cuando implementemos el Bloque 2.1 (autenticación). Better Auth es el sistema de auth más sólido del ecosistema Next.js actual, y esta skill cubre exactamente los patterns de email/Google que definimos en el TAD.

```
npx skills add better-auth/skills --skill better-auth-best-practices
```

---

### Tier Opcional / Post-MVP (evaluar en Fase 5+)

Estas son valiosas pero no críticas para el MVP:

**`vercel-labs/next-skills` — next-best-practices`**
Complementa `vercel-react-best-practices` con patterns específicos de Next.js App Router (Server Actions, metadata, caching estratégico). Instalar cuando llegues a optimización en Fase 6.

**`NeoLabHQ/code-review`**
Sistema de code review multi-agente especializado: bug-hunter, security-auditor, code-quality-reviewer. Más poderoso que el reviewer agent que ya diseñamos, pero también más pesado. Evaluar si el reviewer agent custom de AGENTI no es suficiente.

**`deanpeters/lean-ux-canvas`**
Para futuras iteraciones de producto post-MVP. Hypothesis-driven planning con el Lean UX Canvas de Jeff Gothelf. Muy útil cuando tengas feedback de los 20-30 pilotos y necesites priorizar la siguiente iteración.

**`Leonxlnx/taste-skill`**
Alta agencia para UI con varianza de diseño tunable. Interesante cuando quieras explorar alternativas visuales en iteraciones post-MVP. No en MVP — allí necesitas consistencia, no varianza.

---

## La pregunta de los agentes de UI/UX

El `ui-ux-designer` de aitmpl y los agentes similares son **subagentes**, no skills. La diferencia es importante:

Una **skill** le da a Claude conocimiento especializado que aplica inline durante el desarrollo normal. El `vercel-react-best-practices` es una skill — Claude la usa mientras escribe componentes sin que tú hagas nada.

Un **agente/subagente** es una instancia separada de Claude con un rol específico, que Claude Code puede despachar para tareas discretas. El `ui-ux-designer` de aitmpl es un agente con el prompt de un diseñador UX — útil para pedir una revisión de diseño o generar alternativas de componentes, pero no se activa automáticamente mientras desarrollas.

Para AGENTI, los agentes de UI/UX más útiles son los que ya diseñamos en el sistema propio:

El **reviewer agent** que ya está en `.claude/agents/reviewer.md` hace exactamente lo que haría un `ui-ux-designer` agent externo, pero ajustado al design system específico de AGENTI (emerald, warm white, 5-tab nav, WhatsApp-native bubbles). Un agente genérico de UI/UX no conoce nuestras decisiones de diseño.

Si en algún momento quieres un segundo par de ojos más especializado en diseño puro (fuera del código), el agente útil a considerar es:

**`mustafakendiguzel/claude-code-ui-agents`**
Colección de prompts especializados para UI/UX. Los más relevantes para AGENTI: `mobile-first-layout-expert`, `micro-interactions-expert`, `aria-implementation-specialist`. No los instales todos — instala solo los que necesitas en el momento que los necesitas.

---

## Qué NO instalar (y por qué)

**Agentes genéricos de "context manager"**
El context-manager de aitmpl u otros similares intentan gestionar el contexto de conversación de Claude Code. Problema: AGENTI ya tiene STATE.md + GSD + `/session-start` + `/session-end` para eso. Instalar un context manager externo encima crea conflicto de ownership — ¿quién actualiza el estado? ¿el manager o el sistema GSD? La respuesta correcta es que el sistema que tú controlas y que conoce el dominio específico de AGENTI siempre gana.

**Skills de SEO, marketing, copywriting**
Útiles para otros proyectos, irrelevantes para el desarrollo de AGENTI. Cada skill en el system prompt es ruido hasta que se activa. No instalar lo que no usas.

**Skills duplicadas en función**
`vercel-react-best-practices` + un skill genérico de "React best practices" de otro autor = dos sets de instrucciones que se contradicen cuando Claude Code tiene que elegir. Siempre el original de la fuente oficial sobre la copia comunitaria.

**Impeccable + `ui-ux-pro-max` (nextlevelbuilder)**
`ui-ux-pro-max` tiene 1.2K installs y es popular, pero Impeccable cubre el mismo territorio con más profundidad y viene de un autor con historial verificable (Paul Bakaus, ex-Google). Elegir uno, no los dos.

**Superpowers + el sistema GSD custom que ya tenemos**
Potencial conflicto. La solución no es "no instalar Superpowers" — es instalar Superpowers y hacer que el CLAUDE.md actualizado indique que el sistema GSD de AGENTI tiene precedencia sobre los comandos de planning de Superpowers, mientras que los skills de TDD, debugging y code review de Superpowers se usan tal cual. Superpowers es suficientemente modular para esto.

---

## Tabla de instalación por fase

| Fase | Skills a instalar antes de empezar |
|---|---|
| Fase 1 — Fundación | `obra/superpowers`, `supabase-postgres-best-practices`, `vercel-react-best-practices` |
| Fase 2 — Auth y Onboarding | `better-auth-best-practices`, `pbakaus/impeccable` |
| Fase 3 — Motor del agente | `vercel-composition-patterns`, `webapp-testing` |
| Fases 4-5 — Features | Revisar si algún gap requiere skill adicional |
| Fase 6-7 — Go-live | `next-best-practices` (si hay gaps de performance) |

Regla: no instalar skills que no usarás en la fase actual. El ecosistema de Claude Code ya permite instalar/desinstalar en cualquier momento — no hay razón para precargar todo desde el día 1.

---

## Comandos de instalación consolidados (Fase 1)

```bash
# Instalar Superpowers (el más importante)
/plugin marketplace add obra/superpowers

# Instalar skills de Vercel Labs
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns

# Instalar skill oficial de Supabase
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices

# Instalar skills de Anthropic (ejemplo-skills incluye frontend-design y webapp-testing)
/plugin install example-skills@anthropic-agent-skills
```

```bash
# Instalar antes de Fase 2 (UI)
/plugin marketplace add pbakaus/impeccable

# Instalar antes de Fase 2 (Auth)
npx skills add better-auth/skills --skill better-auth-best-practices
```

---

## La respuesta a "¿mientras más, mejor?"

No. El ecosistema de skills es como un equipo de personas: 8 especialistas que conocen el proyecto desde adentro baten a 40 consultores genéricos que llegaron ayer. La diferencia entre un proyecto que termina y uno que se pierde en ruido es exactamente esta.

El stack de AGENTI con lo recomendado arriba tiene entre 8 y 12 skills activas según la fase. Eso es exactamente el rango donde los practicantes con más experiencia reportan el mejor balance entre especialización y precisión de routing.

La señal de que tienes demasiadas skills no es un error — es cuando Claude Code empieza a hacer preguntas que debería saber responder, o aplica el patrón de debugging cuando debería aplicar el de TDD, o genera UI inconsistente a pesar de tener un design system definido. Si ves eso, el siguiente paso es auditar qué skills pueden estar en conflicto y cuáles puedes desinstalar antes de la próxima sesión.

---

*AGENTI — Skills Strategy v1.0*
