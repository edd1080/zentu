# AGENTI — Data Entities v1.0
## Domain Model para vibe coding

**Versión:** 1.0
**Tipo:** System Execution Doc — referencia en sesiones que involucren base de datos, lógica de negocio o frontend con datos reales.
**Uso:** Vocabulario compartido entre frontend y backend. Cuando el agente de desarrollo necesite nombrar, relacionar o persistir cualquier objeto del sistema, este documento es la fuente de verdad. No inventar entidades, atributos ni estados que no estén aquí.

---

## Mapa de relaciones

```
Owner
  └── Business (1:1)
        ├── Agent (1:1)
        │     ├── KnowledgeItem (1:N) ──── KnowledgeSource (N:1)
        │     ├── CompetencyTopic (1:N)
        │     └── AutonomyRule (1:N)
        ├── Conversation (1:N)
        │     ├── Message (1:N)
        │     ├── Suggestion (1:1 por conversación activa)
        │     └── Escalation (1:1 cuando aplica)
        ├── EscalationRule (1:N)
        ├── Notification (1:N)
        ├── OnboardingProgress (1:1)
        └── DailySummary (1:N)

IndustryTemplate (independiente, seed data)
  └── KnowledgeItem default (1:N)
```

---

## Entidades del sistema

---

### Owner
El dueño del negocio. Usuario autenticado de la plataforma.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | Identificador único |
| full_name | string | Nombre completo |
| email | string | Correo de acceso — único |
| phone_personal | string | Número WhatsApp personal — para notificaciones y resúmenes |
| phone_verified | boolean | Si el número personal fue verificado |
| created_at | timestamp | Fecha de registro |
| last_active_at | timestamp | Último acceso a la app |

**Notas de implementación:**
`phone_personal` es distinto al número de WhatsApp del negocio que vive en `Business`. Esta separación es crítica para el flujo de onboarding y para las notificaciones urgentes que van al número personal del dueño cuando no responde en la app.

---

### Business
El negocio del dueño. Tiene relación 1:1 con Owner en el MVP (un dueño, un negocio).

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | Identificador único |
| owner_id | uuid | FK a Owner |
| name | string | Nombre del negocio |
| industry | enum | Ver valores abajo |
| description | string | Descripción corta del negocio (máx 120 chars) |
| address | string | Dirección o zona de operación |
| phone_business | string | Número WhatsApp del negocio — el que conecta con Meta |
| whatsapp_status | enum | disconnected, connecting, connected, expired, error |
| whatsapp_phone_number_id | string | ID del número en Meta Cloud API |
| whatsapp_waba_id | string | ID del WhatsApp Business Account |
| whatsapp_access_token | string | Token de acceso Meta — encriptado |
| whatsapp_token_expires_at | timestamp | Expiración del token |
| timezone | string | Zona horaria — default "America/Guatemala" |
| schedule | jsonb | Horarios por día de la semana |
| created_at | timestamp | |
| activated_at | timestamp | Cuando el agente fue activado por primera vez |

**Valores de `industry`:**
`restaurant`, `clinic`, `salon`, `retail`, `gym`, `professional_services`, `other`

**Valores de `whatsapp_status`:**
- `disconnected` — sin número conectado
- `connecting` — Embedded Signup en progreso
- `connected` — activo y recibiendo mensajes
- `expired` — token expirado, requiere renovación
- `error` — fallo técnico específico

---

### Agent
El agente de IA del negocio. Tiene relación 1:1 con Business.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | Identificador único |
| business_id | uuid | FK a Business |
| status | enum | Ver valores abajo |
| mode | enum | collaborator, autonomous_partial, autonomous_full |
| tone | enum | friendly, professional, formal |
| activation_date | timestamp | Primera activación |
| total_conversations_handled | integer | Contador histórico |
| total_suggestions_generated | integer | Contador histórico |
| total_suggestions_approved | integer | Contador histórico |
| total_escalations | integer | Contador histórico |

**Valores de `status`:**
- `inactive` — no activado todavía (onboarding incompleto)
- `sandbox` — en prueba durante onboarding, no recibe mensajes reales
- `active` — operando normalmente
- `paused` — pausado por el dueño
- `error` — fallo técnico que impide operar

**Valores de `mode`:**
- `collaborator` — siempre sugiere, nunca envía sin aprobación (default MVP)
- `autonomous_partial` — autónomo en temas específicos con AutonomyRule activa
- `autonomous_full` — (fuera de scope MVP)

---

### IndustryTemplate
Plantilla base de conocimiento por industria. Son seed data del sistema, no las crea el dueño.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| industry | enum | Mismo enum que Business.industry |
| name | string | Nombre descriptivo de la plantilla |
| default_topics | jsonb | Lista de CompetencyTopics que se crean al seleccionar esta industria |
| default_escalation_rules | jsonb | Reglas de escalamiento sugeridas para esta industria |
| sample_questions | jsonb | Preguntas sugeridas para la prueba del agente en M1.6 |

---

### KnowledgeSource
La fuente de donde vino un dato del agente. Sirve para trazabilidad y para el historial de aprendizaje.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business |
| type | enum | onboarding, quick_instruct, voice_note, image_ocr, link_extraction, correction |
| created_at | timestamp | |
| raw_content | text | El contenido original antes de procesamiento |
| processed_by | string | Referencia al proceso que lo interpretó |

**Valores de `type`:**
- `onboarding` — información capturada durante M1.3
- `quick_instruct` — instrucción desde el componente QuickInstruct
- `voice_note` — nota de voz transcrita
- `image_ocr` — imagen procesada con OCR
- `link_extraction` — información extraída de un link
- `correction` — corrección de una sugerencia en M2.4

---

### KnowledgeItem
Una unidad de conocimiento del agente. Es el contenido real que usa para generar respuestas.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business |
| source_id | uuid | FK a KnowledgeSource |
| topic_id | uuid | FK a CompetencyTopic |
| layer | enum | structured, operational, narrative, learned |
| content | text | El dato o regla en lenguaje natural |
| validity | enum | permanent, temporary, one_time |
| valid_until | timestamp | Solo si validity = temporary |
| active | boolean | Si el agente lo usa actualmente |
| created_at | timestamp | |
| updated_at | timestamp | |
| confirmed_by_owner | boolean | Si el dueño confirmó este ítem explícitamente |

**Valores de `layer`:**
- `structured` — Capa 1: datos precisos (horarios, precios, dirección)
- `operational` — Capa 2: reglas de comportamiento (qué nunca prometer, cuándo escalar)
- `narrative` — Capa 3: tono, descripciones, promociones
- `learned` — Capa 4: respuestas aprendidas de correcciones y aprobaciones repetidas

**Valores de `validity`:**
- `permanent` — siempre activo hasta que el dueño lo modifique
- `temporary` — activo hasta `valid_until`
- `one_time` — válido solo para una conversación específica, ya usado

**Regla crítica:** un KnowledgeItem con `validity = one_time` se desactiva (`active = false`) después de usarse una vez. Un ítem con `validity = temporary` se desactiva automáticamente cuando `valid_until` pasa.

---

### CompetencyTopic
Un tema de conocimiento del agente. Es la unidad del mapa de competencias.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business |
| name | string | Nombre del tema en lenguaje del dueño ("Horarios", "Precios", "Reservaciones") |
| status | enum | strong, partial, weak |
| coverage_percentage | integer | 0-100 — calculado, no ingresado manualmente |
| approval_rate_7d | decimal | % de sugerencias aprobadas sin edición en últimos 7 días |
| escalation_rate_7d | decimal | % de conversaciones en este tema que terminaron en escalamiento en últimos 7 días |
| incident_count_7d | integer | Errores o correcciones en este tema en últimos 7 días |
| last_updated | timestamp | Última vez que algún KnowledgeItem de este tema cambió |

**Valores de `status`:**
- `strong` — cobertura alta, tasa de aprobación alta, sin incidentes recientes (verde en UI)
- `partial` — cobertura media o tasa de aprobación media (amarillo en UI)
- `weak` — cobertura baja o tasa de escalamiento alta (rojo en UI)

**Nota:** `status` es calculado automáticamente a partir de `coverage_percentage`, `approval_rate_7d` e `incident_count_7d`. No se setea manualmente.

---

### AutonomyRule
Una regla de autonomía por tema. Define si el agente puede responder solo en un CompetencyTopic específico.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business |
| topic_id | uuid | FK a CompetencyTopic |
| level | enum | collaborator, autonomous_with_guardrails |
| active | boolean | Si la regla está activa actualmente |
| activated_at | timestamp | Cuándo la activó el dueño |
| activated_by | enum | owner_manual, system_suggestion_accepted |

**Valores de `level`:**
- `collaborator` — siempre sugiere para este tema (default de todos los temas)
- `autonomous_with_guardrails` — responde solo cuando confianza es alta, sugiere si tiene dudas

**Regla de activación:** una AutonomyRule solo puede activarse si el CompetencyTopic asociado tiene `approval_rate_7d >= 0.85` AND `incident_count_7d = 0` AND `coverage_percentage >= 70`. El sistema puede sugerir activación pero no puede activarla sin confirmación del dueño.

---

### EscalationRule
Una regla que define cuándo el agente escala una conversación al dueño.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business |
| trigger_type | enum | missing_info, sensitive_topic, keyword_match, emergency_keyword |
| description | string | Descripción en lenguaje del dueño |
| escalation_level | enum | informative, sensitive, urgent |
| active | boolean | |
| is_default | boolean | Si vino de la IndustryTemplate o fue creada por el dueño |
| keywords | text[] | Solo si trigger_type = keyword_match o emergency_keyword |

---

### Conversation
Un hilo de mensajes entre un cliente y el negocio a través de WhatsApp.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business |
| client_phone | string | Número del cliente |
| client_name | string | Nombre si está disponible en WhatsApp |
| status | enum | Ver valores abajo |
| priority | enum | normal, elevated, urgent |
| last_message_at | timestamp | Timestamp del último mensaje |
| last_message_preview | string | Primeras palabras del último mensaje |
| first_message_at | timestamp | Inicio de la relación con este cliente |
| total_messages | integer | Total histórico |
| resolved_by | enum | agent_autonomous, owner_approved, owner_manual, pending |
| archived_at | timestamp | |
| created_at | timestamp | |

**Valores de `status`:**
- `active` — conversación en curso, sin acción pendiente del dueño
- `pending_approval` — hay una Suggestion pendiente de aprobación
- `escalated_informative` — escalamiento informativo activo
- `escalated_sensitive` — escalamiento sensible activo
- `escalated_urgent` — escalamiento urgente activo
- `waiting` — se envió respuesta de espera automática, cliente notificado
- `resolved` — conversación cerrada
- `archived` — archivada manualmente

**Valores de `resolved_by`:**
- `agent_autonomous` — el agente respondió solo (modo autónomo activo para ese tema)
- `owner_approved` — el dueño aprobó la sugerencia del agente
- `owner_manual` — el dueño rechazó la sugerencia y respondió manualmente
- `pending` — aún no tiene resolución

---

### Message
Un mensaje individual dentro de una Conversation.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| conversation_id | uuid | FK a Conversation |
| direction | enum | inbound, outbound |
| sender_type | enum | client, agent, owner, system |
| content | text | Contenido del mensaje |
| media_type | enum | text, image, audio, document, null |
| media_url | string | URL del archivo si aplica |
| whatsapp_message_id | string | ID del mensaje en la API de Meta |
| status | enum | sent, delivered, read, failed |
| sent_at | timestamp | |
| created_at | timestamp | |

**Valores de `sender_type`:**
- `client` — mensaje entrante del cliente
- `agent` — respuesta enviada por el agente (modo autónomo o aprobada)
- `owner` — respuesta escrita directamente por el dueño
- `system` — mensaje del sistema visible en el hilo (explicación de escalamiento, respuesta de espera, etc.)

---

### Suggestion
La respuesta propuesta por el agente para una conversación. Existe máximo una Suggestion activa por Conversation a la vez.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| conversation_id | uuid | FK a Conversation |
| business_id | uuid | FK a Business |
| content | text | Texto de la respuesta propuesta |
| confidence | decimal | 0.0 a 1.0 — nivel de confianza del modelo |
| confidence_tier | enum | high, medium, low |
| detected_intent | string | Intención detectada en lenguaje técnico — NO mostrar en UI |
| detected_intent_label | string | Etiqueta en lenguaje del dueño — SÍ mostrar en UI |
| knowledge_items_used | uuid[] | IDs de KnowledgeItems que fundamentaron la respuesta |
| status | enum | pending, approved, edited, rejected, expired, auto_sent |
| final_content | text | Contenido final enviado (puede diferir de content si fue editado) |
| correction_validity | enum | permanent, temporary, one_time, null |
| correction_valid_until | timestamp | Solo si correction_validity = temporary |
| created_at | timestamp | |
| resolved_at | timestamp | |
| resolved_by_owner | boolean | |

**Valores de `confidence_tier`:**
- `high` — >= 0.75 (punto verde en UI, botón de aprobación rápida disponible)
- `medium` — 0.50 a 0.74 (punto ámbar en UI, requiere entrar al detalle)
- `low` — < 0.50 (punto naranja en UI, se sugiere editar antes de aprobar)

**Valores de `status`:**
- `pending` — esperando decisión del dueño
- `approved` — dueño aprobó sin cambios
- `edited` — dueño editó y envió
- `rejected` — dueño rechazó y respondió manualmente
- `expired` — venció el tiempo de espera, se envió respuesta automática de espera
- `auto_sent` — enviada automáticamente por modo autónomo activo

---

### Escalation
Un evento de escalamiento dentro de una Conversation.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| conversation_id | uuid | FK a Conversation |
| business_id | uuid | FK a Business |
| level | enum | informative, sensitive, urgent |
| reason | string | Descripción del motivo en lenguaje del dueño |
| trigger_rule_id | uuid | FK a EscalationRule si fue por regla específica |
| status | enum | active, attended, resolved |
| containment_message_sent | boolean | Si se envió mensaje de contención al cliente |
| containment_message_content | text | Contenido del mensaje de contención |
| notified_push_at | timestamp | Cuándo se envió la notificación push |
| notified_whatsapp_at | timestamp | Cuándo se envió el WhatsApp al número personal |
| attended_at | timestamp | Cuándo el dueño abrió y actuó |
| resolved_at | timestamp | |
| created_at | timestamp | |

---

### OnboardingProgress
Estado del progreso del onboarding para un negocio. Permite reanudar donde se quedó.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business — unique |
| current_step | enum | industry, knowledge, escalation_rules, whatsapp, test, activation, complete |
| industry_completed | boolean | |
| knowledge_completed | boolean | |
| knowledge_completeness | integer | 0-100 — % de campos completados en M1.3 |
| escalation_rules_completed | boolean | |
| whatsapp_completed | boolean | |
| whatsapp_skipped | boolean | |
| test_completed | boolean | |
| test_messages_sent | integer | Cuántos mensajes envió en la prueba |
| activated | boolean | Si el agente fue activado |
| completed_at | timestamp | |
| last_updated | timestamp | |

---

### DailySummary
El resumen generado al final del día para enviar al dueño por WhatsApp.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business |
| date | date | Fecha del resumen |
| type | enum | daily, weekly, first_week |
| total_conversations | integer | Conversaciones recibidas ese día |
| resolved_autonomous | integer | Resueltas por el agente solo |
| resolved_owner_approved | integer | Resueltas con aprobación del dueño |
| escalated | integer | Escaladas |
| pending | integer | Pendientes al cierre del día |
| estimated_minutes_saved | integer | Tiempo estimado ahorrado |
| weak_topics | uuid[] | IDs de CompetencyTopics en estado weak ese día |
| whatsapp_sent_at | timestamp | Cuándo se envió el mensaje de WhatsApp |
| whatsapp_content | text | Contenido exacto del mensaje enviado |
| created_at | timestamp | |

---

### Notification
Un evento de notificación hacia el dueño, trazable y auditable.

| Atributo | Tipo | Descripción |
|---|---|---|
| id | uuid | |
| business_id | uuid | FK a Business |
| owner_id | uuid | FK a Owner |
| type | enum | Ver tipos en Event Map |
| channel | enum | push, whatsapp, in_app |
| title | string | Título de la notificación |
| body | string | Cuerpo del mensaje |
| action_url | string | Deep link a la pantalla relevante |
| status | enum | pending, sent, delivered, opened, failed |
| related_entity_type | string | "conversation", "escalation", "suggestion", etc. |
| related_entity_id | uuid | ID del objeto relacionado |
| sent_at | timestamp | |
| opened_at | timestamp | |
| created_at | timestamp | |

---

## Estados críticos por entidad — referencia rápida

Esta tabla es la referencia para construir lógica de transición de estados en el frontend y backend.

| Entidad | Estados posibles | Transiciones válidas |
|---|---|---|
| Business.whatsapp_status | disconnected → connecting → connected | connected → expired, connected → error, expired → connecting |
| Agent.status | inactive → sandbox → active | active → paused, paused → active, cualquiera → error |
| Conversation.status | active → pending_approval → approved/rejected | active → escalated_* → resolved, cualquiera → archived |
| Suggestion.status | pending → approved/edited/rejected/expired/auto_sent | No hay transición de vuelta desde ningún estado terminal |
| Escalation.status | active → attended → resolved | No hay transición de vuelta |
| OnboardingProgress.current_step | industry → knowledge → escalation_rules → whatsapp → test → activation → complete | Puede retroceder a cualquier paso anterior |
| KnowledgeItem.validity | permanent (no cambia) / temporary (→ expirado automático) / one_time (→ usado) | |

---

*AGENTI — Data Entities v1.0*
