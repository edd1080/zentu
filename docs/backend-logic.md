# AGENTI — Backend Logic Overview v2.0
## Cómo funciona el sistema por dentro

**Versión:** 2.0
**Tipo:** System Execution Doc — lectura obligatoria antes de construir cualquier Edge Function, cualquier lógica de servidor, o cualquier interacción entre el frontend y la base de datos.
**Propósito:** Explicar en lenguaje natural cómo entra un mensaje al sistema, cómo se procesa, cómo genera valor para el dueño, cómo aprende y cómo se conecta todo. No reemplaza al TAD ni al Event Map — los complementa con el "por qué" y el "cómo" de cada pieza del backend, incluyendo la construcción exacta del prompt del agente y el mecanismo de abstracción del aprendizaje.
**Referencia cruzada:** Leer junto con Data Entities v1.0, Event Map v1.0, TAD v1.0 y WhatsApp Integration Specs v1.0.

---

## Mapa mental del backend

El backend de AGENTI tiene cinco responsabilidades distintas que deben sentirse como una sola máquina:

**1. Recibir:** capturar mensajes de clientes desde WhatsApp sin perder ninguno y sin bloquear el canal.

**2. Procesar:** decidir qué hacer con cada mensaje usando lógica determinística primero y el LLM cuando es necesario.

**3. Actuar:** crear Suggestions para el dueño, enviar respuestas cuando corresponde, escalar cuando el agente no puede o no debe responder.

**4. Aprender:** registrar cada decisión y cada corrección del dueño de forma que el agente mejore con el tiempo de forma gobernada.

**5. Notificar:** mantener al dueño informado sin abrumarlo, en el canal correcto, en el momento correcto.

Todo lo demás — onboarding, configuración, inteligencia, resúmenes — es soporte a estas cinco responsabilidades.

---

## Parte 1 — Cómo funciona el backend de onboarding

El onboarding tiene lógica de backend relativamente simple comparado con la operación diaria, pero tiene puntos críticos que si se implementan mal bloquean al usuario antes de ver el valor.

### 1.1 Registro y creación de cuenta

Cuando el dueño envía el formulario de registro, el backend hace cuatro cosas en una sola transacción atómica: crea el Owner, crea un Business vacío asociado, crea un OnboardingProgress con el primer paso pendiente, y crea un Agent con status inactivo. Son cuatro registros en cuatro tablas pero son un solo evento del sistema. Si falla cualquiera de los cuatro, ninguno debe persistir.

Inmediatamente después de crear la cuenta, el backend envía el código de verificación al número personal del dueño por WhatsApp. Para ese primer mensaje el sistema usa el número de WhatsApp de AGENTI como plataforma, no el número del negocio que todavía no existe. El código expira en 10 minutos. Si el dueño pide reenvío, se genera un código nuevo y el anterior se invalida.

El backend verifica el código usando un hash seguro, no comparación directa de strings. Si el código es correcto, marca `Owner.phone_verified = true` y devuelve un token de sesión al frontend.

### 1.2 Selección de industria y carga de plantilla

Cuando el dueño selecciona una industria, el backend no solo actualiza un campo en Business. Hace una operación de seed que es la más compleja del onboarding: carga la IndustryTemplate correspondiente y desde ella crea todos los CompetencyTopics predeterminados, todas las EscalationRules predeterminadas con sus keywords, y los KnowledgeItems base de Capa 1 y Capa 2 que aplican a toda empresa de esa industria. Para un restaurante, por ejemplo, esto incluye un KnowledgeItem de Capa 2 que dice "nunca confirmar un pedido a domicilio si no hay información de dirección del cliente."

Esta operación debe ser idempotente. Si el dueño cambia de industria antes de confirmar, el backend elimina todos los registros creados por la selección anterior y vuelve a crear desde la nueva plantilla. Nunca deja datos huérfanos de una industria que ya no aplica.

### 1.3 Captura de conocimiento inicial

La pantalla de conocimiento inicial tiene múltiples métodos de entrada. El backend maneja cada uno de forma distinta.

Para texto libre, el backend parsea directamente los campos del formulario y crea KnowledgeItems con la capa correspondiente. El nombre del negocio y la dirección van a Capa 1. La descripción del negocio va a Capa 3. Las políticas que el dueño escriba van a Capa 2.

Para notas de voz, el backend recibe el archivo de audio y lo manda a Gemini Flash 2.5, que tiene capacidad nativa de transcripción de audio. Con la transcripción resultante hace el mismo proceso que con texto libre. La transcripción se guarda en `KnowledgeSource.raw_content` y el KnowledgeItem procesado referencia esa fuente.

Para imágenes de menú o listas de precios, el backend recibe la imagen, la manda a Gemini Flash 2.5 con una instrucción de extracción estructurada, y del resultado crea KnowledgeItems individuales por servicio o precio. Si el modelo no puede extraer datos confiables de la imagen, devuelve un resultado vacío con un flag de baja confianza y el frontend muestra al dueño que necesita revisar manualmente.

Para links de sitios web o redes sociales, el backend hace fetch del contenido de la URL, extrae el texto relevante y usa el modelo fast/cheap para identificar información de negocio. Esta extracción es la más frágil — muchos sitios bloquean scraping o tienen contenido en JavaScript no accesible. Si falla, el backend lo informa sin romper el flujo del onboarding.

En todos los casos, después de crear los KnowledgeItems el backend actualiza `OnboardingProgress.knowledge_completeness` recalculando el porcentaje de campos completados sobre el total de campos esperados para esa industria.

### 1.4 Conexión de WhatsApp

El flujo técnico de Embedded Signup está detallado completo en WhatsApp Integration Specs. Lo que este documento agrega es la conexión entre ese flujo y el resto del onboarding.

Después de que la conexión es exitosa, el backend actualiza el Agent para prepararlo para recibir mensajes reales y encola el job de resumen de primera semana para que se ejecute 7 días después. Si el dueño omite la conexión, el backend marca `OnboardingProgress.whatsapp_skipped = true` y el Agent permanece en modo sandbox. Cuando el dueño quiera conectar después desde M4.4, el flujo retoma exactamente donde dejó.

### 1.5 Prueba del agente en sandbox

El sandbox no es una simulación falsa. Es el motor del agente real con los KnowledgeItems reales del negocio, pero sin conectar al canal de WhatsApp y sin persistir conversaciones como datos de producción. Las respuestas en sandbox pasan por el mismo pipeline de generación que en producción — la diferencia es que el resultado no se convierte en una Suggestion real sino en una respuesta efímera del chat de prueba.

Las correcciones que el dueño hace durante la prueba sí persisten. Si el dueño toca "Corregir" en una burbuja del agente y confirma el cambio, ese KnowledgeItem se crea como dato real del negocio y el agente lo usará desde ese momento en adelante, tanto en el sandbox como en producción.

### 1.6 Activación del agente

Cuando el dueño activa el agente, el backend hace la transición de estado más importante del onboarding: `Agent.status` pasa de `sandbox` a `active`. A partir de ese momento, cualquier mensaje que llegue al número de WhatsApp del negocio entra al pipeline de producción completo. El backend registra `Agent.activation_date` y encola el job de resumen de primera semana si no está ya encolado.

---

## Parte 2 — El pipeline de un mensaje entrante

Este es el corazón del backend. Todo lo demás existe para que este pipeline funcione bien.

### 2.1 Recepción (Edge Function: whatsapp-webhook)

Un mensaje llega. El webhook de Meta hace POST a la Edge Function `whatsapp-webhook`. Lo primero que hace la función es responder 200 a Meta. Inmediatamente. Antes de hacer cualquier otra cosa. Si Meta no recibe 200 en 5 segundos, considera que el webhook falló y puede desactivarlo después de varios reintentos.

Después de responder 200, la función verifica la firma del request usando HMAC-SHA256 con el App Secret contra el header `X-Hub-Signature-256`. Si la firma no coincide, el evento se registra en logs como intento inválido y se descarta. Si la firma es válida, la función genera un `trace_id` único para este ciclo y lo adjunta a todo lo que venga después. Luego invoca asincrónicamente la Edge Function `process-message` con el payload completo y ese trace_id.

Si la invocación asíncrona falla, el payload se guarda en la tabla `webhook_queue` con estado pendiente. Un job revisa esa tabla cada 2 minutos y reprocesa los payloads pendientes con menos de 30 minutos de antigüedad.

### 2.2 Identificación (Edge Function: process-message — fase 1)

La función `process-message` arranca identificando el contexto completo. Del payload extrae el `phone_number_id` del metadata y lo usa para buscar el Business en la base de datos. Si no existe un Business con ese `phone_number_id`, el mensaje viene de un número no registrado en el sistema — se registra en logs y se descarta sin error.

Si el Business existe, verifica que el Agent tenga `status = active`. Si el agente está en `sandbox`, `paused` o `error`, el mensaje no se procesa y se guarda en una cola de mensajes no procesados visible para el dueño en la app.

Luego identifica al cliente por su número de WhatsApp. Busca si existe una Conversation con ese cliente donde el último mensaje fue hace menos de 24 horas. Si existe, la usa. Si no, crea una nueva Conversation con `status = active`. Finalmente crea el registro de Message con `direction = inbound`, `sender_type = client`, y todos los campos del payload de Meta incluyendo el `whatsapp_message_id`.

### 2.3 Filtros determinísticos (Edge Function: process-message — fase 2)

Antes de tocar el LLM, el sistema aplica tres filtros en orden estricto. Estos filtros resuelven los casos donde la respuesta correcta se conoce sin necesidad de razonamiento del modelo.

**Filtro de duplicados:** verifica que el `whatsapp_message_id` no existe ya en la tabla de Messages. Meta puede reenviar el mismo webhook si no recibió confirmación rápida. Si el ID ya existe, el mensaje es un duplicado y se descarta silenciosamente sin crear ningún registro adicional.

**Filtro de tipo de mensaje:** si el tipo es `image`, `audio`, `document` o `video`, el agente no puede procesarlo en el MVP. Se crea una Escalation con `level = informative` con una razón descriptiva del tipo de archivo recibido. Se envía al cliente un mensaje de contención: "Recibimos tu mensaje. Te atenderemos pronto." El dueño recibe notificación de tipo informativo. El pipeline termina aquí para este mensaje.

**Filtro de keywords de escalamiento:** revisa el texto del mensaje contra todas las EscalationRules activas del negocio que tengan `trigger_type = keyword_match` o `emergency_keyword`. La comparación es case-insensitive y busca coincidencia parcial — el keyword puede estar dentro de una oración más larga. Si hay match con una regla de `emergency_keyword`, se crea una Escalation con `level = urgent` inmediatamente. Si hay match con `keyword_match`, se crea Escalation con el nivel configurado en esa regla. El pipeline termina aquí para este mensaje.

Si el mensaje pasa los tres filtros, continúa hacia la construcción del contexto y el motor del agente.

### 2.4 Construcción del contexto del agente (Edge Function: process-message — fase 3)

Esta fase construye el material completo que el LLM necesita para generar una respuesta. El contexto tiene seis bloques que se ensamblan en un prompt estructurado.

El sistema primero busca en la tabla `agent_context_cache` si existe un contexto preconstruido para este `business_id` con menos de 1 hora de antigüedad. Si existe, usa ese caché para los Bloques 1 al 4 sin hacer queries adicionales a la base de datos. Si no existe o está vencido, construye los cuatro bloques desde cero con queries a la base de datos y guarda el resultado en el caché como texto formateado listo para inyectar. Esto elimina el costo de reconstruir el contexto del negocio en cada mensaje.

Los Bloques 5 y 6 nunca se cachean — siempre se construyen en tiempo real para cada conversación.

La sección siguiente explica exactamente qué contiene cada bloque y cómo se formatea.

---

## Parte 3 — Construcción exacta del prompt del agente

Esta es la pieza más crítica del backend. El prompt del agente determina directamente la calidad de las respuestas que el dueño ve en su pantalla. Está construido en seis bloques que se concatenan en orden para formar el system prompt completo de cada llamada al LLM principal.

### 3.1 Bloque 1 — Identidad y rol

Este bloque establece quién es el agente y qué puede hacer. Se genera una vez por negocio y se cachea junto con los Bloques 2, 3 y 4.

El texto del bloque tiene esta estructura:

```
Eres el asistente virtual de [Business.name], un negocio de [industry_label] ubicado en [Business.address].

Tu rol es atender mensajes de clientes en WhatsApp en nombre del negocio. Tu objetivo es responder de forma útil, precisa y con el tono del negocio cuando tienes información suficiente para hacerlo. Cuando no tienes información suficiente o cuando el tema requiere atención personal del dueño, lo indicas claramente en tu respuesta estructurada.

Tono de comunicación: [Business.tone traducido a instrucción — ver tabla de tonos abajo].

Restricciones absolutas:
- Nunca inventes precios, horarios, direcciones ni información de contacto que no esté en tu conocimiento.
- Nunca hagas promesas que contradigan las reglas operativas del negocio.
- Nunca te identifiques como una inteligencia artificial a menos que el cliente lo pregunte directamente.
- Responde siempre en español. Si el cliente escribe en otro idioma, responde en español con una nota amigable.
```

**Tabla de traducción de tonos:**
- `friendly` → "Usa un tono cálido, cercano y conversacional. Como si fuera un miembro del equipo que conoce bien a los clientes."
- `professional` → "Usa un tono profesional y claro. Directo al punto, sin excesiva informalidad pero siempre amable."
- `formal` → "Usa un tono formal y respetuoso. Vocabulario cuidado, oraciones completas, sin abreviaciones."

### 3.2 Bloque 2 — Conocimiento estructurado y reglas operativas (Capas 1 y 2)

Este bloque contiene todos los KnowledgeItems activos de `layer = structured` y `layer = operational` del negocio. Son los datos de mayor prioridad porque definen lo que el agente puede y no puede decir con certeza.

El formato es una lista organizada por CompetencyTopic con etiquetas claras. Por ejemplo, para un restaurante:

```
INFORMACIÓN DEL NEGOCIO (datos verificados — usa estos exactamente como están):

Horarios:
- Lunes a viernes: 7:00 AM a 9:00 PM
- Sábados: 8:00 AM a 10:00 PM
- Domingos: cerrado

Servicios y precios:
- Desayuno completo: Q45
- Almuerzo del día (incluye bebida): Q65
- Pedidos para llevar: disponible, tiempo estimado 20 minutos
- Delivery: no disponible actualmente

Métodos de pago:
- Efectivo, tarjeta de crédito y débito, transferencia bancaria

REGLAS DE COMPORTAMIENTO (sigue estas instrucciones siempre):
- No confirmes pedidos a domicilio — el negocio no hace delivery.
- No cotices precios de catering por WhatsApp — pide al cliente que llame al número del negocio.
- Si el cliente pregunta por reservaciones para grupos de más de 10 personas, escala — requiere coordinación directa con el dueño.
```

Cada KnowledgeItem activo de Capa 1 y Capa 2 se convierte en una línea de este bloque. El sistema no inyecta el objeto raw de la base de datos — formatea el contenido como instrucción directa al agente. El formateo ocurre durante la construcción del caché, no en tiempo de llamada al LLM.

### 3.3 Bloque 3 — Contenido narrativo y conocimiento aprendido (Capas 3 y 4)

Este bloque contiene los KnowledgeItems de `layer = narrative` y `layer = learned` activos y vigentes. Son los datos que hacen que las respuestas suenen como el negocio específico, no como un agente genérico.

```
CONTEXTO DEL NEGOCIO (úsalo para enriquecer tus respuestas):

Descripción: Somos un restaurante familiar con más de 15 años en la Zona 10. Especialidad en comida guatemalteca tradicional con un toque moderno. Ambiente familiar y acogedor.

Promociones vigentes:
- Martes de 2x1 en jugos naturales (válido hasta el 31 de este mes)
- 10% de descuento para estudiantes con carné universitario

RESPUESTAS APRENDIDAS (respuestas que el dueño ha aprobado para preguntas frecuentes):
- Cuando preguntan si hay estacionamiento: "Sí contamos con parqueo propio, sin costo adicional para clientes."
- Cuando preguntan por el menú completo: "Te comparto nuestro menú del día: [lista del día]. Para el menú completo puedes visitarnos o escribirnos mañana en la mañana cuando publicamos las especiales."
```

Los KnowledgeItems de Capa 4 con `validity = temporary` solo se incluyen si `valid_until > now()`. Los de `validity = one_time` nunca aparecen en el bloque de contexto cacheado — se inyectan directamente en la conversación específica donde aplican y se desactivan después.

### 3.4 Bloque 4 — Reglas de escalamiento activas

Este bloque traduce las EscalationRules activas a instrucciones directas para el agente. No le dice al agente cuándo "sugerir" escalar — le dice cuándo hacerlo de forma imperativa.

```
CUÁNDO ESCALAR (no intentes responder estos casos — marca escalation_needed como true):

- Si el cliente menciona alguna de estas palabras: "urgente", "emergencia", "intoxicación", "accidente" → escala como urgente
- Si el cliente pregunta sobre reservaciones para eventos o grupos grandes → escala como sensible
- Si el cliente menciona una queja sobre su última visita → escala como sensible
- Si no tienes información suficiente para responder con certeza → escala como informativo
```

### 3.5 Bloque 5 — Historial de conversación activa

Este bloque es el único que se construye completamente en tiempo real para cada llamada. Contiene los últimos 6 mensajes del hilo activo, excluyendo mensajes del sistema.

```
CONVERSACIÓN ACTUAL:

[Cliente]: Hola buenas, ¿a qué hora abren hoy?
[Agente]: ¡Hola! Hoy es martes, abrimos a las 7 de la mañana y cerramos a las 9 de la noche. ¿En qué más te podemos ayudar?
[Cliente]: Perfecto. ¿Tienen algo especial los martes?
```

Si es el primer mensaje del cliente en esa conversación, el bloque solo contiene ese mensaje sin historial previo.

Si hay mensajes anteriores del mismo cliente en otras conversaciones de los últimos 7 días, se agrega una nota de contexto antes del historial actual: "Nota: este cliente ya había escrito anteriormente. Su última consulta fue sobre [detected_intent_label de la última conversación]." Esto le da al agente contexto de la relación sin saturar el prompt con historial completo.

### 3.6 Bloque 6 — Instrucción de output estructurado

Este bloque es siempre el mismo en todas las llamadas. Define el formato exacto de la respuesta que el agente debe devolver. No es opcional ni flexible.

```
INSTRUCCIÓN DE RESPUESTA:

Responde ÚNICAMENTE con un objeto JSON válido con exactamente estos campos. Sin texto antes, sin texto después, sin markdown, sin explicaciones. Solo el JSON:

{
  "should_respond": [true si puedes dar una respuesta útil, false si no puedes o no debes],
  "response": "[texto de la respuesta para enviar al cliente — solo si should_respond es true]",
  "had_sufficient_context": [true si encontraste información específica en el conocimiento del negocio, false si tuviste que inferir o no encontraste el dato],
  "knowledge_items_used": ["descripción breve del dato 1 que usaste", "descripción breve del dato 2"],
  "detected_intent": "[nombre técnico del intent en snake_case, ejemplo: schedule_inquiry]",
  "detected_intent_label": "[nombre del intent en español para el dueño, ejemplo: Pregunta sobre horarios]",
  "escalation_needed": [true si debes escalar según las reglas, false si no],
  "escalation_level": "[informative | sensitive | urgent | null]",
  "escalation_reason": "[razón en español para el dueño si escalation_needed es true, null si no]",
  "confidence_basis": "[direct_knowledge | inference | template]"
}
```

**Nota sobre `knowledge_items_used`:** en el Bloque 6 se le pide al modelo que devuelva descripciones breves de los datos que usó, no los UUIDs de los KnowledgeItems. Los UUIDs no están en el prompt — el agente no los conoce. El sistema los resuelve en el backend comparando las descripciones devueltas contra el contenido de los KnowledgeItems del negocio para encontrar los más probables. Esta resolución es aproximada y suficiente para el propósito de trazabilidad del MVP.

### 3.7 Prompt completo ensamblado

El prompt que recibe el LLM es la concatenación de los seis bloques separados por saltos de línea dobles. El system prompt contiene los Bloques 1 al 4. El último mensaje del array de messages contiene los Bloques 5 y 6, con el historial de conversación primero y la instrucción de output al final.

Esto sigue la convención estándar de chat completion: el system prompt establece identidad y contexto, el array de messages contiene la conversación y la instrucción de respuesta actual.

La temperatura de esta llamada es 0.3. El máximo de tokens de salida es 600. Si el modelo necesita más de 600 tokens para responder una consulta de WhatsApp, hay un problema de calidad en el prompt o en el contexto, no en el límite.

---

## Parte 4 — Evaluación del output y creación de Suggestion o Escalation

### 4.1 Parsing y validación del JSON

El sistema intenta parsear la respuesta del LLM como JSON. Si el parsing falla, intenta una limpieza básica: eliminar posibles backticks de markdown, espacios iniciales o texto antes del primer `{`. Si sigue fallando después de la limpieza, trata el caso como error de respuesta malformada y escala como informativo con nota interna describiendo el error técnico.

Si el parsing es exitoso, verifica que todos los campos requeridos estén presentes y tengan tipos correctos. Un campo faltante o de tipo incorrecto se trata como parcialmente malformado y se intenta recuperar con valores por defecto conservadores: `had_sufficient_context = false`, `confidence_basis = template`, `escalation_needed = false`.

### 4.2 Cálculo del confidence_tier

El `confidence_tier` lo calcula el sistema con lógica determinística, no el LLM. El proceso es:

Si `had_sufficient_context = false`: el tier es `low` independientemente de cualquier otra señal.

Si `had_sufficient_context = true` y `confidence_basis = direct_knowledge`: el tier se determina por el historial del CompetencyTopic. Si el `approval_rate_7d` del topic detectado es 0.75 o mayor, el tier es `high`. Si está entre 0.50 y 0.74, es `medium`. Si está por debajo de 0.50 o si es la primera conversación en ese topic, es `medium` también — nunca `high` en el primer contacto.

Si `had_sufficient_context = true` y `confidence_basis = inference`: el tier es `medium` siempre, independientemente del approval_rate. Inferir no es lo mismo que saber.

Si `had_sufficient_context = true` y `confidence_basis = template`: el tier es `low`. Una respuesta de plantilla genérica no merece confianza alta.

El valor numérico de `confidence` (0.0 a 1.0) es un promedio ponderado: `had_sufficient_context` tiene peso 0.5 (1.0 si true, 0.3 si false), `approval_rate_7d` del topic tiene peso 0.3, y `confidence_basis` tiene peso 0.2 (1.0 si direct_knowledge, 0.6 si inference, 0.3 si template).

### 4.3 Guardrails post-generación

Antes de crear la Suggestion, el sistema aplica tres verificaciones determinísticas sobre el contenido de la respuesta generada.

**Verificación de precios:** extrae todos los números precedidos de símbolos de moneda o seguidos de palabras como "quetzales", "pesos", "dólares" de la respuesta generada. Verifica que cada número mencionado aparece en algún KnowledgeItem de Capa 1 activo del negocio. Si hay un precio en la respuesta que no está en el conocimiento del negocio, el guardrail falla.

**Verificación de horarios:** extrae todas las referencias a horas de la respuesta generada. Verifica que sean consistentes con el `Business.schedule`. Si la respuesta dice "abrimos a las 8 AM" pero el schedule dice 9 AM, el guardrail falla.

**Verificación de información de contacto:** extrae números de teléfono, direcciones de correo o URLs de la respuesta. Verifica que cada uno aparece en el perfil del negocio o en los KnowledgeItems. Si el modelo inventó un número de teléfono, el guardrail falla.

Si falla cualquier guardrail, el sistema no descarta la Suggestion — la marca con `confidence_tier = low` y agrega una nota interna en el campo `metadata` del registro describiendo cuál guardrail falló. El dueño verá la Suggestion con indicador de baja confianza y podrá editarla antes de enviar.

### 4.4 Decisión final: qué crear

Con el output validado, el confidence_tier calculado y los guardrails aplicados, el sistema toma la decisión final:

Si `should_respond = false` o `escalation_needed = true`: crear Escalation con el nivel de `escalation_level` y la razón de `escalation_reason`.

Si `had_sufficient_context = false` y el negocio tiene activa una EscalationRule de tipo `missing_info`: crear Escalation informativa con el `detected_intent_label` como contexto para el dueño.

Si `had_sufficient_context = false` y no hay regla de `missing_info` activa: crear Suggestion con `confidence_tier = low` para que el dueño decida.

Si la verificación de guardrails falló: crear Suggestion con `confidence_tier = low` con nota interna.

En cualquier otro caso: crear Suggestion con el `confidence_tier` calculado.

Si el negocio tiene una AutonomyRule activa para el CompetencyTopic detectado y el `confidence_tier` es `high`: crear Suggestion con `status = auto_sent`, enviar el mensaje inmediatamente por WhatsApp, y resolver la Conversation sin pasar por la bandeja del dueño.

### 4.5 Creación de Escalation

El flujo de escalamiento varía según el nivel.

Para nivel **informativo**: crear la Escalation, actualizar `Conversation.status = escalated_informative`. No enviar mensaje al cliente. Generar notificación push agrupada para el dueño (agrupada con otras del mismo tipo en ventana de 15 minutos).

Para nivel **sensible**: crear la Escalation, actualizar la Conversation, enviar al cliente el mensaje de contención: "Estamos revisando tu consulta y te respondemos en breve." Generar notificación push inmediata sin agrupar.

Para nivel **urgente**: crear la Escalation, enviar el mensaje de contención al cliente inmediatamente, generar notificación push inmediata, activar el banner rojo en el home del dueño. Si el dueño no abre la conversación en 5 minutos, enviar WhatsApp al número personal del dueño con el resumen del caso.

En los tres niveles, actualizar `Conversation.priority` en consecuencia y registrar en logs con el trace_id.

---

## Parte 5 — Cómo aprende el agente

El aprendizaje del agente es el diferenciador de valor a largo plazo. Está diseñado para ser gobernado, trazable y reversible.

### 5.1 Aprendizaje desde correcciones del dueño

Cuando el dueño edita o rechaza una Suggestion, está implícitamente diciendo que el agente no tenía el dato correcto o que la respuesta no era adecuada. El sistema captura esa señal en tres pasos.

El primer paso es crear el KnowledgeSource con `type = correction`, guardando el contenido original de la Suggestion y el contenido final que el dueño envió. Esta fuente es el registro permanente de qué pasó y cuándo.

El segundo paso es mostrar al dueño la clasificación de vigencia durante 5 segundos después de enviar su respuesta. Esta es la única interacción donde se le pide al dueño que piense en el aprendizaje del agente. Si el dueño no interactúa con la clasificación, el sistema asume `one_time` y el KnowledgeItem se desactiva inmediatamente — fue una respuesta puntual no generalizable.

El tercer paso, si el dueño elige permanente o temporal, es la abstracción del conocimiento. Aquí entra el modelo fast/cheap.

### 5.2 Abstracción del conocimiento: cómo una corrección se convierte en dato reutilizable

El contenido del KnowledgeItem no es el texto literal de la respuesta del dueño. Si el dueño corrigió "abrimos a las 8, no a las 9", el sistema no guarda "el dueño dijo que abren a las 8." Guarda "horario de apertura: 8:00 AM" con `layer = structured`.

Este proceso de abstracción es crítico. Sin él, la Capa 4 (conocimiento aprendido) se llena de textos de respuesta específicos que solo funcionan en conversaciones muy parecidas a la original. Con la abstracción, el conocimiento se vuelve un dato general que el agente puede usar en cualquier contexto donde ese dato sea relevante.

El backend ejecuta la abstracción así: toma el contenido original de la Suggestion, el contenido corregido por el dueño, y el `detected_intent_label` de esa conversación, y los manda al modelo fast/cheap con este prompt:

```
Dado que un asistente de negocios propuso esta respuesta: "[contenido de la Suggestion]"
Y el dueño del negocio la corrigió con: "[contenido del dueño]"
En el contexto de una consulta sobre: "[detected_intent_label]"

Extrae el dato de negocio específico que el dueño está corrigiendo o agregando.
Exprésalo como un hecho concreto del negocio, no como una respuesta a un cliente.
Determina si pertenece a: structured (dato preciso verificable), operational (regla de comportamiento), narrative (descripción o tono), o learned (respuesta aprendida para este tipo de consulta).

Responde solo con JSON:
{
  "abstracted_content": "[el dato como hecho concreto del negocio]",
  "suggested_layer": "[structured | operational | narrative | learned]",
  "confidence": [0.0 a 1.0 de qué tan claro es el dato extraído]
}
```

Si el modelo devuelve `confidence >= 0.7`, el sistema usa el `abstracted_content` como contenido del KnowledgeItem. Si la confianza es menor a 0.7, el sistema usa el texto literal de la respuesta del dueño sin abstraer, lo marca como `layer = learned`, y lo registra con `confirmed_by_owner = true` para que el dueño pueda refinarlo después desde M3.2.

La capa sugerida por el modelo se valida contra una regla simple: si el dato contiene un número de precio, es siempre `structured`. Si contiene una prohibición o un "nunca", es siempre `operational`. Si el modelo sugiere algo diferente a estas reglas, la regla gana sobre la sugerencia del modelo.

Después de crear el KnowledgeItem, el sistema invalida el caché del contexto del agente para ese negocio. La próxima conversación ya usa el conocimiento actualizado.

### 5.3 Aprendizaje desde instrucciones rápidas

El QuickInstruct es la vía más directa de entrenamiento. El dueño escribe, graba o comparte algo y el agente confirma que lo entendió antes de persistirlo.

El backend recibe la instrucción y ejecuta el mismo proceso de abstracción descrito en 5.2, pero sin la Suggestion original como referencia. El prompt al modelo fast/cheap es más simple: solo recibe el texto de la instrucción del dueño y debe extraer el dato abstracto.

El sistema muestra la confirmación al dueño con dos opciones. Si el dueño confirma, se crea el KnowledgeItem con la clasificación de vigencia elegida. Si el dueño dice que no es correcto, se abre un campo de texto para que aclare, y el proceso se repite incluyendo la aclaración en el prompt de abstracción. Máximo dos intentos de aclaración — si el sistema no puede extraer el dato correctamente en dos intentos, crea el KnowledgeItem con el texto literal marcado como `learned` y `confirmed_by_owner = true`.

Este ciclo de confirmación es el mecanismo principal que previene que el agente aprenda cosas incorrectas por malentendidos del modelo en la extracción.

### 5.4 Aprendizaje implícito por patrones de aprobación

El Job 6 (cron nocturno) evalúa si algún CompetencyTopic muestra un patrón consistente de aprobaciones. Específicamente: si el mismo `detected_intent` dentro de un topic recibió 5 o más aprobaciones sin edición en los últimos 7 días, y todas las Suggestions aprobadas tenían `confidence_basis = direct_knowledge`, el sistema puede generar un KnowledgeItem de Capa 4 automáticamente.

Este KnowledgeItem automático tiene `confirmed_by_owner = false` y aparece en el historial de aprendizaje (M3.3) marcado como "Aprendido automáticamente" con la opción de desactivarlo. Si el dueño lo desactiva, se marca `active = false` y no se vuelve a generar para el mismo pattern hasta que el dueño lo reactive explícitamente. Si el dueño no lo desactiva en 7 días, el sistema lo considera implícitamente aceptado pero mantiene el marcador de origen automático para siempre.

### 5.5 Expiración automática de conocimiento temporal

Un job corre cada hora verificando KnowledgeItems con `validity = temporary` cuyo `valid_until` ya pasó. Los desactiva (`active = false`) e invalida el caché del contexto del agente para el negocio correspondiente.

Si un ítem que expira tenía alta frecuencia de uso en los últimos 7 días (aparece en los `knowledge_items_used` de más de 10 Suggestions recientes), el sistema genera una notificación in-app al dueño al día siguiente sugiriendo que actualice ese dato si sigue siendo relevante.

---

## Parte 6 — Cómo funciona el sistema de notificaciones

### 6.1 Principio central

El costo de atención del dueño es el recurso más escaso del producto. Una push de más puede hacer que el dueño las ignore para siempre. Una push de menos puede hacerle perder un cliente. El sistema de notificaciones está diseñado con tres mecanismos para mantener ese balance.

**Agrupación temporal:** las notificaciones de tipo `suggestion_pending` se agrupan en ventanas de 15 minutos. Si llegan 5 mensajes en 10 minutos, el dueño recibe una sola push: "Tienes 5 conversaciones esperando tu atención." No 5 pushes individuales.

**Prioridad de canal:** las pushes son para operación diaria. El WhatsApp al número personal del dueño es solo para urgencias que no han sido atendidas en 5 minutos y para resúmenes programados. Nunca se duplica el mismo evento en ambos canales.

**Silencio nocturno:** entre las 10 PM y las 7 AM en el timezone del negocio, las notificaciones push se acumulan sin enviarse y se envían en bloque a las 7 AM. La única excepción es el escalamiento urgente, que siempre se envía independientemente del horario.

### 6.2 Generación y evaluación de notificaciones

Cada vez que el pipeline genera una Suggestion o una Escalation, evalúa si debe generar una Notification. La evaluación responde tres preguntas en orden:

¿Se alcanzó el máximo diario de 8 pushes para este dueño hoy? Si sí, no se genera otra push aunque haya actividad. La actividad sigue siendo visible en la app con badges.

¿Cuándo fue la última notificación del mismo tipo? Si fue hace menos de 5 minutos, se acumula sin nueva push para incluirla en la próxima agrupación.

¿Hay una sesión activa del dueño en la app ahora mismo? Si el frontend hizo ping de sesión en los últimos 2 minutos, el sistema actualiza el badge en tiempo real a través de Supabase Realtime sin generar push — el dueño ya está mirando la app.

Si la evaluación determina que sí debe generar push, crea un registro en la tabla `notifications` con `status = pending`. El job de envío de notificaciones procesa esa tabla cada 30 segundos, agrupa las pendientes que apliquen, y las envía a través del proveedor de push configurado.

### 6.3 Resúmenes diarios y semanales

El resumen diario se genera por el cron job que corre a las 7:30 PM en el timezone de cada negocio. El job hace un query agregado: total de conversaciones del día, cuántas resolvió el agente, cuántas con aprobación del dueño, cuántas escaladas, cuántas pendientes al cierre, tiempo estimado ahorrado calculado como el número de conversaciones resueltas por el agente multiplicado por 3 minutos promedio.

Con esos números el sistema rellena la plantilla del mensaje de WhatsApp y lo envía al número personal del dueño. Si no hubo actividad ese día, no se genera resumen — mandar "hoy no pasó nada" es ruido, no valor.

El resumen de primera semana se genera exactamente 7 días después de `Agent.activation_date`. Es más extenso: incluye totales de la semana, los tres temas donde el agente demostró más fortaleza (mayor approval_rate), los temas con más escalamientos o correcciones, y una recomendación concreta de qué actualizar primero para mejorar al agente.

---

## Parte 7 — Jobs programados del sistema

El backend tiene seis jobs recurrentes. Todos corren como Supabase cron jobs usando pg_cron. Ninguno depende del frontend para ejecutarse.

**Job 1 — Procesamiento de webhooks pendientes:** cada 2 minutos. Revisa la tabla `webhook_queue` y reprocesa los payloads que no se procesaron en el intento original. Descarta payloads con más de 30 minutos de antigüedad — el mensaje ya es irrelevante para el cliente.

**Job 2 — Expiración de KnowledgeItems temporales:** cada hora. Desactiva los KnowledgeItems cuyo `valid_until` ya pasó. Invalida los cachés de contexto de los negocios afectados. Genera notificación in-app si el ítem tenía alta frecuencia de uso.

**Job 3 — Expiración de Suggestions:** cada 10 minutos. Revisa Suggestions con `status = pending` que llevan más de 30 minutos sin respuesta del dueño durante el horario de atención del negocio. Las marca como `expired` y envía el mensaje de espera al cliente si no se ha enviado ya.

**Job 4 — Resúmenes diarios:** cada día a las 7:30 PM por timezone de negocio. Genera y envía el DailySummary para todos los negocios con actividad ese día.

**Job 5 — Verificación de salud de conexiones WhatsApp:** cada 6 horas. Para todos los negocios con `whatsapp_status = connected`, hace un GET ligero a la API de Meta verificando que el token sigue siendo válido. Si recibe error 401, dispara el evento `whatsapp_disconnected`.

**Job 6 — Cálculo de métricas y evaluación de autonomía:** cada noche a las 2 AM. Recalcula `approval_rate_7d`, `escalation_rate_7d` e `incident_count_7d` para todos los CompetencyTopics activos. Evalúa cuáles topics cumplen los tres criterios de activación de autonomía y genera las sugerencias de autonomía correspondientes para el dueño. Procesa el aprendizaje implícito de patrones de aprobación.

---

## Parte 8 — Mapa de Edge Functions

El backend completo del MVP vive en Supabase Edge Functions. Estas son todas las funciones necesarias, cada una con responsabilidad única.

**`whatsapp-webhook`** — recibe y verifica todos los eventos de Meta. Responde 200 inmediatamente. Genera el trace_id. Invoca `process-message` de forma asíncrona. Es la única función expuesta públicamente en internet.

**`process-message`** — el pipeline completo de un mensaje entrante: identificación de contexto, filtros determinísticos, construcción del prompt, llamada al modelo de clasificación, llamada al LLM principal, evaluación del output, guardrails, creación de Suggestion o Escalation, envío de notificación. Solo la invocan `whatsapp-webhook` y el job de reintento de `webhook_queue`.

**`whatsapp-connect`** — maneja el Embedded Signup: intercambio del code por token, registro del número en Meta, suscripción del webhook, persistencia en Business. Solo se invoca desde el frontend durante el onboarding o la reconexión.

**`send-message`** — envía un mensaje de texto al cliente por WhatsApp API. Recibe el `conversation_id` y el `content`. Maneja reintentos con backoff. Actualiza el `Message.status`. La invocan tanto `process-message` (mensajes de contención automáticos) como las acciones del dueño en el frontend.

**`approve-suggestion`** — procesa la aprobación de una Suggestion: actualiza el registro a `approved`, invoca `send-message` con el contenido original, actualiza la Conversation a `resolved`, actualiza las métricas del CompetencyTopic afectado.

**`edit-and-send-suggestion`** — procesa la edición de una Suggestion: recibe el contenido editado, actualiza el registro a `edited`, invoca `send-message` con el contenido nuevo, crea el KnowledgeSource de corrección, prepara los datos para la clasificación de vigencia.

**`reject-suggestion`** — procesa el rechazo: marca la Suggestion como `rejected`, recibe el contenido alternativo del dueño, invoca `send-message`, crea el KnowledgeSource de corrección, prepara los datos para la clasificación de vigencia.

**`classify-correction`** — procesa la clasificación de vigencia después de una edición o rechazo: invoca el proceso de abstracción con el modelo fast/cheap, crea el KnowledgeItem con la vigencia elegida, invalida el caché del agente.

**`process-quick-instruct`** — recibe la instrucción del dueño (texto, audio transcrito o link extraído), invoca el proceso de abstracción, devuelve la confirmación generada al frontend para que el dueño la valide.

**`confirm-instruction`** — recibe la confirmación del dueño sobre la interpretación del agente: crea el KnowledgeItem definitivo con la vigencia elegida, invalida el caché del agente.

**`build-agent-context`** — construye o reconstruye el contexto cacheado de un negocio. Genera el texto formateado de los Bloques 1 al 4 y lo persiste en `agent_context_cache`. La invocan `process-message` cuando el caché está vencido y cualquier operación que cree o modifique KnowledgeItems.

**`generate-daily-summary`** — genera el DailySummary de un negocio para una fecha específica. Ejecuta el query agregado, construye el mensaje de WhatsApp usando la plantilla, lo envía al número personal del dueño. La invoca el cron job de resúmenes.

**`send-notification`** — envía una notificación push o WhatsApp al dueño según el tipo. Recibe el `notification_id` y ejecuta el envío. Actualiza el `Notification.status`. La invoca el job de procesamiento de notificaciones pendientes.

---

## Parte 9 — Reglas que el backend nunca rompe

Estas son las invariantes del sistema. No importa qué escenario, qué edge case o qué instrucción llegue del frontend.

Un mensaje del cliente nunca queda sin respuesta de ningún tipo. Si el agente no puede responder, escala. Si escala y el dueño no atiende en el tiempo configurado, envía mensaje de contención al cliente. El cliente siempre sabe que el negocio está al tanto.

El conocimiento del agente nunca se actualiza sin una fuente trazable. Cada KnowledgeItem tiene un KnowledgeSource. No existe un KnowledgeItem sin origen conocido y timestamp.

Un KnowledgeItem de Capa 1 o Capa 2 nunca puede ser sobrescrito por aprendizaje implícito ni por abstracción automática. Solo el dueño puede cambiar datos estructurados y reglas operativas, con confirmación explícita.

El caché del contexto del agente siempre se invalida antes de que se procese la siguiente conversación después de un cambio de conocimiento. No puede existir una Suggestion generada con datos obsoletos si el dueño acaba de actualizar algo.

Las credenciales de Meta nunca salen del backend. El frontend nunca ve el access_token del negocio, el App Secret, ni el webhook verify token.

El sistema nunca envía más de una notificación por el mismo evento al mismo dueño en el mismo canal. Si ya se envió push por una Suggestion, no se envía WhatsApp por la misma Suggestion aunque pase el tiempo de espera.

El proceso de abstracción nunca crea KnowledgeItems de Capa 1 o Capa 2 de forma autónoma. La capa asignada siempre se valida contra las reglas determinísticas de capa antes de persistir. El modelo fast/cheap sugiere, el sistema decide.

---

*AGENTI — Backend Logic Overview v2.0*
