# AGENTI — Plan de Desarrollo v1.0
## Fases, bloques y Definition of Done para Claude Code + GSD

**Versión:** 1.0
**Tipo:** Session Layer Doc — governa el orden de construcción del MVP. Se actualiza al completar cada fase. Cualquier decisión de qué construir primero o qué constituye "terminado" se resuelve con este documento.
**Sistema de workflow:** GSD (get-shit-done) con elementos de wrap-up ritual (pro-workflow) y subagent strategy (workflow-orchestration). Ver sección de setup al final.
**Referencia cruzada:** PRD v1.0 define el scope. Project Brief v1.0 orienta cada sesión. Data Entities, TAD, Backend Logic, WhatsApp Integration Specs y Entregables 5 y 6 son los docs técnicos que GSD consume en cada fase.

---

## Principio de construcción

El producto se construye de adentro hacia afuera. Primero la base de datos, luego el backend, luego el motor del agente, luego el frontend. Cada capa anterior debe estar probada antes de construir la siguiente.

La única excepción es el onboarding: el flujo de registro y la pantalla de prueba del agente (M1.6) se construyen en paralelo con el motor porque son la única forma de generar datos reales para validar que el agente funciona.

El orden de fases respeta tres dependencias duras:

1. Sin base de datos, no hay backend.
2. Sin webhook funcional, no hay motor del agente.
3. Sin motor del agente, el onboarding no tiene valor que demostrar.

---

## Vista general — 7 fases + 1 milestone

```
MILESTONE 1 — MVP PILOTO

Fase 1  Fundación y base de datos           (1–2 sesiones)
Fase 2  Autenticación y onboarding          (2–3 sesiones)
Fase 3  Motor del agente — core pipeline    (2–3 sesiones)
Fase 4  Operación diaria — frontend         (2–3 sesiones)
Fase 5  WhatsApp real + notificaciones      (1–2 sesiones)
Fase 6  Entrenamiento y configuración       (1–2 sesiones)
Fase 7  Pulido, pruebas y go-live           (1–2 sesiones)

Total estimado: 10–17 sesiones de Claude Code
```

---

## Fase 1 — Fundación y base de datos

**Objetivo:** el proyecto existe, se puede correr localmente, la base de datos tiene todas las tablas del MVP y las migraciones son reproducibles.

**Por qué primero:** sin esquema correcto, todo lo que se construya después generará deuda técnica que rompe la coherencia entre documentos y código.

### Bloque 1.1 — Setup del proyecto

Tareas:
- Crear proyecto Next.js con App Router, TypeScript y Tailwind CSS
- Configurar Supabase local (supabase start)
- Configurar variables de entorno según la lista del Project Brief
- Instalar y configurar GSD (`npx get-shit-done-cc --claude --local`)
- Crear el CLAUDE.md del proyecto con las reglas del agente (ver sección al final de este doc)
- Crear carpeta `.planning/` con PROJECT.md, REQUIREMENTS.md y ROADMAP.md generados desde los docs de AGENTI
- Configurar Lucide Icons y verificar Geist disponible en Next.js
- Git init con commit inicial

**Definition of Done 1.1:**
- `npm run dev` corre sin errores
- `supabase start` levanta la base de datos local
- Las variables de entorno están en `.env.local` y `.env.example` (sin valores reales)
- El CLAUDE.md está en la raíz del proyecto y hace referencia a los docs de AGENTI
- El primer commit existe con estructura limpia

### Bloque 1.2 — Esquema de base de datos

Tareas — crear migraciones en orden de dependencia:
- Migración 001: tablas base — `owners`, `businesses`, `agents`
- Migración 002: tablas de conocimiento — `industry_templates`, `competency_topics`, `escalation_rules`, `knowledge_sources`, `knowledge_items`
- Migración 003: tablas de operación — `conversations`, `messages`, `suggestions`, `escalations`
- Migración 004: tablas de sistema — `onboarding_progress`, `daily_summaries`, `notifications`, `system_logs`, `agent_context_cache`, `webhook_queue`
- Row Level Security (RLS) en todas las tablas: un owner solo accede a sus propios datos
- Índices en campos de búsqueda frecuente: `conversations.phone_client`, `messages.conversation_id`, `knowledge_items.business_id + layer + active`
- Seed data: 6 IndustryTemplates con sus CompetencyTopics y EscalationRules predeterminadas según PRD sección 5

**Definition of Done 1.2:**
- Todas las migraciones corren en orden sin errores en entorno local
- `supabase db reset` recrea el esquema limpio desde cero
- Las 6 IndustryTemplates tienen datos completos con al menos 3 CompetencyTopics y 2 EscalationRules cada una
- RLS está activo — consulta desde cliente anon sin autenticar no retorna ningún dato de negocio
- Un TypeScript type se puede generar desde el esquema sin errores (`supabase gen types`)

### Bloque 1.3 — Capa de abstracción LLM

Tareas:
- Crear el módulo de abstracción de LLM que Lee variables de entorno para saber qué proveedor usar
- Implementar `callPrimaryLLM(prompt, systemPrompt)` — llama a Gemini Flash 2.5
- Implementar `callFastLLM(prompt, systemPrompt)` — llama a Qwen via Together.ai
- Manejo de errores: si el proveedor falla, el error se propaga con contexto claro
- Test básico: ambas funciones retornan texto coherente con un prompt simple

**Definition of Done 1.3:**
- Las dos funciones retornan respuestas reales con las API keys configuradas
- Cambiar `LLM_PRIMARY_PROVIDER` en `.env.local` no requiere cambiar código
- Los errores de API (rate limit, timeout, invalid key) se capturan y loggean en `system_logs`

---

## Fase 2 — Autenticación y onboarding

**Objetivo:** un dueño puede registrarse, verificar su número, completar el onboarding, conectar WhatsApp en sandbox y activar su agente. El agente queda en estado `sandbox` o `active`.

**Por qué antes del motor:** el onboarding crea todos los datos que el motor necesita para funcionar — KnowledgeItems, EscalationRules, IndustryTemplate aplicada. Sin onboarding, el motor no tiene nada que procesar.

### Bloque 2.1 — Autenticación

Tareas:
- Registro con email/contraseña usando Supabase Auth
- Google OAuth configurado como alternativa
- Verificación de número personal por WhatsApp (código de 6 dígitos)
- El código se envía desde el número de AGENTI como plataforma, no del negocio
- Login, recuperación de contraseña y manejo de sesión
- Protección de rutas: el middleware de Next.js redirige a login si no hay sesión
- Transacción atómica del registro: Owner + Business + OnboardingProgress + Agent en una sola operación o ninguna

**Definition of Done 2.1:**
- Un usuario real puede crear cuenta con email en menos de 2 minutos
- Google OAuth funciona y crea la misma estructura atómica
- El código de WhatsApp llega al número personal (requiere número de WhatsApp de AGENTI configurado como plataforma)
- Si el código es incorrecto 3 veces, la cuenta se bloquea temporalmente con mensaje claro
- El middleware protege todas las rutas `/dashboard/*` y redirige correctamente

### Bloque 2.2 — Onboarding M1.2 y M1.3

Tareas:
- Pantalla M1.2: selección de industria con tarjetas visuales y preview de plantilla
- Cuando el dueño selecciona industria: seed de CompetencyTopics + EscalationRules + KnowledgeItems base
- La operación de seed es idempotente — cambio de industria limpia y recrea
- Pantalla M1.3: captura de conocimiento por texto libre
- Captura por nota de voz con transcripción automática vía Gemini Flash
- Captura por link de sitio web con extracción de contenido
- Captura por imagen de menú/lista de precios con OCR vía Gemini Flash
- `OnboardingProgress.knowledge_completeness` se recalcula en tiempo real
- Indicador visual de completitud por campo

**Definition of Done 2.2:**
- Al seleccionar "restaurante", la base de datos tiene los CompetencyTopics y EscalationRules del PRD sección 5 creados
- Un campo de texto libre crea un KnowledgeItem con la capa correcta
- Una nota de voz de 30 segundos produce un KnowledgeItem con `source_type = voice_note`
- El porcentaje de completitud en la UI se actualiza sin recargar la página
- Si falla la extracción de un link, el flujo continúa con mensaje de error no bloqueante

### Bloque 2.3 — Onboarding M1.4, M1.5 y M1.6

Tareas:
- Pantalla M1.4: toggles de escalamiento predeterminados + campo de escalamiento personalizado
- Pantalla M1.5: Embedded Signup de Meta (flujo completo — ver WhatsApp Integration Specs v1.0)
- Detección automática de conflicto de números (M1.5 Opción C)
- Opción D de omisión con sandbox activo
- Pantalla M1.6: chat de sandbox con el agente ya configurado
- El agente en sandbox usa todos los KnowledgeItems creados en el onboarding
- Sugerencias de preguntas clicables por industria en la pantalla de prueba
- Corrección inline desde la burbuja del agente con persistencia
- Después de 3 mensajes: opciones de activar, seguir entrenando o conectar WhatsApp
- Activación: `Agent.status = active` o `sandbox` según si se conectó WhatsApp

**Definition of Done 2.3:**
- El flujo de Embedded Signup completo funciona en sandbox de Meta
- El número de WhatsApp conectado se guarda encriptado, nunca en texto plano
- La prueba del agente en M1.6 responde usando los KnowledgeItems del onboarding
- Una corrección en M1.6 crea un KnowledgeItem de tipo `learned` con `source_type = correction`
- La activación establece `Agent.status` correcto y redirige al dashboard primera vez
- El flujo completo desde registro hasta activación es completable en menos de 20 minutos en móvil

---

## Fase 3 — Motor del agente — core pipeline

**Objetivo:** el webhook de WhatsApp está activo, recibe mensajes reales, genera Suggestions y las hace llegar al dueño en la app. El modo colaborador completo funciona: aprobar, editar, rechazar.

**Esta es la fase más crítica del MVP.** Si el pipeline no funciona correctamente, no hay producto.

### Bloque 3.1 — Webhook y recepción de mensajes

Tareas:
- Edge Function `whatsapp-webhook`: recibe POST de Meta, responde 200 inmediatamente, encola el mensaje en `webhook_queue`
- Verificación de webhook (GET con hub.challenge) para el setup inicial de Meta
- Validación de firma X-Hub-Signature-256 en cada mensaje entrante
- Deduplicación por `whatsapp_message_id`
- Manejo de tipos de mensaje: text (procesa), multimedia (escala automático), status updates (loggea, no procesa)
- Edge Function `process-message`: consume la queue, ejecuta el pipeline de 10 pasos del Backend Logic Overview v2.0
- Reintentos automáticos para mensajes en queue con status `pending` mayores a 2 minutos

**Definition of Done 3.1:**
- Un mensaje de texto enviado al número de prueba llega a la `webhook_queue` en menos de 500ms
- El webhook nunca retorna error 5xx a Meta (los errores internos se loggean sin afectar la respuesta)
- Un mensaje de imagen enviado por el cliente crea automáticamente una Escalation de tipo `informative`
- El job de reintento reprocesa mensajes `pending` sin generar duplicados
- La firma de cada mensaje se valida — un POST sin firma válida retorna 403 sin procesar

### Bloque 3.2 — Construcción del contexto y prompt del agente

Tareas:
- Edge Function `build-agent-context`: construye los Bloques 1-4 del prompt (identidad, conocimiento estructurado/operativo, narrativo/aprendido, reglas de escalamiento)
- Caché del contexto en `agent_context_cache` con TTL de 1 hora
- Invalidación del caché cuando cambia cualquier KnowledgeItem del negocio
- El Bloque 5 (historial de conversación — últimos 6 mensajes) siempre es real-time, nunca cacheado
- El Bloque 6 (instrucción de output JSON estructurado) es estático, mismo para todos los negocios
- El prompt completo nunca excede el límite de tokens del modelo primario

**Definition of Done 3.2:**
- El contexto cacheado de un negocio tiene los 4 bloques correctamente formateados
- Crear un KnowledgeItem nuevo invalida el caché de ese negocio en menos de 1 segundo
- El prompt completo con los 6 bloques para un negocio real no supera 4000 tokens
- Un negocio sin KnowledgeItems de Capa 1 produce un contexto válido pero con advertencia en `system_logs`

### Bloque 3.3 — Clasificación, generación y evaluación

Tareas:
- Llamada al modelo fast/cheap para clasificar la intención del mensaje
- Llamada al modelo primario para generar la respuesta usando el contexto completo
- Parsing del JSON output del modelo — incluyendo manejo de JSON malformado
- Cálculo determinístico de `confidence_tier`: had_sufficient_context + approval_rate_7d + coverage_percentage
- Aplicación de los 3 guardrails: precios/horarios/contacto — si el output los viola, se degrada a `low` o se escala
- Creación de Suggestion con todos los campos requeridos si `confidence_tier` permite responder
- Creación de Escalation si el agente no puede o no debe responder

**Definition of Done 3.3:**
- Una pregunta de horario de un restaurante produce una Suggestion con `confidence_tier = high` cuando los horarios están en Capa 1
- Una pregunta sobre un tema sin información en KnowledgeItems produce una Escalation de tipo `informative`
- Un mensaje que contiene un keyword de emergencia produce una Escalation de tipo `urgent`
- El JSON output malformado del LLM es capturado y genera una Escalation de tipo `informative` sin romper el pipeline
- El pipeline completo (desde recepción del webhook hasta Suggestion creada) es menos de 3 segundos en el 90% de los casos

### Bloque 3.4 — Modo colaborador frontend

Tareas:
- Home (M2.1): estado del agente, instrucción rápida y bandeja resumida con Suggestions pendientes
- Bandeja de conversaciones (M2.2): tres secciones diferenciadas, ordenadas por prioridad
- Vista de conversación individual (M2.3): hilo de mensajes completo con burbujas diferenciadas por actor
- Componente de modo colaborador (M2.4): aprobar / editar / rechazar con clasificación de corrección
- Aprobar: invoca `approve-suggestion` → mensaje enviado al cliente → conversación marcada resuelta
- Editar y enviar: invoca `edit-and-send-suggestion` → crea KnowledgeSource de corrección
- Rechazar: invoca `reject-suggestion` → dueño escribe respuesta manual → crea KnowledgeSource
- Clasificación de corrección: permanente / temporal / solo esta vez
- Realtime: nuevas Suggestions aparecen en la app sin recargar usando Supabase Realtime

**Definition of Done 3.4:**
- Una Suggestion nueva aparece en el home del dueño en menos de 5 segundos desde que el cliente envió el mensaje
- Aprobar una Suggestion envía el mensaje al cliente y lo muestra como enviado en el hilo
- Editar una Suggestion y marcarla como permanente crea un KnowledgeItem de tipo `learned`
- La bandeja distingue visualmente entre conversaciones que necesitan atención y conversaciones resueltas
- El Realtime funciona en móvil con la app en background (push notification) y en foreground (actualización inline)

---

## Fase 4 — Escalamiento y flujos de urgencia

**Objetivo:** los tres niveles de escalamiento funcionan. Los mensajes de contención llegan al cliente. El dueño recibe notificación en WhatsApp personal cuando hay urgencia y no responde en 5 minutos.

### Bloque 4.1 — Escalamiento en el frontend

Tareas:
- Vista de escalamiento urgente (estado especial de la conversación, no pantalla separada)
- Indicador visual diferenciado para cada nivel: informativo / sensible / urgente
- Mensaje de contención automático al cliente para sensible y urgente
- El texto del mensaje de contención es configurable (definir texto default antes del go-live)
- Botón de "atender ahora" que abre la conversación y cambia el estado del escalamiento

**Definition of Done 4.1:**
- Un escalamiento urgente muestra indicador rojo en la bandeja y en el home
- El mensaje de contención llega al cliente en menos de 2 segundos desde la creación del escalamiento
- Atender un escalamiento desde la app lo marca como `attended` y permite responder manualmente

### Bloque 4.2 — Notificaciones push y WhatsApp urgente

Tareas:
- Notificaciones push para Suggestions pendientes (agrupadas en ventanas de 15 minutos)
- Push inmediata para escalamientos sensibles y urgentes
- Lógica de silencio nocturno (10 PM - 7 AM, excepto urgentes)
- Job que monitorea escalamientos urgentes sin atender por más de 5 minutos y envía WhatsApp al número personal del dueño
- Máximo 8 pushes por día de tipo Suggestion para no saturar
- In-app notification para sugerencias de autonomía cuando el sistema detecta un tema maduro

**Definition of Done 4.2:**
- Un escalamiento urgente genera push en menos de 10 segundos
- Si el dueño no abre la app en 5 minutos, llega WhatsApp al número personal
- Las pushes de Suggestions se agrupan correctamente — 3 Suggestions en 10 minutos generan 1 push, no 3
- Ninguna push se envía entre 10 PM y 7 AM, excepto urgentes
- La lógica de deduplicación previene pushes repetidas del mismo escalamiento

---

## Fase 5 — Entrenamiento, inteligencia y configuración

**Objetivo:** el dueño puede entrenar al agente desde el home, ver el estado de preparación por tema y revisar el historial de aprendizaje. Los módulos de configuración avanzada están accesibles.

### Bloque 5.1 — Instrucción rápida y entrenamiento

Tareas:
- Componente de instrucción rápida del home (M3.1): texto, voz, imagen, link
- Edge Function `process-quick-instruct`: abstrae la instrucción, devuelve confirmación al dueño
- Confirmación del dueño antes de persistir — el agente propone qué entendió, el dueño valida
- Edge Function `confirm-instruction`: crea KnowledgeItem, invalida caché
- Mapa de competencias (M3.2): lista de temas con estado verde/amarillo/rojo
- Temas en rojo con acceso directo a la instrucción rápida pre-configurada para ese tema
- Historial de aprendizaje (M3.3): lista cronológica con opción de revertir

**Definition of Done 5.1:**
- Una instrucción de texto crea un KnowledgeItem correcto después de que el dueño confirma
- La instrucción "a partir de hoy cerramos los domingos" actualiza el KnowledgeItem de horarios en Capa 1
- El mapa de competencias refleja los temas sin KnowledgeItems como rojo inmediatamente
- Revertir una instrucción del historial elimina el KnowledgeItem y lo refleja en el mapa en tiempo real

### Bloque 5.2 — Inteligencia y resúmenes

Tareas:
- DailySummary generado diariamente a las 7:30 PM si hubo actividad
- Resumen enviado por WhatsApp al número personal del dueño
- Vista M5.1 en la app: resumen semanal en lenguaje humano
- Vista M5.2: oportunidades de entrenamiento agrupadas por tema
- Resumen de primera semana generado a los 7 días de activación

**Definition of Done 5.2:**
- El job de resúmenes diarios genera un DailySummary con datos reales de las conversaciones del día
- El WhatsApp de resumen llega al número personal del dueño antes de las 8 PM
- M5.2 lista correctamente los temas donde hubo escalamientos en la última semana con acceso directo a entrenamiento

### Bloque 5.3 — Configuración avanzada

Tareas:
- M4.1 Perfil del negocio: todos los campos del onboarding editables permanentemente
- M4.2 Reglas de escalamiento avanzadas con estadísticas de frecuencia por tema
- M4.3 Nivel de autonomía por tema (Nivel 0 y Nivel 1 solamente en MVP)
- Los indicadores de evidencia para activación de autonomía: conocimiento, historial reciente, sin incidentes
- M4.4 Estado del canal de WhatsApp y reconexión
- M4.5 Cuenta, notificaciones y plan activo

**Definition of Done 5.3:**
- Cambiar el horario del negocio en M4.1 crea un KnowledgeItem de tipo `structured` e invalida el caché
- Los indicadores de madurez en M4.3 muestran datos reales de los últimos 7 días
- Activar Nivel 1 en un tema con indicadores en verde cambia el comportamiento del agente en la siguiente conversación de ese tema
- M4.4 muestra el estado real de la conexión y permite reconectar sin perder KnowledgeItems

---

## Fase 6 — WhatsApp real, landing y go-live prep

**Objetivo:** la app funciona con Meta en producción (no sandbox), la landing page está publicada y el sistema pasa las pruebas de go-live del PRD.

### Bloque 6.1 — Migración a Meta producción

Tareas:
- Configurar Meta App en modo live (salir de sandbox)
- Configurar dominio de producción en el webhook de Meta
- Crear y aprobar los Message Templates de WhatsApp necesarios (resúmenes diarios, notificaciones urgentes, mensajes al dueño)
- Verificar que el Embedded Signup funciona con App en modo live
- Test end-to-end completo con número real de negocio

**Definition of Done 6.1:**
- Un mensaje enviado desde un número real a un número de negocio real genera una Suggestion en la app
- Los Message Templates están aprobados por Meta y se usan correctamente
- El Embedded Signup funciona con una cuenta de Meta Business real

### Bloque 6.2 — Landing page

Tareas:
- Hero con headline y CTA de registro
- Demo interactiva que simula el agente (sin crear cuenta)
- Pre-carga de industria desde la demo al registro
- Sección de propuesta de valor y pricing
- Captura de lead no convertido (email para seguimiento)
- SEO básico: title, description, og:image

**Definition of Done 6.2:**
- La demo interactiva funciona para las 6 industrias
- El CTA de registro lleva al formulario con industria pre-seleccionada si se usó la demo
- La landing carga en menos de 2 segundos en móvil en red 4G

### Bloque 6.3 — Pruebas de go-live

Ejecutar los 7 flujos críticos del PRD sección 9 con usuarios reales (mínimo 3 personas que no conocen el producto):

- Flujo 1: onboarding autónomo < 20 min
- Flujo 2: recepción y Suggestion < 2 segundos
- Flujo 3: aprobación → mensaje al cliente < 1 segundo desde aprobación
- Flujo 4: edición + aprendizaje permanente
- Flujo 5: escalamiento urgente + WhatsApp al dueño en 5 min
- Flujo 6: instrucción rápida → caché invalidado → siguiente conversación usa nuevo dato
- Flujo 7: token invalidado → agente se detiene → reconexión → operación reanudada

**Definition of Done 6.3:**
- Los 7 flujos críticos pasan con los 3 usuarios de prueba sin asistencia del equipo
- No existe ningún error 5xx en los logs de las pruebas
- El tiempo de onboarding autónomo promedio es menor a 20 minutos
- La tasa de Suggestions aprobadas sin edición en las pruebas es mayor al 50%

---

## Fase 7 — Estabilización para piloto

**Objetivo:** el sistema está listo para 20-30 negocios piloto operando autónomamente durante 30 días. No es perfecto — está monitoreado.

### Bloque 7.1 — Observabilidad y monitoring

Tareas:
- Dashboard interno de logs (solo para el equipo, no los pilotos)
- Alertas cuando un negocio tiene token inválido por más de 30 minutos
- Alertas cuando el pipeline falla más del 5% de mensajes de un negocio en 1 hora
- Métricas de costo de LLM por negocio por día
- Script de health check manual que el equipo puede correr para verificar el estado de todos los pilotos

**Definition of Done 7.1:**
- El equipo puede ver el estado de todos los negocios activos en 1 pantalla
- Cualquier fallo de token genera una alerta antes de que el dueño note el problema
- El costo de LLM por mensaje está documentado y dentro del margen estimado

### Bloque 7.2 — Onboarding concierge

Tareas (proceso, no código):
- Definir el protocolo de acompañamiento para los primeros 3 días de cada piloto
- Script de verificación de calidad del agente para los primeros 3 días: si la tasa de aprobación sin edición es menor al 50%, el equipo ayuda al dueño a entrenar
- Documentación de preguntas frecuentes del onboarding para el equipo

**Definition of Done 7.2:**
- El protocolo está documentado y el equipo lo puede ejecutar sin preguntar
- La primera semana de cada piloto tiene un punto de contacto definido con el equipo

---

## Setup del workflow GSD para AGENTI

### Instalación

```bash
# En la raíz del proyecto
npx get-shit-done-cc --claude --local

# Verificar instalación
# Abrir Claude Code y ejecutar:
# /gsd:help
```

### Estructura de archivos GSD

```
.planning/
  config.json          — mode: interactive, depth: standard, profile: balanced
  PROJECT.md           — resumen del proyecto para GSD (generado desde Project Brief)
  REQUIREMENTS.md      — requirements v1 del MVP (generado desde PRD)
  ROADMAP.md           — las 7 fases de este documento
  STATE.md             — decisiones tomadas, blockers, posición actual
  research/            — investigaciones por fase
  phase-N-CONTEXT.md   — decisiones de implementación por fase
  phase-N-PLAN.md      — planes atómicos por fase
  phase-N-SUMMARY.md   — qué se construyó por fase
```

### Flujo por sesión de desarrollo

Cada sesión sigue este patrón:

```
1. Abrir Claude Code en la raíz del proyecto
2. /gsd:resume-work           → restaurar contexto de la última sesión
3. [trabajar en la fase actual]
4. /gsd:verify-work [N]       → verificar que la fase cumple su DoD
5. /gsd:pause-work            → crear handoff para la siguiente sesión
```

Para tareas ad-hoc (bug fix, corrección rápida, ajuste de UI):
```
/gsd:quick
```

Al final de cada sesión — wrap-up ritual (de pro-workflow):
```
- ¿Qué se construyó?
- ¿Qué decisiones se tomaron que no estaban en los docs?
- ¿Qué está bloqueado para la siguiente sesión?
- Actualizar STATE.md con estas tres respuestas
```

### Comandos GSD para AGENTI

```bash
# Iniciar una fase
/gsd:discuss-phase [N]    # Capturar decisiones antes de planear
/gsd:plan-phase [N]       # Investigar y planear la fase
/gsd:execute-phase [N]    # Ejecutar todos los planes en paralelo
/gsd:verify-work [N]      # Verificar contra el DoD de este documento

# Navegación
/gsd:progress             # Ver estado de todas las fases
/gsd:debug [descripción]  # Debug sistemático de un problema

# Ad-hoc
/gsd:quick                # Tarea pequeña sin planning completo
```

### CLAUDE.md del proyecto — instrucciones base

El CLAUDE.md en la raíz del proyecto debe incluir estas secciones. Este es el texto exacto para el archivo:

```markdown
# AGENTI — Reglas del agente de desarrollo

## Contexto del proyecto
AGENTI es un agente de IA para WhatsApp que responde mensajes de clientes en nombre
de negocios pequeños en Guatemala. El dueño supervisa y aprueba cada respuesta.
Stack: Next.js + Supabase + Edge Functions + Gemini Flash 2.5 + Meta Cloud API.

## Documentos de referencia
Antes de construir, leer el documento correcto:
- Qué construir: PRD v1.0
- Orientación general: Project Brief v1.0
- Base de datos: Data Entities v1.0
- Lógica de eventos: Event Map v1.0
- Decisiones técnicas: TAD v1.0
- WhatsApp / Meta: WhatsApp Integration Specs v1.0
- Backend y Edge Functions: Backend Logic Overview v2.0
- UI y componentes: Entregable 5 v1.0
- Especificaciones de pantallas: Entregable 6 v2.0

Los documentos están en docs/. Si algo no está especificado, preguntar antes de inventar.

## Reglas de código
- TypeScript estricto. Sin any implícitos.
- Todas las llamadas a LLM pasan por la capa de abstracción, nunca directamente.
- Todas las llamadas a Meta API ocurren en Edge Functions, nunca en el cliente.
- Ningún secreto en el cliente. Ningún token de Meta accesible desde el navegador.
- RLS activo en todas las tablas de Supabase.
- Cada Edge Function tiene responsabilidad única.

## Reglas de calidad
- Verificar que el código funciona antes de marcar una tarea como completa.
- Nunca marcar done sin probar el flujo completo de la funcionalidad.
- Atomic git commits: un commit por tarea completada.
- Si algo no funciona después de 2 intentos, documentar el problema en STATE.md y parar.

## Self-correction
Cuando corrijas algo: proponer la regla aprendida → agregarla a esta sección LEARNED.

## LEARNED
(vacío al inicio — se llena durante el desarrollo)
```

---

## Orden de creación de los archivos `.planning/`

Antes de la primera sesión de desarrollo, crear estos archivos manualmente o con `/gsd:new-project` usando los docs de AGENTI como fuente:

**PROJECT.md:** copiar el resumen del Project Brief v1.0 sección 1 y 2.

**REQUIREMENTS.md:** listar los requisitos del MVP desde el PRD v1.0 sección 4, categorizados como v1 (MVP) y v2 (post-piloto).

**ROADMAP.md:** las 7 fases de este documento con el objetivo de cada una, en el formato que GSD espera.

**STATE.md (inicial):**
```markdown
# Estado actual
Fase activa: 1
Bloque activo: 1.1
Última sesión: [fecha]
Decisiones tomadas: ninguna todavía
Blockers: ninguno
Notas: primer setup del proyecto
```

---

## Criterio de avance entre fases

Una fase está completa cuando:
1. Todos los bloques de la fase tienen su DoD cumplido
2. `/gsd:verify-work [N]` pasa sin issues bloqueantes
3. El STATE.md está actualizado con decisiones y aprendizajes de la fase
4. El commit de cierre de fase existe en git con el tag `phase-N-complete`

No se empieza la Fase N+1 con la Fase N incompleta.

---

*AGENTI — Plan de Desarrollo v1.0*
