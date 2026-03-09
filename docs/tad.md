# AGENTI — Technical Architecture Decisions (TAD) v1.0
## Decisiones técnicas fundamentales

**Versión:** 1.0
**Tipo:** System Execution Doc — lectura obligatoria antes de construir cualquier parte del motor del agente, la integración de WhatsApp, o la lógica de procesamiento de mensajes.
**Propósito:** Documentar las decisiones técnicas de mayor impacto tomadas antes del desarrollo. Cada decisión incluye la justificación, las alternativas descartadas y las consecuencias de implementación. No se cambia ninguna decisión de este documento sin análisis explícito de impacto.

---

## Decisión 1 — Integración de WhatsApp

**Decisión:** Meta Cloud API con Embedded Signup como método estándar de conexión para todos los negocios.

**Qué significa en práctica:**
AGENTI opera como ISV (Independent Software Vendor) en la plataforma de Meta. Cada negocio que se registra conecta su propio número de WhatsApp Business a través de un flujo de OAuth que ocurre dentro de la experiencia de AGENTI, sin salir a interfaces externas de Meta. El agente envía y recibe mensajes usando la Cloud API de Meta en nombre del negocio.

**Flujo técnico de conexión:**
1. AGENTI redirige al dueño a la URL de Embedded Signup con los parámetros de la app de Meta (app_id, scope, redirect_uri)
2. El dueño completa el flujo en el popup de Meta: autenticación, selección o creación del WhatsApp Business Account (WABA), selección o registro del número
3. Meta redirige de vuelta a AGENTI con un `code` de autorización
4. AGENTI intercambia ese code por un token de acceso del sistema
5. AGENTI registra el `phone_number_id` y el `waba_id` en `Business`
6. AGENTI suscribe su webhook al `waba_id` para recibir mensajes entrantes
7. AGENTI envía un mensaje de prueba para verificar que el canal funciona

**Coexistencia con WhatsApp Business App:**
Meta soporta que un número que ya usa la app de WhatsApp Business se conecte a la Cloud API mediante el modo de coexistencia. AGENTI debe detectar este caso durante el Embedded Signup (Meta lo señala en la respuesta) y comunicárselo al dueño en lenguaje simple: "Tu número ya tiene WhatsApp Business. Vamos a conectarlo para que tu agente pueda responder. Seguirás pudiendo ver los mensajes desde tu teléfono."

**Webhooks — requisitos críticos:**
- Meta requiere que el endpoint de webhook responda en menos de 5 segundos con HTTP 200, o reintenta y puede desactivar el webhook
- El webhook debe verificar la firma `X-Hub-Signature-256` en cada request antes de procesar
- El webhook en Supabase Edge Functions debe responder con 200 inmediatamente y encolar el procesamiento asíncrono si la tarea tarda más de 3 segundos
- Formato del endpoint: `POST /functions/v1/whatsapp-webhook`

**Tipos de mensajes entrantes soportados en MVP:**
- `text` — procesado por el motor del agente
- `image`, `audio`, `document`, `video` — escalamiento automático informativo, no procesado por LLM
- `interactive` (botones, listas) — ignorado en MVP
- `system` (cambios de número, etc.) — ignorado en MVP

**Rate limits de Meta a respetar:**
- Tier 1 (negocio nuevo): 1,000 conversaciones únicas por número por día
- Una conversación = 24 horas desde el primer mensaje del cliente
- Límite de mensajes por segundo: 80 mensajes/segundo por número (irrelevante para el MVP)
- Si se alcanza el límite diario: registrar el evento, notificar al dueño, no intentar enviar hasta el siguiente día

**Renovación de tokens:**
- Los tokens de sistema de Meta no expiran por defecto si se generan correctamente como tokens de larga duración
- Sin embargo, pueden invalidarse si el usuario revoca el acceso o si hay cambios en la app de Meta
- AGENTI debe detectar errores de token inválido en las respuestas de la API y disparar el evento `whatsapp_disconnected` inmediatamente
- Almacenar `whatsapp_token_expires_at` como guardrail adicional, aunque el token técnicamente no expire

**Alternativas descartadas:**
- BSP (Business Solution Provider) intermediario: agrega costo por mensaje y una dependencia adicional. Innecesario cuando Meta Cloud API es accesible directamente.
- Twilio for WhatsApp: ruta alternativa válida pero más cara y con menos control. Meta prefiere la relación directa.
- Onboarding manual asistido: no escala. Solo como fallback concierge para pilotos atascados, no como arquitectura.

---

## Decisión 2 — Arquitectura del motor del agente

**Decisión:** Plantilla vertical + perfil del negocio + KnowledgeItems estructurados por capa + reglas operativas + política de runtime. Prompt dinámico construido en tiempo real. Sin RAG en MVP.

### 2.1 Cómo se construye el contexto del agente

Cada vez que llega un mensaje y el motor necesita generar una sugerencia, construye dinámicamente el prompt completo con esta estructura:

**Bloque 1 — Identidad y rol (siempre presente):**
Quién es el agente, para qué negocio trabaja, cuál es su rol, qué puede y qué no puede hacer. Generado una vez por negocio y cacheado. Cambia solo cuando el dueño actualiza el perfil o el tono.

**Bloque 2 — Conocimiento estructurado (Capa 1 y Capa 2):**
Todos los KnowledgeItems activos de layer `structured` y `operational` del negocio. Estos son los datos de alta prioridad: horarios, precios, dirección, métodos de pago, políticas, reglas de comportamiento. Se inyectan completos porque son pocos (típicamente 15-40 ítems en el MVP) y son los más críticos para la exactitud.

**Bloque 3 — Contenido narrativo y aprendizaje (Capa 3 y Capa 4):**
KnowledgeItems de layer `narrative` y `learned` activos. Tono, descripciones del negocio, promociones vigentes, respuestas aprendidas de correcciones marcadas como permanentes. Se filtran por `active = true` y `valid_until > now()` para los temporales.

**Bloque 4 — Reglas de escalamiento activas:**
Las EscalationRules con `active = true` del negocio, en formato de instrucciones directas al agente: "Si el cliente menciona [keyword], no respondas y escala inmediatamente."

**Bloque 5 — Historial de conversación:**
Los últimos 6 mensajes de la conversación activa (3 pares cliente-agente máximo), con el mensaje actual del cliente al final. Si es el primer mensaje del cliente con el negocio, solo el mensaje actual.

**Bloque 6 — Instrucción de output:**
Formato exacto que el agente debe devolver. Siempre JSON estructurado.

### 2.2 Formato de output del LLM

El motor siempre pide al LLM que devuelva JSON con esta estructura exacta. No texto libre.

```json
{
  "should_respond": true,
  "response": "Hola, gracias por escribirnos. Abrimos de lunes a sábado de 9 AM a 7 PM.",
  "had_sufficient_context": true,
  "knowledge_items_used": ["uuid-1", "uuid-2"],
  "detected_intent": "schedule_inquiry",
  "detected_intent_label": "Pregunta sobre horarios",
  "escalation_needed": false,
  "escalation_level": null,
  "escalation_reason": null,
  "confidence_basis": "direct_knowledge"
}
```

**Campos críticos:**

`should_respond` — si el agente tiene algo útil que decir. Si es `false`, el sistema escala directamente.

`had_sufficient_context` — si el agente encontró información específica en el conocimiento del negocio para responder, o si tuvo que inferir o inventar. Este campo es la señal más importante para el `confidence_tier`. Si es `false`, la confianza es `low` independientemente de cualquier otra señal.

`knowledge_items_used` — los UUIDs de los KnowledgeItems que el agente usó. Esto permite trazabilidad y alimenta el `coverage_percentage` de los CompetencyTopics.

`escalation_needed` — si el agente determinó que debe escalar en lugar de responder. Si es `true`, `response` puede ser vacío o contener el mensaje de contención.

`confidence_basis` — cómo el agente llegó a su respuesta: `direct_knowledge` (encontró el dato exacto), `inference` (razonó a partir de datos relacionados), `template` (usó una respuesta general de la plantilla).

### 2.3 Cálculo del confidence_tier

El `confidence_tier` no lo decide el LLM directamente. Lo calcula el sistema con esta lógica determinística:

```
Si had_sufficient_context = false:
  → confidence_tier = "low"
  → evaluar si debe escalar como informativo

Si had_sufficient_context = true AND confidence_basis = "direct_knowledge":
  Si CompetencyTopic.approval_rate_7d >= 0.75:
    → confidence_tier = "high"
  Si CompetencyTopic.approval_rate_7d >= 0.50 AND < 0.75:
    → confidence_tier = "medium"
  Si CompetencyTopic.approval_rate_7d < 0.50 o es primera vez en este tema:
    → confidence_tier = "medium"

Si had_sufficient_context = true AND confidence_basis = "inference":
  → confidence_tier = "medium" siempre, independientemente del approval_rate
```

El `confidence` numérico (0.0 a 1.0) en la entidad Suggestion se calcula como promedio ponderado:
- `had_sufficient_context` (peso 0.5): 1.0 si true, 0.3 si false
- `approval_rate_7d` del topic (peso 0.3): valor directo
- `confidence_basis` (peso 0.2): 1.0 si direct_knowledge, 0.6 si inference, 0.3 si template

### 2.4 Lógica de decisión: responder vs. escalar

Esta lógica es **determinística primero, LLM segundo**. El orden importa:

**Paso 1 — Verificación de keywords de escalamiento (antes del LLM):**
Antes de llamar al LLM, el sistema revisa si el mensaje del cliente contiene algún keyword de las EscalationRules activas con `trigger_type = keyword_match` o `emergency_keyword`. Si hay match, escalamiento inmediato al nivel configurado en esa regla. No se llama al LLM para esta decisión.

**Paso 2 — Verificación de tipo de mensaje (antes del LLM):**
Si el mensaje es de tipo `image`, `audio`, `document` o `video`, escalamiento informativo automático. No se llama al LLM.

**Paso 3 — Llamada al LLM principal:**
Si pasó los dos filtros anteriores, se llama al LLM con el prompt completo.

**Paso 4 — Evaluación del output del LLM:**
- Si `should_respond = false`: escalar como informativo
- Si `escalation_needed = true`: escalar al nivel indicado en `escalation_level`
- Si `had_sufficient_context = false`: escalar como informativo con el `detected_intent_label` como contexto
- Si `had_sufficient_context = true` y `confidence_tier = low`: generar Suggestion con indicador de baja confianza (no escalar automáticamente, dejar al dueño decidir)
- Si `had_sufficient_context = true` y confianza media o alta: generar Suggestion

**Paso 5 — Verificación de guardrails post-generación:**
Antes de crear la Suggestion, verificar que la respuesta generada no:
- Mencione precios que no están en los KnowledgeItems de Capa 1
- Haga promesas que contradigan las reglas de Capa 2
- Incluya información de contacto que no esté en el perfil del negocio
Si falla algún guardrail: degradar a confidence_tier = low y agregar nota interna al Suggestion.

### 2.5 Gestión del caché de contexto

El prompt completo de contexto del negocio (Bloques 1-4) se cachea por `business_id`. El caché se invalida cuando:
- Se crea o actualiza cualquier KnowledgeItem del negocio
- Se actualiza el perfil del negocio (Business)
- Se activa o desactiva una EscalationRule
- Cualquier KnowledgeItem temporal expira

El Bloque 5 (historial de conversación) nunca se cachea, se construye en tiempo real para cada llamada.

El caché vive en memoria dentro de la Edge Function durante su tiempo de vida. Para persistencia entre invocaciones de la Edge Function, se usa una tabla `agent_context_cache` en Supabase con TTL de 1 hora. La Edge Function primero busca en esa tabla antes de reconstruir el contexto desde los KnowledgeItems.

### 2.6 Cuánto historial de conversación pasa al LLM

- Últimos 6 mensajes de la conversación activa (3 turnos de cliente + agente)
- Si hay mensajes previos del mismo cliente en conversaciones anteriores: los últimos 2 mensajes de la conversación más reciente anterior, solo si fue en los últimos 7 días
- El mensaje actual del cliente siempre al final
- Los mensajes del sistema (mensajes de espera, notas de escalamiento) no se incluyen en el historial enviado al LLM

**Justificación del límite de 6:** con el tamaño promedio de mensaje de WhatsApp (~50 tokens), 6 mensajes representan ~300 tokens. Sumado al prompt de contexto (~1,000 tokens), el total de entrada es ~1,300 tokens. Cómodo en costo y dentro de un contexto donde el LLM puede razonar correctamente sin confundirse con historial muy largo.

### 2.7 Aprendizaje gobernado: qué entra al conocimiento permanente

El sistema aprende de tres fuentes:

**Fuente 1 — Correcciones clasificadas como permanentes:**
Cuando el dueño clasifica una corrección como "Siempre" después de editar o rechazar una sugerencia. El contenido corregido se crea como KnowledgeItem con `validity = permanent`, `layer` determinado por el tipo de contenido, `confirmed_by_owner = true`. El caché del agente se invalida inmediatamente.

**Fuente 2 — Instrucciones rápidas confirmadas:**
Cuando el dueño confirma una instrucción en el QuickInstruct. El KnowledgeItem se crea con la clasificación de vigencia elegida por el dueño.

**Fuente 3 — Aprendizaje implícito de aprobaciones repetidas:**
Si el mismo tipo de pregunta (mismo `detected_intent`) recibe el mismo tipo de respuesta y es aprobada por el dueño más de 5 veces sin edición, el sistema puede crear un KnowledgeItem de Capa 4 con `validity = permanent` automáticamente. Este ítem generado automáticamente tiene `confirmed_by_owner = false` y aparece en el historial de aprendizaje (M3.3) marcado como "Aprendido automáticamente" para que el dueño pueda revisarlo y desactivarlo si no está de acuerdo.

**Lo que NUNCA entra automáticamente al conocimiento permanente:**
- Correcciones clasificadas como one_time
- Respuestas del agente que fueron rechazadas
- Cualquier dato que contradiga un KnowledgeItem de Capa 1 existente sin que el dueño lo confirme explícitamente

### 2.8 Versioning de cambios del agente

Cada cambio en el conocimiento del agente es trazable. La trazabilidad viene de:
- `KnowledgeSource.type` — qué tipo de evento generó el cambio
- `KnowledgeSource.created_at` — cuándo
- `KnowledgeItem.confirmed_by_owner` — si el dueño lo confirmó
- `KnowledgeItem.validity` + `valid_until` — cuánto tiempo aplica

No hay una tabla de "versiones" separada en el MVP. La trazabilidad completa se obtiene del historial de `KnowledgeSource` + `KnowledgeItem` con sus timestamps.

---

## Decisión 3 — Estrategia de LLM y abstracción de proveedor

**Decisión:** Dos modelos con routing por tipo de tarea. Proveedor principal Gemini Flash 2.5. Modelo fast/cheap Qwen2.5-72B via OpenRouter. Abstracción de proveedor desde el día 1.

### 3.1 Asignación de tareas por modelo

**Modelo principal — Gemini Flash 2.5:**
- Generación de sugerencias de respuesta (el flujo más crítico)
- Escalamiento sensible que requiere comprensión de tono y emoción
- Extracción de conocimiento desde texto libre, voz transcrita o imágenes OCR
- Resumen de primera semana (requiere síntesis de calidad)

**Modelo fast/cheap — Qwen2.5-72B via OpenRouter:**
- Clasificación de intención (`detected_intent`)
- Generación del label en español (`detected_intent_label`)
- Resúmenes diarios (estructura fija, no requiere creatividad)
- Verificación de guardrails post-generación
- Parsing de instrucciones del dueño para extraer entidad y valor

**Lógica determinística (sin LLM):**
- Verificación de keywords de escalamiento
- Clasificación de tipo de mensaje (texto vs. multimedia)
- Cálculo del confidence_tier
- Transiciones de estado de todas las entidades
- Validación de datos del onboarding
- Control de timeouts y jobs programados

### 3.2 Abstracción de proveedor

El motor del agente nunca llama directamente a la API de Gemini o de Together.ai. Toda llamada pasa por una capa de abstracción con esta interfaz:

La abstracción expone dos funciones principales:

**`generateResponse(prompt, options)`** — para el modelo principal. Recibe el prompt estructurado en bloques y las opciones de output (temperatura, formato JSON, max_tokens). Devuelve el JSON del agente o un error tipado.

**`classifyIntent(message, context)`** — para el modelo fast/cheap. Recibe el mensaje del cliente y el contexto mínimo necesario. Devuelve el intent y el label.

Internamente, cada función apunta a un proveedor configurado por variable de entorno. Para cambiar de Gemini a Claude Haiku o a GPT-4o mini, se cambia la variable de entorno y el adaptador interno. La lógica de negocio no cambia.

Los adaptadores de proveedor son el único lugar donde vive el código específico de cada API. Un adaptador para Gemini, uno para OpenRouter (Qwen), uno para Together.ai (respaldo), y stubs preparados para Claude y OpenAI cuando se necesiten.

> **Nota (Bloque 1.3, 2026-03-09):** Together.ai fue reemplazado por OpenRouter como proveedor fast. Razón: Together.ai no permitía agregar fondos a la cuenta. OpenRouter ofrece el mismo modelo (Qwen2.5-72B-Instruct) con latencia demostrada de 408ms en JSON mode, dentro del presupuesto de 500ms para clasificación. El adapter de Together.ai se mantiene como opción futura.

### 3.3 Variables de entorno del sistema LLM

```
LLM_PRIMARY_PROVIDER=gemini
LLM_PRIMARY_MODEL=gemini-2.5-flash
LLM_PRIMARY_API_KEY=[key]

LLM_FAST_PROVIDER=openrouter
LLM_FAST_MODEL=qwen/qwen-2.5-72b-instruct
LLM_FAST_API_KEY=[key]

LLM_PRIMARY_MAX_TOKENS=600
LLM_FAST_MAX_TOKENS=200
LLM_PRIMARY_TEMPERATURE=0.3
LLM_FAST_TEMPERATURE=0.1
```

Temperatura baja (0.3) para el modelo principal: queremos respuestas consistentes y predecibles, no creativas. El agente de un negocio debe responder de forma estable, no variada.

Temperatura muy baja (0.1) para el modelo fast/cheap: la clasificación de intención debe ser determinística.

### 3.4 Latencia máxima aceptable

- Clasificación de intención (Qwen): 500ms máximo
- Generación de sugerencia (Gemini): 2,000ms máximo
- Si se supera el límite de generación: crear la Suggestion de todas formas con `confidence_tier = low` y nota interna. No dejar al cliente sin respuesta de espera.
- Si el LLM falla completamente: escalar como informativo con mensaje al dueño: "Tu agente no pudo procesar esta conversación. Revísala."

### 3.5 Manejo de errores del LLM

Tres tipos de error y su manejo:

**Error de timeout:** reintento único después de 1 segundo. Si falla de nuevo, escalar como informativo.

**Error de API (rate limit, autenticación):** no reintentar. Escalar como informativo. Registrar en logs con tipo de error para monitoreo.

**Respuesta malformada (no es JSON válido o falta campo crítico):** intentar parsear lo que se pueda. Si no es recuperable, escalar como informativo.

Ningún error del LLM debe resultar en silencio hacia el cliente. Siempre hay una respuesta de espera o una respuesta del sistema que indica que el negocio está al tanto.

---

## Decisión 4 — Observabilidad desde el MVP

**Decisión:** tabla de logs estructurados en Supabase desde el día 1. Sin infraestructura de observabilidad compleja hasta Fase 2.

### 4.1 Estructura del log

Cada evento procesable del sistema genera un registro en una tabla `system_logs`:

| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| trace_id | uuid | ID único por request de webhook entrante. Todos los eventos de un mismo mensaje del cliente comparten el mismo trace_id |
| event_type | string | Nombre del evento del Event Map |
| business_id | uuid | |
| conversation_id | uuid | Si aplica |
| message_id | uuid | Si aplica |
| suggestion_id | uuid | Si aplica |
| escalation_id | uuid | Si aplica |
| actor | enum | owner, system, client, meta_webhook |
| llm_provider | string | Si la acción involucró LLM |
| llm_model | string | Modelo específico usado |
| llm_tokens_input | integer | |
| llm_tokens_output | integer | |
| llm_latency_ms | integer | |
| outcome | enum | success, error, timeout, fallback |
| error_type | string | Si outcome = error |
| error_message | string | Mensaje técnico, nunca mostrar al usuario |
| metadata | jsonb | Datos adicionales específicos del evento |
| created_at | timestamp | |

### 4.2 Qué se loguea siempre

- Cada webhook recibido de Meta (antes de procesar)
- Cada llamada al LLM (resultado y métricas)
- Cada Suggestion generada (con trace_id del webhook que la originó)
- Cada Escalation creada
- Cada acción del dueño sobre una Suggestion (aprobación, edición, rechazo)
- Cada KnowledgeItem creado o modificado
- Cada Notification enviada (push o WhatsApp)
- Cada error con su contexto completo

### 4.3 Qué NO se loguea

- Contenido completo de mensajes del cliente (privacidad)
- Tokens de acceso de Meta ni ninguna credencial
- Contraseñas ni datos de autenticación
- Contenido de KnowledgeItems (el log referencia el ID, no el contenido)

---

## Decisión 5 — Partes determinísticas que no usan LLM

Esta lista es explícita para que el agente de desarrollo no delegue al LLM decisiones que deben ser determinísticas.

**Siempre determinístico, nunca LLM:**
- Verificación de estados del onboarding (`OnboardingProgress`)
- Routing de navegación en la app
- Transiciones de estado de todas las entidades del Data Model
- Clasificación de mensajes por tipo (texto vs. multimedia)
- Verificación de keywords de escalamiento contra `EscalationRules`
- Cálculo del `confidence_tier` a partir de señales del sistema
- Activación/desactivación de `AutonomyRule` y sus condiciones
- Timeouts de sugerencias y envío de mensajes de espera
- Generación de resúmenes diarios (los números son queries SQL, el formato del mensaje WhatsApp es una plantilla fija)
- Expiración automática de KnowledgeItems temporales
- Control del rate limit de Meta (contador por business, reset diario)
- Validaciones de datos en formularios del onboarding
- Permisos y acceso a recursos

---

*AGENTI — Technical Architecture Decisions (TAD) v1.0*
