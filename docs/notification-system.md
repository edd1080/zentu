# AGENTI — Entregable 4 v1.0
## Sistema de notificaciones y comunicación proactiva

**Versión:** 1.0
**Estado:** Oficial
**Alcance:** Diseño completo del sistema de notificaciones de Agenti. Cubre canales, taxonomía, frecuencia, agrupación, prioridad, copy, estados y reglas de comportamiento. Este sistema es la interfaz principal del dueño con el producto cuando no tiene la app abierta.

---

## Por qué este sistema es crítico

El dueño de una PYME en Guatemala no vive en la app de Agenti. Vive en su negocio, atendiendo clientes, cortando cabello, revisando pacientes o cocinando. La app es un destino al que va cuando algo lo llama. Lo que lo llama son las notificaciones.

Si el sistema de notificaciones falla en cualquiera de estas tres dimensiones, el producto falla:

**Frecuencia incorrecta:** demasiadas notificaciones y el dueño las silencia o desinstala la app. Muy pocas y el dueño pierde el hábito de usar el producto y siente que no pasa nada.

**Contenido irrelevante:** notificaciones que no requieren acción o que no tienen contexto suficiente para actuar son ruido. El dueño aprende a ignorarlas.

**Canal equivocado:** una notificación urgente que llega solo dentro de la app cuando el dueño no la tiene abierta es una notificación que no existe. El canal tiene que coincidir con la urgencia.

Este sistema resuelve esas tres dimensiones de forma explícita y con reglas claras.

---

## Los dos canales del sistema

Agenti opera con dos canales de comunicación hacia el dueño. Cada uno tiene un propósito diferente y no son intercambiables.

**Canal A — Notificaciones push / in-app**
Para eventos que ocurren mientras el dueño puede tener la app en segundo plano. Inmediatas, cortas, accionables. El dueño abre la app y actúa.

**Canal B — WhatsApp personal del dueño**
Para resúmenes, reportes y escalamientos urgentes que no pueden depender de que el dueño tenga la app instalada o activa. Es el canal de mayor confianza de apertura en el segmento objetivo. Se usa con criterio quirúrgico: si se abusa de este canal, el dueño lo asocia con spam y el contrato de confianza se rompe.

La regla de uso entre canales es esta: **las acciones cotidianas van por push. Lo urgente y lo estratégico van por WhatsApp.**

---

## Taxonomía de notificaciones

Todas las notificaciones del sistema pertenecen a una de cinco categorías. Cada categoría tiene canal, frecuencia, agrupación y comportamiento definidos.

---

### Categoría 1 — Acción requerida (push)

Son notificaciones que piden al dueño hacer algo ahora o pronto. Son el tipo más frecuente y el más sensible al volumen.

**N1.1 — Sugerencia pendiente de aprobación**

Trigger: el agente generó una sugerencia de respuesta y está esperando aprobación del dueño.

Canal: push.

Agrupación: esta es la regla de agrupación más importante del sistema. Si hay una sugerencia, se notifica individualmente. Si hay entre 2 y 4 sugerencias acumuladas en menos de 10 minutos, se agrupan en una sola notificación: "Hay 3 respuestas esperando tu aprobación." Si hay 5 o más sugerencias acumuladas, se notifica una sola vez con el total, independientemente del tiempo: "Tu agente preparó 8 respuestas. Apruébalas cuando puedas."

Frecuencia máxima: una notificación individual o agrupada cada 10 minutos. Si el dueño ya tiene la app abierta, no se envía push, la sugerencia aparece directamente en el componente de M2.4.

Copy individual: "[Nombre del cliente]: [primeras palabras del mensaje del cliente]"
Copy agrupado: "Hay [N] respuestas esperando tu aprobación"

Comportamiento al tocar: abre directamente la conversación con la sugerencia si es individual. Abre la bandeja filtrada por "Por aprobar" si es agrupada.

**N1.2 — Escalamiento informativo**

Trigger: el agente no tiene un dato específico y necesita que el dueño responda o agregue la información.

Canal: push.

Agrupación: si hay múltiples escalamientos informativos en menos de 15 minutos, se agrupan: "Tu agente necesita información sobre [N] consultas."

Frecuencia máxima: agrupados cada 15 minutos.

Copy individual: "Tu agente no sabe: [descripción breve de lo que preguntó el cliente]"
Copy agrupado: "Tu agente necesita tu ayuda con [N] consultas"

Comportamiento al tocar: abre la conversación específica con el banner de escalamiento informativo.

**N1.3 — Escalamiento sensible**

Trigger: el agente detectó queja, negociación especial o situación que requiere criterio humano.

Canal: push con prioridad media-alta. No se agrupa con otros tipos.

Agrupación: solo se agrupa con otros escalamientos sensibles si ocurren en menos de 5 minutos: "Hay [N] situaciones que necesitan tu criterio."

Frecuencia: inmediata al detectarse.

Copy individual: "Un cliente necesita tu atención: [primera línea del mensaje del cliente]"
Copy agrupado: "[N] situaciones necesitan tu criterio"

Comportamiento al tocar: abre la conversación con el banner de contexto del agente y las opciones de respuesta pre-redactadas.

---

### Categoría 2 — Urgente (push + WhatsApp)

Son notificaciones que no pueden esperar. Usan ambos canales en secuencia.

**N2.1 — Escalamiento urgente**

Trigger: el agente detectó emergencia, tema de salud, situación legal o amenaza reputacional severa.

Canal: push inmediato + WhatsApp al número personal del dueño si no abre la app en 5 minutos.

Agrupación: nunca se agrupa. Cada escalamiento urgente es una notificación individual.

Secuencia de envío:
- T+0: notificación push con sonido de alta prioridad (distinto al sonido normal).
- T+5 min sin apertura de app: mensaje de WhatsApp al número personal.
- T+15 min sin respuesta en la conversación: segundo mensaje de WhatsApp.
- T+30 min sin respuesta: tercer mensaje de WhatsApp con texto de mayor urgencia.

Copy push: "URGENTE — [Nombre del negocio]: Un cliente necesita atención inmediata"
Copy WhatsApp T+5: "Hola, hay una situación urgente en tu negocio. Un cliente necesita tu atención ahora. Abre Agenti para ver qué pasó: [link directo]"
Copy WhatsApp T+15: "Tu agente lleva 15 minutos esperando tu respuesta para una situación urgente. [link directo]"
Copy WhatsApp T+30: "Han pasado 30 minutos desde que se detectó una situación urgente en [nombre del negocio]. Por favor atiéndela lo antes posible. [link directo]"

Comportamiento al tocar: abre directamente la conversación urgente con el banner rojo activo.

**N2.2 — Canal de WhatsApp desconectado**

Trigger: el número de WhatsApp del negocio pierde conexión con Meta Cloud API. El agente deja de recibir mensajes.

Canal: push inmediato + WhatsApp al número personal si no hay acción en 15 minutos.

Esto es urgente porque cada minuto sin conexión es un mensaje de cliente que no llega al agente.

Copy push: "Tu WhatsApp se desconectó. Tu agente no puede recibir mensajes."
Copy WhatsApp: "El WhatsApp de tu negocio se desconectó de Agenti. Tu agente no está recibiendo mensajes. Reconéctalo aquí: [link directo]"

---

### Categoría 3 — Resúmenes y reportes (WhatsApp)

Son comunicaciones proactivas de Agenti hacia el dueño para mantenerlo informado del desempeño sin que tenga que abrir la app. Usan exclusivamente WhatsApp porque tienen mayor probabilidad de ser leídos ahí que como notificaciones push.

**N3.1 — Resumen diario**

Trigger: hora configurable por el dueño. Default: 8 PM.

Canal: WhatsApp exclusivamente.

Frecuencia: una vez al día. Si el dueño no tuvo actividad ese día, el resumen no se envía para no generar ruido vacío.

Estructura del mensaje (máximo 5 líneas de texto, sin tecnicismos):

```
📊 *Resumen de hoy — [Nombre del negocio]*

Tu agente atendió [N] conversaciones
✅ Resolvió solo: [N]
👆 Aprobaste tú: [N]
⚠️ Escaló: [N]
⏳ Pendientes: [N]

Tiempo ahorrado aprox: [X] minutos
Tu agente conoce el [X]% de tu negocio

[Si hay pendientes]: Tienes [N] conversaciones esperando. Ver ahora: [link]
[Si hay temas débiles]: Tu agente necesita más info sobre [tema]. Entrenarlo: [link]
```

El mensaje usa formato de WhatsApp (negritas con asteriscos) para ser legible sin abrir la app completa.

Si ese día no hubo actividad: no se envía el resumen.
Si el dueño tiene todo al día y el agente está en verde: el mensaje es más corto: "Todo en orden. Tu agente atendió [N] conversaciones hoy sin necesitar tu ayuda."

**N3.2 — Resumen semanal**

Trigger: domingo a las 8 PM o el día que el dueño configure como fin de semana de trabajo.

Canal: WhatsApp exclusivamente.

Frecuencia: una vez a la semana.

Estructura del mensaje:

```
📅 *Tu semana con Agenti — [Nombre del negocio]*

Esta semana tu agente atendió [N] conversaciones
🤖 Resolvió solo: [N] ([X]%)
✅ Con tu aprobación: [N]
⚠️ Escaló: [N]
⏱ Tiempo ahorrado aprox: [X] horas

*Lo que aprendió esta semana:*
• [Instrucción o corrección reciente 1]
• [Instrucción o corrección reciente 2]

*Donde aún necesita ayuda:*
• [Tema débil 1] — Entrenarlo: [link]
• [Tema débil 2] — Entrenarlo: [link]

Semana anterior: [N] conversaciones | Esta semana: [N] conversaciones
```

**N3.3 — Resumen de primera semana**

Trigger: exactamente 7 días después de la activación del agente. Una sola vez.

Canal: WhatsApp exclusivamente.

Este es el resumen más importante del ciclo de vida temprano. Es el momento donde el dueño cuantifica el valor por primera vez y decide si el producto vale la pena. Su estructura es diferente a los resúmenes regulares porque su objetivo es demostrar valor, no solo informar.

```
🎉 *¡Tu primera semana con Agenti!*

[Nombre del agente o del negocio] lleva 7 días trabajando por ti.

En esta primera semana:
✅ Atendió [N] conversaciones de tus clientes
⏱ Te ahorró aproximadamente [X] horas de respuestas manuales
🧠 Aprendió [N] cosas nuevas sobre tu negocio

Tu agente ya domina: [lista de 2-3 temas en verde]
Todavía necesita ayuda con: [lista de 1-2 temas en rojo]

[Si la conversión fue alta]: Está listo para responder solo en algunos temas. ¿Quieres activar autonomía?: [link]
[Si la conversión fue baja]: Entrénalo en [tema débil] para mejorar: [link]
```

---

### Categoría 4 — Entrenamiento proactivo (push + WhatsApp alternado)

Son notificaciones que el sistema genera cuando detecta oportunidades de mejorar al agente. Son proactivas, no reactivas.

**N4.1 — Pregunta repetida sin respuesta**

Trigger: el mismo tipo de pregunta se escaló 3 o más veces en los últimos 7 días sin que el dueño haya agregado esa información al agente.

Canal: push.

Frecuencia: máximo una vez por semana por tema. No se acumulan múltiples notificaciones de entrenamiento el mismo día.

Copy: "[N] clientes preguntaron esta semana por [tema]. Tu agente no tiene esa info. ¿Se la damos?"

Comportamiento al tocar: abre M3.1 pre-configurado para ese tema específico.

**N4.2 — Tema en rojo con alto impacto**

Trigger: un tema específico del mapa de competencias está en rojo y representa más del 20% de los escalamientos de la semana.

Canal: push entre semana, WhatsApp si es el resumen del domingo.

Copy push: "Tu agente escaló [N] veces esta semana porque no sabe sobre [tema]. ¿Lo entrenamos?"

**N4.3 — Sugerencia de activación de autonomía**

Trigger: el agente lleva 7 días consecutivos con más del 85% de sugerencias aprobadas sin edición en un tema específico, y ese tema tiene todos los indicadores de evidencia en verde.

Canal: push.

Frecuencia: máximo una vez cada 14 días para no presionar al dueño.

Copy: "Tu agente lleva [N] respuestas sobre [tema] sin ninguna corrección. ¿Quieres que responda solo?"

Comportamiento al tocar: abre directamente el modal de activación de autonomía para ese tema (M4.3).

---

### Categoría 5 — Sistema y cuenta (push)

Son notificaciones sobre el estado técnico o administrativo del producto.

**N5.1 — Onboarding incompleto**

Trigger: el dueño abandonó el onboarding antes de completar un paso crítico (M1.3 al 60% o menos, o M1.5 omitido por más de 48 horas).

Canal: push (primeras 24 horas) + WhatsApp (si no hay acción después de 24 horas).

Frecuencia: máximo 3 recordatorios: a las 2 horas, a las 24 horas y a las 72 horas del abandono.

Copy push 2h: "Tu agente casi está listo. Te falta [paso específico] para activarlo."
Copy WhatsApp 24h: "Hola, tu agente de Agenti está casi listo pero le falta [paso]. Termina la configuración aquí: [link directo al paso pendiente]"
Copy WhatsApp 72h: "Tu agente te está esperando. Solo toma [X minutos] más completar la configuración: [link]"

**N5.2 — Token o acceso próximo a expirar**

Trigger: el token de acceso de Meta Cloud API tiene menos de 7 días para expirar.

Canal: push + WhatsApp.

Copy push: "La conexión de WhatsApp de tu negocio necesita renovarse en [N] días."
Copy WhatsApp: "Hola, la conexión de WhatsApp de tu negocio [nombre] vence en [N] días. Renuévala aquí para que tu agente siga funcionando: [link]"

**N5.3 — Límite de plan próximo**

Trigger: el negocio está al 80% del límite de conversaciones de su plan.

Canal: push.

Copy: "Tu agente atendió [N] conversaciones este mes ([X]% de tu plan). ¿Quieres ajustar tu plan?"

**N5.4 — Nueva función disponible**

Trigger: se lanza una feature nueva relevante para ese usuario específico (por ejemplo, autonomía disponible para usuarios que llevan 30+ días en modo colaborador).

Canal: push. Máximo una vez por feature nueva.

Copy: "Nueva función disponible: [nombre de la función en lenguaje del dueño]."

Regla de contenido: las notificaciones de tipo N5.4 nunca usan jerga técnica. "Ahora puedes darle más autonomía a tu agente en temas específicos" es correcto. "Nueva configuración de nivel de confianza por intent disponible" no lo es.

---

## Reglas globales del sistema

Estas reglas aplican a todas las categorías y no tienen excepciones.

**Regla 1 — Límite diario de push**
El sistema no envía más de 8 notificaciones push por día al mismo dueño. Si se alcanza ese límite, las notificaciones de categorías 4 y 5 se suprimen para ese día. Las de categorías 1 y 2 siempre pasan independientemente del límite.

**Regla 2 — Ventana de silencio nocturno**
No se envían notificaciones push entre las 10 PM y las 7 AM hora local del dueño, excepto N2.1 (escalamiento urgente). Las notificaciones que se generan durante esa ventana se entregan a las 7 AM agrupadas.

**Regla 3 — Respeto a la app abierta**
Si el dueño tiene la app abierta y activa, no se envían notificaciones push. Los eventos se muestran directamente en la interfaz (badge en la tab de Conversaciones, actualización del home).

**Regla 4 — WhatsApp con criterio**
El canal de WhatsApp personal del dueño se usa exclusivamente para: escalamientos urgentes (N2.1), desconexión del canal (N2.2), resúmenes diarios y semanales (N3.1, N3.2, N3.3), y recordatorios de onboarding incompleto (N5.1, segundo y tercer contacto). Nada más usa ese canal.

**Regla 5 — Sin duplicación de canales**
Una misma notificación no se envía por push Y por WhatsApp al mismo tiempo excepto cuando la secuencia temporal lo define explícitamente (como en N2.1). Duplicar canales simultáneamente genera sensación de spam.

**Regla 6 — Agrupación antes que volumen**
Siempre es preferible agrupar múltiples eventos del mismo tipo en una sola notificación que enviar varias notificaciones individuales. El sistema espera ventanas de tiempo definidas por tipo antes de enviar para poder agrupar.

**Regla 7 — Accionabilidad como requisito**
Toda notificación debe tener una acción clara que el dueño puede tomar al tocarla. Una notificación que no lleva a ninguna acción concreta no debe enviarse. No se envían notificaciones informativas sin destino.

**Regla 8 — Configurabilidad del dueño**
El dueño puede configurar desde M4.5: el horario del resumen diario, la hora de inicio y fin de la ventana de silencio, y si quiere recibir las sugerencias de entrenamiento (N4.x) por push o solo en la app. No puede desactivar los escalamientos urgentes ni los resúmenes de primera semana.

---

## Configuración de notificaciones del dueño (M4.5)

La pantalla de configuración de notificaciones debe sentirse simple. No es un panel técnico con 20 toggles. Es un formulario de preferencias en lenguaje humano.

**Sección 1 — Mis avisos diarios**
"¿A qué hora quieres recibir el resumen del día por WhatsApp?" Selector de hora. Default: 8 PM.

**Sección 2 — Mis horas de descanso**
"¿Desde qué hora no quieres que te interrumpamos?" Selector de hora inicio. Default: 10 PM.
"¿Y a partir de qué hora sí?" Selector de hora fin. Default: 7 AM.
Nota: "Las situaciones urgentes pueden avisarte fuera de ese horario."

**Sección 3 — Sugerencias de entrenamiento**
Toggle: "Avisarme cuando mi agente necesite aprender algo nuevo." Default: activado.

**Sección 4 — Vista previa del resumen**
Botón de texto: "Ver cómo se ve mi resumen diario." Muestra un ejemplo real del resumen del último día disponible. Esto reduce la ansiedad de algunos dueños sobre qué información se les envía.

---

## Copy de notificaciones: principios de redacción

Todo el copy de notificaciones del sistema debe seguir estos cinco principios. Son tan importantes como la lógica técnica.

**Principio 1 — Siempre desde la perspectiva del negocio del dueño, no del sistema.**
Correcto: "Un cliente preguntó sobre tus precios y tu agente no tenía la respuesta."
Incorrecto: "Se generó un escalamiento de tipo informativo para el negocio ID-4821."

**Principio 2 — Cantidad específica, no vaga.**
Correcto: "Tu agente atendió 23 conversaciones hoy."
Incorrecto: "Tu agente atendió varias conversaciones hoy."

**Principio 3 — Acción clara al final cuando aplica.**
Correcto: "Tu agente escaló 4 veces esta semana porque no sabe sobre precios. ¿Lo entrenamos?"
Incorrecto: "Hay temas en los que tu agente puede mejorar."

**Principio 4 — Cero jerga técnica.**
Prohibido en notificaciones: API, webhook, token, escalamiento, intent, modelo, inferencia, configurar, desplegar, integrar.

**Principio 5 — Tono humano y directo, no corporativo.**
Correcto: "Tu agente casi está listo. Te falta conectar tu WhatsApp."
Incorrecto: "Complete el proceso de integración del canal de mensajería para habilitar las funciones del asistente virtual."

---

## Tabla resumen del sistema

| ID | Nombre | Canal | Agrupación | Ventana | Urgencia |
|---|---|---|---|---|---|
| N1.1 | Sugerencia pendiente | Push | Cada 10 min | No nocturnas | Normal |
| N1.2 | Escalamiento informativo | Push | Cada 15 min | No nocturnas | Normal |
| N1.3 | Escalamiento sensible | Push | Solo mismo tipo, 5 min | No nocturnas | Media-alta |
| N2.1 | Escalamiento urgente | Push + WhatsApp | Nunca | Siempre | Máxima |
| N2.2 | Canal desconectado | Push + WhatsApp | Nunca | Siempre | Alta |
| N3.1 | Resumen diario | WhatsApp | N/A | 8 PM (configurable) | Baja |
| N3.2 | Resumen semanal | WhatsApp | N/A | Domingo 8 PM | Baja |
| N3.3 | Resumen primera semana | WhatsApp | N/A | Día 7 post-activación | Baja |
| N4.1 | Pregunta repetida sin respuesta | Push | 1 por tema por semana | No nocturnas | Baja |
| N4.2 | Tema en rojo de alto impacto | Push o WhatsApp | 1 por semana | No nocturnas | Baja |
| N4.3 | Sugerencia de autonomía | Push | Cada 14 días | No nocturnas | Baja |
| N5.1 | Onboarding incompleto | Push + WhatsApp | 3 contactos máx | No nocturnas | Media |
| N5.2 | Token próximo a expirar | Push + WhatsApp | Una vez | No nocturnas | Media |
| N5.3 | Límite de plan próximo | Push | Una vez al 80% | No nocturnas | Baja |
| N5.4 | Nueva función disponible | Push | Una vez por feature | No nocturnas | Baja |

---

## Dependencias con otros módulos

El sistema de notificaciones depende de que los siguientes módulos existan y funcionen correctamente antes de que las notificaciones sean útiles.

M2.4 (Modo colaborador) genera todos los eventos de N1.1. Sin sugerencias del agente no hay nada que notificar.

M2.5 (Escalamiento) genera todos los eventos de N1.2, N1.3 y N2.1. La calidad de la clasificación del escalamiento determina directamente si las notificaciones se sienten relevantes o como ruido.

M3.2 (Estado del agente) genera los datos que alimentan N4.1, N4.2 y la sección de temas débiles de los resúmenes N3.x.

M4.3 (Autonomía) genera los eventos de N4.3. La lógica de detección de los indicadores de evidencia debe ser la misma que alimenta la sugerencia proactiva de autonomía.

M5.1 y M5.2 (Inteligencia) comparten datos con N3.x. Los resúmenes de WhatsApp son versiones comprimidas de lo que vive en la sección de inteligencia de la app.

**Dependencia crítica de implementación:** el sistema de notificaciones no debe construirse antes de que el motor de escalamiento (M2.5) funcione correctamente. Notificaciones de escalamiento incorrectas o ruidosas destruyen la confianza del dueño en el producto más rápido que cualquier otro fallo.

---

## Lo que este sistema no incluye intencionalmente

**Notificaciones de marketing o growth.** Agenti no usa el canal de notificaciones push ni el WhatsApp del dueño para promocionar upgrades de plan, referir a otros negocios o enviar comunicaciones comerciales. El canal de comunicación con el dueño es para operación, no para ventas. El funnel de upgrade vive dentro de la app, no en notificaciones.

**Notificaciones al cliente final.** Este sistema cubre exclusivamente la comunicación de Agenti hacia el dueño del negocio. La comunicación hacia los clientes del negocio es parte del sistema de mensajería de WhatsApp y vive en la especificación técnica de integración con Meta Cloud API.

**Email.** El MVP no usa email como canal de notificación operativa. El correo electrónico se usa únicamente para verificación de cuenta (M1.1) y para comunicaciones administrativas de facturación. El dueño vive en WhatsApp, no en su bandeja de entrada.

---

*AGENTI — Entregable 4 v1.0 — Sistema de notificaciones y comunicación proactiva*
