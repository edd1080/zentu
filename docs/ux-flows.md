# AGENTI — Entregable 3 v2.0
## Flujos de experiencia del producto core

**Versión:** 2.0
**Estado:** Oficial
**Cambios respecto a v1.0:** Adición del principio de construcción prioritaria de M1.6 (Prueba del agente) como decisión de producto formalizada.

---

## Nota de diseño

Cada flujo en este documento sigue el mismo formato: narrativa completa del flujo, estados del sistema, edge cases con resolución, y decisiones de diseño que el agente de desarrollo debe respetar. El objetivo no es describir pantallas, sino definir el comportamiento del sistema desde la perspectiva del dueño del negocio.

---

## Principio de construcción prioritaria [NUEVO en v2.0]

**M1.6 — Prueba del agente es la pantalla más importante del MVP. No la más compleja, sino la más sensible.**

Todo el onboarding existe para llegar a ese momento. Si la prueba impresiona, el usuario cree en el producto y activa. Si no impresiona, el onboarding previo pierde gran parte de su valor sin importar qué tan bien estuvo diseñado.

Esto tiene consecuencias concretas de construcción:

M1.6 no es el último módulo en construirse. Es el primero que se pule. Debe ser el componente más testeado antes de los pilotos, no el que se "mejora después." Cualquier decisión de scope que implique recortar calidad en M1.6 para avanzar más rápido en otros módulos es una decisión incorrecta. El equipo de desarrollo debe tener esta prioridad explícita desde el inicio.

La calidad de M1.6 depende directamente de la calidad de las plantillas de industria. Un agente que llega a la prueba con plantilla débil va a dar una prueba débil. Las plantillas no son contenido posterior, son infraestructura de conversión del producto.

---

# FLUJO 1: Home / Command Center (M2.1)

## Narrativa del flujo

El dueño abre la app. Lo primero que ve no es una dashboard de métricas ni un menú de navegación. Ve el estado actual de su negocio en tres segundos.

La parte superior muestra una línea de estado del agente. Si todo está bien: "Tu agente está activo. Atendió 14 conversaciones hoy." Con un punto verde pulsante que indica vida. Si hay algo que requiere atención: "Tu agente necesita tu ayuda. Hay 3 conversaciones pendientes." Con indicador amarillo. Si hay un escalamiento urgente activo: el banner de urgencia reemplaza completamente la zona superior con fondo rojo suave y texto directo.

Inmediatamente debajo, el componente de instrucción rápida. Campo de texto con placeholder que rota entre ejemplos reales: "Dile algo nuevo a tu agente...", "Ej: Hoy no tenemos el menú del día", "Ej: Esta semana hay 20% de descuento", "Ej: Los sábados cerramos a las 3". A la derecha del campo, dos íconos: micrófono para nota de voz y clip para adjuntar imagen o link. El componente tiene el mismo peso visual que el campo de mensaje de WhatsApp. No es secundario.

Debajo del componente de instrucción, la bandeja resumida. Máximo cinco conversaciones que requieren acción, ordenadas por prioridad. Cada ítem muestra el nombre del cliente, el último mensaje truncado a dos líneas, el tipo de acción requerida (aprobar sugerencia, escalamiento sensible, escalamiento urgente) y el tiempo transcurrido. Al final de la lista, un botón de texto simple: "Ver todas las conversaciones."

Si no hay conversaciones pendientes, la bandeja muestra un estado vacío positivo: "Tu agente está al día. No hay conversaciones pendientes." Con una línea secundaria que muestra el total de conversaciones resueltas hoy.

## Estados del sistema

**Estado 1 — Agente activo sin pendientes:** punto verde, resumen positivo de actividad del día, bandeja vacía con mensaje de confirmación, componente de instrucción disponible.

**Estado 2 — Agente activo con pendientes:** punto verde, contador de pendientes en el header, bandeja con conversaciones ordenadas por prioridad, la primera conversación de la lista tiene un botón de acción directa visible sin tener que entrar a ella.

**Estado 3 — Escalamiento urgente activo:** banner de urgencia en la zona superior reemplaza el estado normal, color rojo suave, texto directo con el nombre del cliente y el tipo de urgencia, botón de "Atender ahora" que lleva directamente a esa conversación. El componente de instrucción y la bandeja regular siguen visibles debajo, pero el banner no desaparece hasta que el dueño atienda el escalamiento.

**Estado 4 — Agente con conocimiento bajo:** indicador amarillo en la zona superior, mensaje: "Tu agente no tiene suficiente información para responder bien. Hay 3 temas sin cubrir." Con botón directo a M3.2 para ver qué falta.

**Estado 5 — Agente desconectado:** indicador rojo, mensaje claro de qué pasó y cómo resolverlo. Si el problema es de conexión con WhatsApp, botón directo a M4.4. Si es un problema técnico, mensaje de soporte con estimado de resolución.

**Estado 6 — Primera vez (post-onboarding):** el home se muestra con una capa de bienvenida que presenta los tres elementos. Un punto de onboarding contextual explica el componente de instrucción y la bandeja. Desaparece después de la primera interacción o después de 24 horas.

## Edge cases

**El dueño abre la app y hay 40 conversaciones pendientes acumuladas:** no se muestran todas en el home. Se muestran las 5 más urgentes con un contador total: "Y 35 más." El sistema ya procesó y agrupó las de baja complejidad para aprobación masiva. El banner superior indica: "Hay conversaciones acumuladas. Tu agente preparó sugerencias para las preguntas frecuentes. Puedes aprobarlas en bloque."

**El dueño toca el componente de instrucción y lo deja vacío:** el campo simplemente se contrae. Sin error, sin mensaje. No es una acción requerida.

**Conexión intermitente:** el home carga con el último estado conocido y muestra un indicador sutil de "Actualizando..." sin bloquear la interfaz. Los datos se actualizan cuando la conexión se recupera.

---

# FLUJO 2: Bandeja de conversaciones (M2.2)

## Narrativa del flujo

El dueño toca "Ver todas" desde el home o navega a la bandeja desde el menú. Ve el universo completo de conversaciones de su negocio.

La pantalla tiene tres secciones con separación visual clara. La primera sección se llama "Necesitan tu atención" y agrupa conversaciones que requieren acción del dueño: escalamientos no resueltos y conversaciones con sugerencias pendientes de aprobación. Esta sección aparece primero y ocupa el espacio que necesita según cuántas hay. Si está vacía, no ocupa espacio, solo muestra una línea de separación hacia la sección siguiente.

La segunda sección se llama "Atendidas" y muestra conversaciones que el agente resolvió solo o que el dueño ya aprobó. Orden cronológico inverso. El dueño puede ver estas conversaciones para auditarlas pero no requieren acción.

La tercera sección se llama "Archivadas" y contiene conversaciones cerradas. Colapsada por defecto. El dueño puede expandirla si necesita buscar algo en el historial.

Cada ítem de conversación en la primera sección tiene una estructura clara: foto de perfil o inicial del nombre del cliente, nombre del cliente (o número si no hay nombre), último mensaje truncado, etiqueta de tipo de acción requerida con color (amarillo para aprobación pendiente, naranja para escalamiento sensible, rojo para escalamiento urgente), y tiempo desde el último mensaje. Los ítems de la primera sección tienen una línea de acción rápida debajo del mensaje: si hay sugerencia pendiente, aparece el botón "Aprobar" directamente en el ítem de la lista, para conversaciones simples sin necesidad de entrar al detalle.

En la parte superior de la pantalla, una barra de búsqueda y filtros simples: Todas, Por aprobar, Escaladas, Resueltas.

## Estados del sistema

**Estado 1 — Bandeja con pendientes:** sección "Necesitan tu atención" visible y expandida, ítems ordenados por prioridad (urgentes primero, sensibles después, aprobaciones simples al final).

**Estado 2 — Bandeja al día:** sección "Necesitan tu atención" vacía o colapsada, sección "Atendidas" visible con actividad del día.

**Estado 3 — Bandeja vacía total (primer día):** pantalla de estado vacío positivo. "Tu agente está listo y esperando. Cuando lleguen mensajes de tus clientes, aparecerán aquí." Con sugerencia de enviar un mensaje de prueba desde otro teléfono.

**Estado 4 — Búsqueda activa:** los resultados reemplazan la vista de secciones. Resultados agrupados por conversación con el término buscado resaltado.

## Edge cases

**El dueño desliza hacia la izquierda en un ítem:** aparece opción de archivar si ya está resuelta, o de marcar como urgente si está en pendientes.

**Llega un escalamiento urgente mientras el dueño está en la bandeja:** el ítem aparece al tope de la lista con animación suave y el banner de urgencia aparece como notificación dentro de la app.

**El dueño filtra por "Por aprobar" y hay más de 20:** se muestran en grupos de 10 con carga progresiva.

---

# FLUJO 3: Vista de conversación individual (M2.3)

## Narrativa del flujo

El dueño toca una conversación. Entra a la vista de detalle. El hilo de mensajes ocupa toda la pantalla, exactamente como WhatsApp. Mensajes del cliente a la izquierda con fondo gris claro. Mensajes del agente a la derecha con el color primario de la app ligeramente desaturado. Mensajes del dueño a la derecha con el color primario completo.

La diferencia visual entre mensajes del agente y del dueño es sutil pero consistente: los del agente tienen un ícono pequeño de robot en la esquina de la burbuja. Los del dueño no tienen ningún ícono adicional.

Si hay una sugerencia pendiente, el componente de modo colaborador (M2.4) aparece fijo en la parte inferior. Si no hay sugerencia, aparece el campo de escritura directa del dueño.

En la parte superior, el header muestra el nombre del cliente, el estado de la conversación con indicador de color, y un botón de información que despliega el panel lateral. En móvil el panel lateral es un sheet que sube desde abajo. En desktop es una columna fija a la derecha.

El panel de información muestra: nombre y número del cliente, primera vez que escribió, total de conversaciones con este cliente, etiquetas del agente (comprador potencial, queja, recurrente), y las últimas tres interacciones resumidas en una línea cada una.

## Estados del sistema

**Estado 1 — Con sugerencia pendiente:** componente M2.4 fijo en la parte inferior, hilo scrollable con el historial completo.

**Estado 2 — Escalada sin sugerencia:** banner de contexto del agente dentro del hilo explicando por qué escaló. Campo de escritura directa disponible.

**Estado 3 — Resuelta:** modo solo lectura. Campo inferior deshabilitado. Botón de "Reabrir" disponible.

**Estado 4 — En modo autónomo activo:** el agente responde solo. Indicador en el header: "Tu agente está respondiendo de forma autónoma." Con opción de tomar el control.

## Edge cases

**El cliente envía imagen o nota de voz:** se muestra en el hilo como elemento visual con reproductor inline para audio. El agente escala directamente. Nota del sistema en el hilo: "Tu agente no puede procesar este archivo. Conversación escalada."

**El dueño responde directamente sin aprobar la sugerencia:** la sugerencia se descarta automáticamente. La respuesta del dueño se envía. El sistema registra la acción sin interrumpir el flujo.

**La conversación tiene más de 50 mensajes:** el hilo carga los últimos 20. Botón en la parte superior para cargar mensajes anteriores. El agente siempre tiene acceso al historial completo.

---

# FLUJO 4: Modo colaborador — aprobar, editar, rechazar (M2.4)

## Narrativa del flujo

Este es el flujo más ejecutado del producto. Tiene que ser el más rápido y el menos friccionoso de toda la app.

El componente aparece en la parte inferior de M2.3 cuando hay una sugerencia pendiente. Tiene cuatro partes.

La primera es el contexto del mensaje: el último mensaje del cliente en una burbuja pequeña encima de la sugerencia. Una línea de texto secundaria muestra la intención detectada por el agente: "Pregunta sobre horarios" o "Consulta de precio" o "Queja."

La segunda es la sugerencia del agente: el texto completo en una burbuja con el color del agente. Si es largo, truncado con opción de expandir. Al lado, indicador de confianza visual: punto verde (alta confianza), punto amarillo (confianza media), punto naranja (revisar con cuidado). Sin texto técnico.

La tercera parte son las tres acciones. "Aprobar" es el botón más prominente, tamaño completo, fácil de alcanzar con el pulgar. "Editar" y "Rechazar" son botones de texto más pequeños flanqueando al botón principal.

La cuarta parte aparece únicamente después de que el dueño edita o rechaza y envía su versión: la pregunta de clasificación de corrección. "¿Quieres que tu agente recuerde esto?" con tres botones: "Solo esta vez", "Siempre", "Por ahora." Si el dueño no responde en 5 segundos, la corrección se clasifica como puntual por defecto. Nunca se asume permanencia sin confirmación explícita.

### Flujo de aprobación

El dueño toca "Aprobar." La burbuja de sugerencia se anima hacia arriba y se integra al hilo como mensaje enviado. El componente desaparece. Si hay otra sugerencia pendiente en la misma conversación, el componente se actualiza con la nueva. Si no hay más sugerencias, aparece el campo de escritura directa.

Optimistic UI: la respuesta visualmente ya está en el hilo antes de la confirmación del servidor. Si el servidor falla, se muestra el error con opción de reintentar.

### Flujo de edición

El dueño toca "Editar." El texto de la sugerencia se convierte en campo editable con el cursor al final. El teclado sube. El dueño modifica y envía. La pregunta de clasificación aparece por 5 segundos.

Botón "Cancelar" en el header del componente de edición devuelve a la sugerencia original.

### Flujo de rechazo

El dueño toca "Rechazar." La sugerencia desaparece. Aparece el campo de escritura directa vacío con cursor activo. El dueño escribe su respuesta y envía. La pregunta de clasificación aparece por 5 segundos.

Si el dueño toca "Rechazar" y no escribe nada, la conversación queda como "Pendiente de respuesta manual."

### Flujo de clasificación de corrección — detalle

**"Solo esta vez":** corrección puntual. No modifica el conocimiento del agente. Fue una respuesta a una situación excepcional.

**"Siempre":** nueva regla o dato permanente. Se integra a la Capa 2 o Capa 4 del modelo de conocimiento según corresponda.

**"Por ahora":** dato temporal. Aparece un picker de fecha simple. Opciones predefinidas: "Hasta mañana", "Esta semana", "Este mes", fecha personalizada. El agente confirma: "Entendido. Lo recordaré hasta el [fecha]."

### Flujo de aprobación agrupada

Aparece como banner en la bandeja (M2.2), no dentro de una conversación individual: "Hay 8 preguntas sobre horarios con respuestas que ya aprobaste antes. ¿Aprobarlas todas?" Con botón "Aprobar todas" y botón "Revisar primero."

Si el dueño elige "Revisar primero," ve un listado simplificado con la sugerencia visible para cada conversación. Puede aprobar individualmente o aprobar todas desde esa vista.

### Regla de tiempo de espera

Si el dueño no responde en el tiempo configurado, el sistema envía automáticamente la respuesta de espera segura configurable: "Gracias por escribirnos. Estamos verificando tu consulta y te respondemos en breve." Nunca silencio total hacia el cliente.

## Estados del sistema

**Estado 1 — Sugerencia de alta confianza:** punto verde, botón de aprobar prominente, texto completo visible.

**Estado 2 — Sugerencia de confianza media:** punto amarillo, texto visible, indicador sutil de revisión.

**Estado 3 — Sugerencia de baja confianza:** punto naranja, botón de editar con el mismo peso visual que el de aprobar, nota del agente: "No estoy completamente seguro de esto."

**Estado 4 — En edición:** campo expandido, cursor activo, botón de cancelar disponible.

**Estado 5 — Clasificación de corrección:** pregunta visible por 5 segundos, tres opciones, desaparece automáticamente.

**Estado 6 — Corrección "Por ahora" seleccionada:** picker de fecha con opciones predefinidas.

## Edge cases

**El dueño aprueba y el cliente ya escribió otro mensaje mientras tanto:** la respuesta aprobada se envía de todas formas. El nuevo mensaje genera una nueva sugerencia inmediatamente.

**El dueño intenta editar y la conexión se cae:** el campo permanece activo con el texto del dueño. Se envía cuando la conexión se recupera. El texto no se pierde.

**La sugerencia tiene información desactualizada:** el dueño edita, corrige, y cuando aparece la pregunta de clasificación elige "Siempre." El sistema actualiza la capa de conocimiento correspondiente y el agente confirma qué aprendió.

**El tiempo de espera se agota sin que el dueño apruebe:** el sistema envía la respuesta de espera segura. La sugerencia del agente permanece pendiente. Cuando el dueño abre la app ve: "Se envió respuesta de espera. ¿Quieres enviar esta respuesta ahora o ya no es necesaria?"

---

# FLUJO 5: Escalamiento y acción urgente (M2.5)

## Narrativa del flujo

El agente detecta que una situación está fuera de su alcance o es sensible. No intenta resolver. Escala inmediatamente y notifica al dueño con el contexto necesario para actuar.

### Escalamiento informativo

El agente no tiene un dato específico. En el hilo aparece un mensaje del sistema: "Tu agente no tiene esta información. Puedes responder tú o agregar este dato para el futuro." La conversación aparece en la bandeja con etiqueta amarilla.

El dueño abre la conversación. Ve el hilo completo y la explicación del agente: "El cliente pregunta si aceptan pagos con Visa. Tu agente no tiene configurada esa información." Dos opciones: "Responder ahora" que abre el campo de escritura directa, y "Agregar información" que abre M3.1 pre-configurado para ese tema.

Después de responder, el sistema pregunta: "¿Quieres que tu agente sepa esto para futuras preguntas?" Sí va directamente a confirmar el dato en M3.1.

### Escalamiento sensible

El agente detecta queja, negociación especial, o situación que requiere criterio. La conversación aparece en la bandeja con etiqueta naranja.

El dueño abre la conversación. Banner de contexto del agente dentro del hilo (colapsable): "Esta conversación requiere tu atención. El cliente expresa insatisfacción con [tema específico]. Nivel de riesgo: moderado."

El agente no sugiere una respuesta automática. Propone dos o tres opciones pre-redactadas: "Opción 1: Disculpa formal con compromiso de resolución. Opción 2: Solicitar más detalle del problema. Opción 3: Escalar a llamada telefónica." Cada opción es un botón que expande el texto completo. El dueño elige una como base para editar, o escribe desde cero.

### Escalamiento urgente

El agente detecta emergencia: tema de salud, situación legal, amenaza reputacional severa.

Si la app está abierta: banner de urgencia reemplaza la zona superior del home con vibración del teléfono.

Si la app está cerrada: notificación push con sonido diferente al normal. Texto directo: "[Nombre del negocio]: Tu agente detectó una situación urgente. Un cliente necesita atención inmediata."

El agente ya envió al cliente una respuesta de contención: "Gracias por escribirnos. Tu consulta es importante y alguien del equipo te atenderá en los próximos minutos." El dueño entra, ve el hilo completo, el banner de urgencia con la clasificación específica, y el campo de escritura directa activo.

Una vez que el dueño responde, el banner desaparece. La conversación se marca como "Atendida urgente" en el historial.

## Estados del sistema

**Escalamiento informativo — Activo:** etiqueta amarilla en bandeja, banner informativo en conversación, dos opciones de acción.

**Escalamiento informativo — Resuelto:** conversación pasa a "Atendidas."

**Escalamiento sensible — Activo:** etiqueta naranja en bandeja, banner de contexto colapsable, opciones pre-redactadas visibles.

**Escalamiento urgente — Activo:** banner rojo en home, notificación push con sonido distinto, conversación al tope de la bandeja, respuesta de contención ya enviada al cliente.

**Escalamiento urgente — Resuelto:** el dueño respondió, banner desaparece, conversación entra al historial con marca "Urgente atendido."

## Edge cases

**Dos escalamientos urgentes simultáneos:** el banner del home muestra el más reciente con contador: "2 situaciones urgentes." Al tocar entra a la bandeja filtrada por urgentes.

**El dueño no atiende un escalamiento urgente en 15 minutos:** el sistema reenvía la notificación push. A los 30 minutos, envía un WhatsApp al número personal del dueño: "Hay una conversación urgente en [nombre del negocio] que lleva 30 minutos sin atender." Con link directo a la app.

**El agente clasifica incorrectamente como urgente:** el dueño puede marcar "No era urgente" después de resolver. Esa retroalimentación entrena al agente para calibrar mejor la detección.

---

# FLUJO 6: Instrucción rápida (M3.1)

## Narrativa del flujo

El dueño quiere actualizar algo que sabe el agente. Abre la app. El componente está en el home, visible inmediatamente.

Toca el campo de texto. El teclado sube. El dueño escribe en lenguaje natural: "A partir del lunes el horario de cierre cambia a las 8 PM." Toca enviar.

Indicador de procesamiento por 1-2 segundos. Luego la confirmación del agente aparece en el mismo componente como respuesta de chat: "Entendido. A partir del lunes voy a decirles a los clientes que cierran a las 8 PM. ¿Es así?" Con dos botones: "Sí, correcto" y "No, déjame explicar."

El dueño toca "Sí, correcto." El agente confirma: "Listo. Ya actualicé mi información sobre horarios." El componente regresa a su estado neutro.

Después de confirmar, el dueño puede clasificar la instrucción usando la misma tipología de M2.4: "Siempre", "Por ahora" (con picker de fecha), o "Solo esta vez."

### Flujo de nota de voz

El dueño toca el ícono de micrófono. Grabación activa con indicador de onda. El dueño habla. Toca de nuevo para detener. El componente muestra la transcripción en texto para confirmar. Si hay error de transcripción, puede editar antes de enviar.

### Flujo de imagen

El dueño adjunta imagen (menú escrito a mano, cartel de promoción, lista de precios). El sistema extrae texto con OCR y muestra lo que entendió: "Encontré esta información en la imagen: [texto extraído]." El dueño confirma o corrige.

### Flujo de link

El dueño pega un link. El sistema analiza el contenido y extrae información relevante. Muestra un resumen con opción de seleccionar qué información integrar.

## Estados del sistema

**Estado 1 — Campo neutro:** placeholder rotativo con ejemplos, íconos de voz y adjuntar visibles.

**Estado 2 — Escribiendo:** campo expandido, cursor activo.

**Estado 3 — Procesando:** texto enviado, indicador de procesamiento, campo deshabilitado temporalmente.

**Estado 4 — Confirmación del agente:** respuesta del agente visible con dos opciones.

**Estado 5 — Instrucción integrada:** confirmación de aprendizaje, componente regresa al estado neutro.

**Estado 6 — Instrucción ambigua:** el agente hace una pregunta de clarificación específica. Una sola pregunta, no un formulario.

**Estado 7 — Grabando nota de voz:** indicador de onda, botón de detener, contador de tiempo.

**Estado 8 — Revisando transcripción:** texto transcrito en campo editable, botón de enviar.

## Edge cases

**La instrucción contradice información existente:** el agente lo señala antes de confirmar: "Actualmente tengo configurado que cierran a las 7 PM. ¿Quieres cambiar eso a 8 PM?" Con los dos botones de confirmación.

**El dueño da una instrucción muy larga o compleja:** el agente confirma solo los puntos clave que entendió, numerados. El dueño puede señalar qué parte no fue bien interpretada.

**La imagen de OCR tiene texto ilegible:** "No pude leer claramente esta sección. ¿Quieres escribirla manualmente?" Sin bloquear el flujo.

**El link no es accesible:** "No pude acceder a ese link. ¿Quieres copiar y pegar la información directamente?"

---

# FLUJO 7: Activación de autonomía por tema (M4.3)

## Narrativa del flujo

### Activación sugerida por el sistema

El dueño lleva dos semanas usando Agenti en modo colaborador. Ha aprobado docenas de respuestas sobre horarios sin editar ni rechazar. El sistema lo detecta.

En el home aparece una sugerencia proactiva in-app (no push): "Tu agente lleva 23 respuestas sobre horarios sin ninguna corrección. ¿Quieres que responda solo en ese tema?" Con botones "Activar autonomía" y "Prefiero seguir revisando."

Si el dueño toca "Activar autonomía," aparece un modal de confirmación simple. Los tres indicadores de evidencia en lenguaje humano:

- "Tu agente conoce bien este tema" — basado en cobertura de Capa 1 y Capa 2 para ese tema.
- "Ha respondido bien últimamente" — basado en porcentaje de sugerencias aprobadas sin edición en los últimos 7 días.
- "Sin incidentes recientes" — basado en ausencia de escalamientos o correcciones en ese tema en el mismo período.

Selector de nivel: Nivel 1 seleccionado por defecto. Texto: "Tu agente responderá solo si está seguro. Si tiene dudas, te consulta." Botones "Confirmar" y "Cancelar."

El agente confirma: "Perfecto. A partir de ahora voy a responder solo las preguntas sobre horarios cuando esté seguro. Puedes desactivarlo en cualquier momento desde Configuración."

### Activación manual desde M4.3

El dueño navega a Configuración, sección de autonomía. Ve la lista de temas con el nivel actual y los tres indicadores de evidencia en colores.

Si todos los indicadores están en verde: el sistema sugiere proactivamente la activación.

Si algún indicador no está en verde (por ejemplo, "Precios" con cobertura incompleta): el sistema no bloquea pero muestra la advertencia específica: "Tu agente no tiene todos los precios. Si activas autonomía, podría escalar más de lo esperado en ese tema." El dueño puede confirmar de todas formas o ir a agregar precios faltantes con botón directo a M3.1.

### Desactivación

Desde M4.3 o desde el header de una conversación en modo autónomo. La desactivación es instantánea, sin pantalla de confirmación. Activar requiere confirmación, desactivar no.

## Estados del sistema

**Estado 1 — Todos en modo colaborador:** lista completa con indicadores, botones de configuración disponibles.

**Estado 2 — Sugerencia proactiva disponible:** badge in-app con la sugerencia.

**Estado 3 — Modal de confirmación:** indicadores visibles, selector de nivel, botón confirmar prominente.

**Estado 4 — Autonomía activa en un tema:** indicador verde junto al nombre del tema, botón de desactivar visible, estadística de conversaciones resueltas autónomamente.

**Estado 5 — Activación con advertencia:** modal con el indicador específico en amarillo y la advertencia.

## Edge cases

**El agente comete un error en la primera respuesta autónoma:** la autonomía no se desactiva automáticamente, pero el incidente aparece en M5.2 como oportunidad de entrenamiento. El sistema notifica: "Tu agente cometió un error en una respuesta autónoma de horarios. ¿Quieres revisar y ajustar?"

**El dueño intenta activar Nivel 2 antes de que el sistema lo sugiera:** permitido con advertencia clara: "El Nivel 2 significa que tu agente responde en este tema casi siempre sin consultarte. Asegúrate de que su información esté completa antes de activarlo."

---

# Mapa de estados del sistema completo

Cada mensaje que llega al sistema puede terminar en uno de estos estados. Esta taxonomía debe existir a nivel de producto, no solo a nivel técnico.

| Estado | Descripción | Acción requerida del dueño |
|---|---|---|
| Respondido autónomamente | El agente respondió solo en tema con autonomía activa | Ninguna |
| Sugerencia pendiente | El agente preparó respuesta esperando aprobación | Aprobar, editar o rechazar |
| Aprobado por el dueño | El dueño aprobó la sugerencia del agente | Ninguna |
| Editado por el dueño | El dueño modificó la sugerencia antes de enviar | Clasificar la corrección |
| Rechazado y respondido | El dueño descartó la sugerencia y escribió la propia | Clasificar la corrección |
| Escalado informativo | El agente no tenía un dato específico | Responder y/o agregar el dato |
| Escalado sensible | La situación requiere criterio humano | Responder usando las opciones del agente |
| Escalado urgente | Emergencia que no puede esperar | Atender inmediatamente |
| Respuesta en espera enviada | El tiempo de espera se agotó, se envió mensaje de contención | Responder cuando pueda |
| Sin respuesta por falta de contexto | El agente no tiene suficiente información para actuar | Agregar información al agente |
| Archivado | Conversación cerrada sin acción pendiente | Ninguna |

---

## Lo que este entregable no cubre intencionalmente

**Flujos del onboarding (Mundo 1):** ya existe especificación suficiente en documentos previos y fue complementada en el Entregable 1 con el walkthrough cognitivo de los tres arquetipos.

**Estado del agente (M3.2) y Historial de aprendizaje (M3.3):** módulos de visualización y auditoría cuyos flujos emergen naturalmente de los flujos de instrucción y corrección definidos aquí.

**Módulos de configuración (M4.1, M4.2, M4.4, M4.5):** formularios de edición que siguen el patrón de M1.3 y M1.4 del onboarding.

**Inteligencia (M5.1, M5.2):** vistas de consulta cuyos datos emergen directamente de los eventos capturados en los flujos definidos en este documento.

---

*AGENTI — Entregable 3 v2.0 — Flujos de experiencia del producto core*
