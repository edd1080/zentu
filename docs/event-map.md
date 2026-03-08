# AGENTI — Event Map v1.0
## Eventos clave del sistema

**Versión:** 1.0
**Tipo:** System Execution Doc — referencia en sesiones que involucren lógica de negocio, triggers, notificaciones, sincronización frontend/backend o debugging.
**Uso:** Cada evento documenta qué lo dispara, qué efecto tiene en datos, qué cambia en la UI y qué notificación genera si aplica. Cuando el agente de desarrollo necesite implementar una acción del usuario o una respuesta del sistema, este documento define el comportamiento esperado completo.

---

## Principio de lectura

Cada evento sigue este formato:

- **Trigger:** qué acción o condición lo dispara
- **Actor:** quién lo genera (owner, system, client, agent)
- **Efecto en datos:** qué cambia en la base de datos
- **Efecto en UI:** qué cambia visualmente en la app del dueño
- **Notificación:** si genera push, WhatsApp o in-app
- **Siguiente estado:** qué evento puede ocurrir después

---

## Bloque A — Registro y acceso

---

### `owner_registered`
**Trigger:** dueño completa el formulario de registro y toca "Crear cuenta"
**Actor:** owner
**Efecto en datos:**
- Crear registro en `Owner` con estado no verificado
- Crear registro en `Business` vacío asociado
- Crear registro en `OnboardingProgress` con `current_step = industry`
- Crear registro en `Agent` con `status = inactive`
- Enviar código de verificación al `phone_personal`
**Efecto en UI:** redirige a pantalla de verificación
**Notificación:** WhatsApp con código de 6 dígitos al número personal
**Siguiente estado:** `owner_phone_verified` o `verification_failed`

---

### `owner_phone_verified`
**Trigger:** dueño ingresa código de 6 dígitos correctamente
**Actor:** owner
**Efecto en datos:**
- `Owner.phone_verified = true`
**Efecto en UI:** redirige al primer paso del onboarding (selección de industria)
**Notificación:** ninguna
**Siguiente estado:** `onboarding_started`

---

### `owner_logged_in`
**Trigger:** dueño ingresa email y contraseña correctos
**Actor:** owner
**Efecto en datos:** actualiza `Owner.last_active_at`
**Efecto en UI:** redirige al home si `OnboardingProgress.activated = true`, o al paso pendiente del onboarding si no
**Notificación:** ninguna
**Siguiente estado:** ninguno específico — ramifica según estado del onboarding

---

## Bloque B — Onboarding

---

### `onboarding_started`
**Trigger:** dueño llega al primer paso del onboarding después de verificar
**Actor:** system
**Efecto en datos:**
- `OnboardingProgress.current_step = industry`
**Efecto en UI:** muestra pantalla de selección de industria con barra de progreso
**Notificación:** ninguna
**Siguiente estado:** `industry_selected`

---

### `industry_selected`
**Trigger:** dueño toca una tarjeta de industria en M1.2
**Actor:** owner
**Efecto en datos:**
- `Business.industry = [industria seleccionada]`
- Cargar `IndustryTemplate` correspondiente
- Crear `CompetencyTopics` predeterminados de la plantilla asociados al Business
- Crear `EscalationRules` predeterminadas de la plantilla
- Crear `KnowledgeItems` base de la plantilla en Capa 1 y Capa 2
- `OnboardingProgress.industry_completed = true`
- `OnboardingProgress.current_step = knowledge`
**Efecto en UI:** muestra preview de lo que el agente ya sabe, avanza al siguiente paso
**Notificación:** ninguna
**Siguiente estado:** `knowledge_submitted`

---

### `knowledge_submitted`
**Trigger:** dueño completa y confirma al menos los campos mínimos de M1.3 (nombre del negocio + un servicio)
**Actor:** owner
**Efecto en datos:**
- Actualizar `Business.name`, `Business.description`, `Business.address`, `Business.schedule`
- Crear o actualizar `KnowledgeItems` en Capa 1 con los datos del formulario
- Crear o actualizar `KnowledgeItems` en Capa 3 con tono seleccionado
- `OnboardingProgress.knowledge_completed = true`
- `OnboardingProgress.knowledge_completeness = [% calculado]`
- `OnboardingProgress.current_step = escalation_rules`
- Actualizar `coverage_percentage` de los `CompetencyTopics` afectados
**Efecto en UI:** avanza al paso de reglas de escalamiento
**Notificación:** ninguna
**Siguiente estado:** `escalation_rules_configured`

---

### `escalation_rules_configured`
**Trigger:** dueño confirma o ajusta los toggles de escalamiento en M1.4
**Actor:** owner
**Efecto en datos:**
- Actualizar `EscalationRules.active` según los toggles
- Si el dueño agregó reglas personalizadas: crear nuevos registros en `EscalationRule` con `is_default = false`
- `OnboardingProgress.escalation_rules_completed = true`
- `OnboardingProgress.current_step = whatsapp`
**Efecto en UI:** avanza al paso de conexión de WhatsApp
**Notificación:** ninguna
**Siguiente estado:** `whatsapp_connected` o `whatsapp_skipped`

---

### `whatsapp_connection_initiated`
**Trigger:** dueño toca "Conectar mi WhatsApp Business"
**Actor:** owner
**Efecto en datos:**
- `Business.whatsapp_status = connecting`
**Efecto en UI:** abre popup de Meta Embedded Signup, spinner de espera
**Notificación:** ninguna
**Siguiente estado:** `whatsapp_connected` o `whatsapp_connection_failed`

---

### `whatsapp_connected`
**Trigger:** Meta Embedded Signup devuelve autorización exitosa
**Actor:** system (webhook de Meta)
**Efecto en datos:**
- `Business.whatsapp_status = connected`
- `Business.whatsapp_phone_number_id = [id de Meta]`
- `Business.whatsapp_waba_id = [id de Meta]`
- `Business.whatsapp_access_token = [token encriptado]`
- `Business.whatsapp_token_expires_at = [fecha de expiración]`
- `OnboardingProgress.whatsapp_completed = true`
- `OnboardingProgress.whatsapp_skipped = false`
- `OnboardingProgress.current_step = test`
**Efecto en UI:** estado de éxito con número conectado, avanza al paso de prueba
**Notificación:** ninguna
**Siguiente estado:** `agent_test_started`

---

### `whatsapp_skipped`
**Trigger:** dueño toca "Conectar después" en M1.5
**Actor:** owner
**Efecto en datos:**
- `Business.whatsapp_status = disconnected` (sin cambio)
- `OnboardingProgress.whatsapp_skipped = true`
- `OnboardingProgress.current_step = test`
**Efecto en UI:** avanza al paso de prueba con indicador de que falta conectar WhatsApp
**Notificación:** ninguna
**Siguiente estado:** `agent_test_started`

---

### `agent_test_started`
**Trigger:** dueño llega a la pantalla M1.6 — prueba del agente
**Actor:** system
**Efecto en datos:**
- `Agent.status = sandbox`
- `OnboardingProgress.current_step = test`
**Efecto en UI:** muestra interfaz de chat con el agente en sandbox
**Notificación:** ninguna
**Siguiente estado:** `agent_test_message_sent` (N veces) → `agent_activated`

---

### `agent_test_message_sent`
**Trigger:** dueño envía un mensaje en la pantalla de prueba
**Actor:** owner
**Efecto en datos:**
- `OnboardingProgress.test_messages_sent += 1`
- El agente genera respuesta usando KnowledgeItems actuales sin persistir como Conversation real
**Efecto en UI:** muestra respuesta del agente en el chat de prueba con opción de corregir en cada burbuja
**Notificación:** ninguna
**Siguiente estado:** `agent_test_correction_made` si el dueño corrige, o `agent_activated` si continúa

---

### `agent_test_correction_made`
**Trigger:** dueño toca "Corregir" en una burbuja del agente durante la prueba y confirma la corrección
**Actor:** owner
**Efecto en datos:**
- Crear `KnowledgeSource` con `type = correction`
- Crear o actualizar `KnowledgeItem` con el contenido corregido
- Actualizar `CompetencyTopic.coverage_percentage` del tema afectado
- `OnboardingProgress.test_completed = true`
**Efecto en UI:** el agente confirma en la burbuja qué aprendió, en lenguaje del dueño
**Notificación:** ninguna
**Siguiente estado:** `agent_activated`

---

### `agent_activated`
**Trigger:** dueño toca "Mi agente está listo" o "Activar agente" en M1.6 o M1.6 final
**Actor:** owner
**Efecto en datos:**
- `Agent.status = active`
- `Agent.mode = collaborator`
- `Agent.activation_date = now()`
- `Business.activated_at = now()`
- `OnboardingProgress.activated = true`
- `OnboardingProgress.test_completed = true`
- `OnboardingProgress.current_step = complete`
- `OnboardingProgress.completed_at = now()`
**Efecto en UI:** pantalla de celebración, luego redirige al home en estado "primera vez"
**Notificación:** ninguna inmediata. En 7 días: `DailySummary` de tipo `first_week`.
**Siguiente estado:** `inbound_message_received` cuando llegue el primer mensaje real

---

## Bloque C — Operación diaria

---

### `inbound_message_received`
**Trigger:** cliente envía un mensaje al WhatsApp del negocio
**Actor:** client (vía webhook de Meta)
**Efecto en datos:**
- Si es cliente nuevo: crear registro en `Conversation` con `status = active`
- Si es cliente existente: actualizar `Conversation.last_message_at` y `last_message_preview`
- Crear registro en `Message` con `direction = inbound`, `sender_type = client`
- Disparar lógica del motor del agente
**Efecto en UI:** conversación aparece o se actualiza en la bandeja M2.2, badge del tab de Conversaciones se actualiza
**Notificación:** ninguna todavía — la notificación depende del resultado del motor
**Siguiente estado:** `suggestion_generated`, `escalation_created` o (si autonomía activa) `message_sent_autonomous`

---

### `suggestion_generated`
**Trigger:** motor del agente produce una respuesta propuesta después de analizar el mensaje entrante
**Actor:** system (motor del agente)
**Efecto en datos:**
- Crear `Suggestion` con `status = pending`
- `Conversation.status = pending_approval`
- `Agent.total_suggestions_generated += 1`
**Efecto en UI:**
- Conversación sube a sección "Necesitan tu atención" en bandeja
- Etiqueta "Aprobar" aparece en el ítem de la bandeja
- Badge de conversaciones pendientes se actualiza en la barra de navegación
- Si el dueño está en el home: bandeja resumida se actualiza
**Notificación:** push `N1.1` — agrupada según reglas del sistema de notificaciones
**Siguiente estado:** `suggestion_approved`, `suggestion_edited`, `suggestion_rejected` o `suggestion_expired`

---

### `suggestion_approved`
**Trigger:** dueño toca "Aprobar" en M2.4 o en el botón de aprobación rápida de la bandeja
**Actor:** owner
**Efecto en datos:**
- `Suggestion.status = approved`
- `Suggestion.final_content = Suggestion.content` (sin cambios)
- `Suggestion.resolved_at = now()`
- `Suggestion.resolved_by_owner = true`
- Crear `Message` con `sender_type = agent`, `content = Suggestion.content`, enviarlo por WhatsApp API
- `Conversation.status = resolved`
- `Conversation.resolved_by = owner_approved`
- `Agent.total_suggestions_approved += 1`
- Actualizar `CompetencyTopic.approval_rate_7d` del tema afectado
**Efecto en UI:**
- Burbuja de sugerencia se anima con slide-up + fade, aparece en hilo como mensaje enviado
- Componente AgentSuggestion desaparece
- Conversación se mueve a sección "Atendidas" en bandeja
- Badge de pendientes decrementa
**Notificación:** ninguna
**Siguiente estado:** `inbound_message_received` si el cliente responde

---

### `suggestion_edited`
**Trigger:** dueño edita el texto de la sugerencia y toca "Enviar"
**Actor:** owner
**Efecto en datos:**
- `Suggestion.status = edited`
- `Suggestion.final_content = [texto editado por el dueño]`
- `Suggestion.resolved_at = now()`
- Crear `Message` con `sender_type = owner`, `content = final_content`
- Enviar por WhatsApp API
- `Conversation.status = resolved`
- `Conversation.resolved_by = owner_approved`
- Crear `KnowledgeSource` con `type = correction`
- Esperar clasificación del dueño para crear `KnowledgeItem` (ver `correction_classified`)
**Efecto en UI:**
- Mensaje enviado aparece en hilo con color de dueño
- Zona de clasificación de corrección aparece por 5 segundos con slide-up
- Si el dueño no interactúa en 5 segundos: clasificación automática como `one_time`
**Notificación:** ninguna
**Siguiente estado:** `correction_classified`

---

### `suggestion_rejected`
**Trigger:** dueño toca "Rechazar" y luego envía su propia respuesta
**Actor:** owner
**Efecto en datos:**
- `Suggestion.status = rejected`
- `Suggestion.resolved_at = now()`
- Crear `Message` con `sender_type = owner` con la respuesta manual
- Enviar por WhatsApp API
- `Conversation.status = resolved`
- `Conversation.resolved_by = owner_manual`
- Crear `KnowledgeSource` con `type = correction`
- Esperar clasificación (ver `correction_classified`)
**Efecto en UI:**
- Burbuja de sugerencia desaparece con fade
- Campo de escritura directa aparece activo
- Después de enviar: zona de clasificación igual que en `suggestion_edited`
**Notificación:** ninguna
**Siguiente estado:** `correction_classified`

---

### `suggestion_expired`
**Trigger:** tiempo de espera configurado se agota sin que el dueño apruebe, edite o rechace
**Actor:** system
**Efecto en datos:**
- `Suggestion.status = expired`
- Crear `Message` con `sender_type = system` con la respuesta de espera segura
- Enviar mensaje de espera por WhatsApp API
- `Conversation.status = waiting`
**Efecto en UI:**
- Nota del sistema aparece en el hilo: "Se envió respuesta de espera. ¿Quieres enviar esta respuesta ahora o ya no es necesaria?"
- La sugerencia original permanece visible para que el dueño pueda aprobarla tarde
**Notificación:** ninguna adicional (la push original ya fue enviada)
**Siguiente estado:** `suggestion_approved` (tardío) o conversación queda en `waiting`

---

### `correction_classified`
**Trigger:** dueño toca "Solo esta vez", "Siempre" o "Por ahora" en la zona de clasificación, o el timer de 5 segundos expira
**Actor:** owner o system (por timeout)
**Efecto en datos:**
- Si "Siempre" (`permanent`): crear `KnowledgeItem` con `validity = permanent`, `layer` según contenido, `confirmed_by_owner = true`
- Si "Por ahora" (`temporary`): crear `KnowledgeItem` con `validity = temporary`, `valid_until = [fecha seleccionada]`
- Si "Solo esta vez" o timeout (`one_time`): crear `KnowledgeItem` con `validity = one_time`, `active = false` inmediatamente
- Actualizar `Suggestion.correction_validity`
- Actualizar `CompetencyTopic` afectado
**Efecto en UI:**
- Si permanent: confirmación del agente en el hilo: "Listo. Usaré esto a partir de ahora."
- Si temporary: confirmación del agente: "Listo. Lo recordaré hasta el [fecha]."
- Si one_time: sin confirmación visible — fue una respuesta puntual
**Notificación:** ninguna
**Siguiente estado:** ninguno específico

---

### `escalation_created`
**Trigger:** motor del agente determina que no puede o no debe responder solo
**Actor:** system (motor del agente)
**Efecto en datos:**
- Crear `Escalation` con `level` correspondiente y `status = active`
- `Conversation.status = escalated_[level]`
- `Conversation.priority = elevated` o `urgent` según nivel
- Si urgent: crear `Message` del sistema con respuesta de contención, `Escalation.containment_message_sent = true`
- `Agent.total_escalations += 1`
- Actualizar `CompetencyTopic.escalation_rate_7d` del tema afectado
**Efecto en UI:**
- Conversación sube a sección "Necesitan tu atención" con etiqueta de color según nivel
- Si urgent: banner rojo reemplaza zona superior del home
- Badge de navegación se actualiza
**Notificación:**
- Informativo: push `N1.2` agrupada cada 15 min
- Sensible: push `N1.3` inmediata
- Urgente: push `N2.1` inmediata + WhatsApp si no abre en 5 min
**Siguiente estado:** `escalation_attended`

---

### `escalation_attended`
**Trigger:** dueño abre la conversación escalada y envía una respuesta
**Actor:** owner
**Efecto en datos:**
- `Escalation.status = attended`
- `Escalation.attended_at = now()`
- Crear `Message` con `sender_type = owner`
- Enviar por WhatsApp API
- `Conversation.status = resolved`
**Efecto en UI:**
- Banner de urgencia desaparece (si era urgente)
- Conversación se mueve a "Atendidas"
- Etiqueta cambia a "Urgente atendido" en historial
**Notificación:** ninguna
**Siguiente estado:** `escalation_resolved` (automático al marcar resolved)

---

### `message_sent_autonomous`
**Trigger:** agente envía respuesta directamente sin consultar al dueño (modo autónomo activo para ese tema)
**Actor:** system (agente en modo autónomo)
**Efecto en datos:**
- Crear `Message` con `sender_type = agent`
- Enviar por WhatsApp API
- Crear `Suggestion` con `status = auto_sent`
- `Conversation.status = resolved`
- `Conversation.resolved_by = agent_autonomous`
- `Agent.total_suggestions_approved += 1` (conta como aprobada automáticamente)
**Efecto en UI:**
- Conversación aparece directamente en sección "Atendidas" sin pasar por "Necesitan tu atención"
- Mensaje en hilo muestra ícono de agente
- No genera badge de pendientes
**Notificación:** ninguna para el dueño (la autonomía fue explícitamente activada por él)
**Siguiente estado:** `inbound_message_received` si el cliente responde

---

## Bloque D — Entrenamiento y conocimiento

---

### `quick_instruction_sent`
**Trigger:** dueño escribe o graba una instrucción en el componente QuickInstruct del home o en M3.1
**Actor:** owner
**Efecto en datos:**
- Crear `KnowledgeSource` con `type = quick_instruct`, `voice_note`, `image_ocr` o `link_extraction` según el método
- Motor procesa la instrucción y genera respuesta de confirmación
**Efecto en UI:**
- Campo QuickInstruct entra en estado "procesando" (300ms máximo visible)
- Respuesta del agente aparece como burbuja de confirmación
- Dos botones: "Sí, correcto" y "No, déjame explicar"
**Notificación:** ninguna
**Siguiente estado:** `instruction_confirmed` o `instruction_clarified`

---

### `instruction_confirmed`
**Trigger:** dueño toca "Sí, correcto" en la confirmación del agente
**Actor:** owner
**Efecto en datos:**
- Crear `KnowledgeItem` con el contenido procesado
- `validity` según la clasificación del dueño (aparece zona de clasificación igual que en correcciones)
- Actualizar `CompetencyTopic` afectado
- `KnowledgeItem.confirmed_by_owner = true`
**Efecto en UI:**
- Confirmación del agente: "Listo. [descripción del cambio en lenguaje del dueño]"
- QuickInstruct regresa a estado neutro
- Si era un tema en rojo: `CompetencyTopic.status` puede cambiar a amarillo o verde si la cobertura aumentó
**Notificación:** ninguna
**Siguiente estado:** ninguno específico

---

### `autonomy_rule_activated`
**Trigger:** dueño confirma activación de autonomía en el modal de M4.3
**Actor:** owner
**Efecto en datos:**
- Crear o actualizar `AutonomyRule` para el `CompetencyTopic` con `level = autonomous_with_guardrails`, `active = true`
- `Agent.mode = autonomous_partial` si es la primera AutonomyRule activa
- `AutonomyRule.activated_by = owner_manual` o `system_suggestion_accepted`
**Efecto en UI:**
- Indicador del tema cambia a estado autónomo en M4.3 y M3.2
- Botón de desactivar aparece disponible inmediatamente
**Notificación:** ninguna
**Siguiente estado:** `message_sent_autonomous` para conversaciones de ese tema

---

### `autonomy_rule_deactivated`
**Trigger:** dueño toca "Desactivar" en M4.3 para un tema específico
**Actor:** owner
**Efecto en datos:**
- `AutonomyRule.active = false`
- Si no quedan `AutonomyRules` activas: `Agent.mode = collaborator`
**Efecto en UI:** instantáneo, sin confirmación, indicador del tema regresa a colaborador
**Notificación:** ninguna
**Siguiente estado:** `suggestion_generated` para futuras conversaciones de ese tema

---

### `autonomy_suggested_by_system`
**Trigger:** `CompetencyTopic.approval_rate_7d >= 0.85` AND `incident_count_7d = 0` AND `coverage_percentage >= 70` por 7 días consecutivos, sin `AutonomyRule` activa para ese tema
**Actor:** system
**Efecto en datos:** ninguno hasta que el dueño confirme
**Efecto en UI:** sugerencia proactiva in-app en el home: "Tu agente lleva [N] respuestas sobre [tema] sin ninguna corrección. ¿Quieres que responda solo?"
**Notificación:** push `N4.3` — máximo cada 14 días
**Siguiente estado:** `autonomy_rule_activated` o descartado por el dueño

---

## Bloque E — Notificaciones y resúmenes

---

### `daily_summary_generated`
**Trigger:** hora configurada por el dueño (default 8 PM) si hubo actividad ese día
**Actor:** system
**Efecto en datos:**
- Crear `DailySummary` con `type = daily` y los contadores del día
- Generar contenido del mensaje en formato WhatsApp
- `DailySummary.whatsapp_sent_at = now()`
**Efecto en UI:** ninguno inmediato en app — el resumen vive en M5.1 como historial
**Notificación:** WhatsApp `N3.1` al número personal del dueño
**Siguiente estado:** ninguno específico

---

### `first_week_summary_generated`
**Trigger:** exactamente 7 días después de `agent_activated`
**Actor:** system
**Efecto en datos:**
- Crear `DailySummary` con `type = first_week`
- Contenido más extenso que el diario: incluye comparativa, temas dominados y temas débiles
**Efecto en UI:** ninguno inmediato
**Notificación:** WhatsApp `N3.3` — solo ocurre una vez en el ciclo de vida del negocio
**Siguiente estado:** ninguno específico

---

### `whatsapp_token_expiring`
**Trigger:** `Business.whatsapp_token_expires_at` está a menos de 7 días del momento actual
**Actor:** system
**Efecto en datos:** ninguno hasta que el dueño renueve
**Efecto en UI:** indicador en M4.4 y badge en el tab de Ajustes
**Notificación:** push `N5.2` + WhatsApp si no hay acción en 24 horas
**Siguiente estado:** `whatsapp_connected` (renovación exitosa)

---

### `whatsapp_disconnected`
**Trigger:** webhook de Meta reporta desconexión o el token expiró sin renovación
**Actor:** system
**Efecto en datos:**
- `Business.whatsapp_status = error` o `expired`
- `Agent.status = error`
**Efecto en UI:**
- Indicador rojo en `AgentStatusBar` del home
- Banner en M4.4
**Notificación:** push `N2.2` inmediata + WhatsApp si no hay acción en 15 minutos
**Siguiente estado:** `whatsapp_connection_initiated` cuando el dueño reconecta

---

## Mapa de eventos por actor

### Eventos generados por el Owner (acciones del dueño)
`owner_registered`, `owner_phone_verified`, `owner_logged_in`, `industry_selected`, `knowledge_submitted`, `escalation_rules_configured`, `whatsapp_connection_initiated`, `whatsapp_skipped`, `agent_test_message_sent`, `agent_test_correction_made`, `agent_activated`, `suggestion_approved`, `suggestion_edited`, `suggestion_rejected`, `correction_classified`, `quick_instruction_sent`, `instruction_confirmed`, `autonomy_rule_activated`, `autonomy_rule_deactivated`

### Eventos generados por el System (lógica automática)
`onboarding_started`, `suggestion_generated`, `suggestion_expired`, `escalation_created`, `message_sent_autonomous`, `daily_summary_generated`, `first_week_summary_generated`, `whatsapp_token_expiring`, `whatsapp_disconnected`, `autonomy_suggested_by_system`

### Eventos generados por el Client (acciones del cliente final)
`inbound_message_received`

### Eventos generados por Meta (webhooks externos)
`whatsapp_connected`, `whatsapp_disconnected`

---

## Eventos críticos por orden de impacto en el MVP

Si el agente de desarrollo debe priorizar qué implementar primero en términos de lógica de eventos, este es el orden:

1. `inbound_message_received` — sin esto no hay producto
2. `suggestion_generated` — el evento central del modo colaborador
3. `suggestion_approved` / `suggestion_edited` / `suggestion_rejected` — el flujo más ejecutado
4. `escalation_created` — protege al negocio de errores del agente
5. `agent_activated` — completa el onboarding
6. `whatsapp_connected` — habilita el canal real
7. `correction_classified` — alimenta el aprendizaje
8. `daily_summary_generated` — retención post-activación
9. `autonomy_rule_activated` — diferenciador de valor en Fase 2
10. `quick_instruction_sent` — entrenamiento continuo

---

*AGENTI — Event Map v1.0*
