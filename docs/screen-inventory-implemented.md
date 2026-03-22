# Inventario de Pantallas Implementadas — AGENTI
_Generado: 2026-03-21 | Estado: Fase 5 completa_

Este documento describe cada pantalla de la aplicación: qué aparece, por qué aparece, cómo funciona y cómo se conecta con el resto de la app. Es una descripción funcional, no un spec de diseño.

---

## Cómo está estructurada la aplicación

AGENTI es una aplicación móvil-first para dueños de negocio. Toda la app vive bajo la ruta `/dashboard`. Hay **5 secciones principales** accesibles desde la navegación: Inicio, Conversaciones, Agente, Entrenar y Ajustes.

En móvil, la navegación es una barra de tabs fija en la parte inferior de la pantalla. En escritorio, es un sidebar vertical a la izquierda. La barra de navegación **desaparece completamente** cuando el usuario está dentro de una conversación específica, para darle toda la pantalla al chat.

Cada pantalla de la app vive en una URL propia y tiene navegación hacia atrás o hacia otras secciones.

---

## Navegación principal

### Barra de tabs (móvil) / Sidebar (escritorio)

Siempre visible excepto cuando estás dentro de un chat individual.

Tiene 5 destinos:

| Tab | Ícono | A dónde lleva |
|---|---|---|
| Inicio | Casa | `/dashboard` |
| Conversaciones | Burbuja de chat | `/dashboard/conversations` |
| Agente | Robot | `/dashboard/agent` |
| Entrenar | Cerebro | `/dashboard/train` |
| Ajustes | Engranaje | `/dashboard/settings` |

Los badges (puntos rojos sobre los íconos) reflejan datos reales: el de Conversaciones muestra la cantidad de conversaciones con `status = pending_approval`; el de Entrenar muestra la cantidad de `competency_topics` con `knowledge_count = 0`. Solo aparecen cuando el count es mayor que cero.

---

## Pantallas

---

### Pantalla 1 — Inicio
**URL:** `/dashboard`

#### ¿Para qué sirve?
Es la pantalla de entrada de la app. Tiene dos propósitos: que el dueño pueda enseñarle algo nuevo a su agente rápidamente, y que pueda ver de un vistazo qué está pasando con sus conversaciones.

#### ¿Qué aparece en pantalla?

**1. Barra de estado del agente (arriba del todo)**
Una barra horizontal que muestra si el agente está activo o si hay conversaciones esperando aprobación. Si hay respuestas pendientes de aprobar, la barra se vuelve ámbar y dice cuántas hay. Si todo está al día, la barra es verde y dice cuántas conversaciones atendió hoy. La barra es un link que lleva a la bandeja de conversaciones cuando hay pendientes.

**2. Sección "Enséñale algo nuevo"**
Un título y debajo un panel de entrada de texto. Aquí el dueño puede escribir instrucciones para su agente: horarios, precios, políticas, lo que sea. Este panel también acepta notas de voz (graba con el micrófono) y archivos adjuntos (imágenes del menú, PDFs de servicios). Cuando el dueño envía una instrucción, un modelo de IA la analiza y propone clasificarla en un área y tipo específico. El dueño confirma o edita antes de guardarla. Este mismo componente de instrucción rápida aparece también en la pantalla del Agente.

**3. Sección "Actividad reciente"**
Una lista de las últimas 5 conversaciones del negocio ordenadas por la más reciente. Cada fila muestra el nombre del cliente, un fragmento del último mensaje, la hora, y una etiqueta de color que indica el estado (si necesita aprobación, si hay algo urgente, etc.). Al tocar cualquier conversación, abre el chat de esa conversación. En la esquina superior derecha hay un link "Ver bandeja →" que lleva a la pantalla de todas las conversaciones.

#### Datos que muestra
- Cuántas conversaciones atendió el agente hoy → dato real de Supabase
- Cuántas respuestas están esperando aprobación → dato real de Supabase
- En cuántos temas le falta conocimiento al agente → dato real de Supabase
- Lista de conversaciones recientes → datos reales, últimas 5 sin archivar

---

### Pantalla 2 — Conversaciones (Bandeja)
**URL:** `/dashboard/conversations`

#### ¿Para qué sirve?
Es la bandeja de entrada completa. El dueño puede ver todas sus conversaciones, filtrarlas por estado y buscar por nombre de cliente. Es el centro de operaciones para gestionar qué está pasando con los clientes.

#### ¿Qué aparece en pantalla?

**1. Buscador**
Un campo de texto con ícono de lupa. Filtra las conversaciones visibles por nombre del cliente mientras el usuario escribe. La búsqueda es instantánea, no requiere presionar enter.

**2. Tres tabs de filtro principales**
- **"Atención requerida"** — Muestra conversaciones que necesitan que el dueño haga algo: aprobar una respuesta del agente, atender una escalación o responder algo urgente. Incluye todas las conversaciones activas aunque no tengan acción urgente. Tiene un número que indica cuántas hay.
- **"Atendidas hoy"** — Muestra conversaciones que el agente resolvió sin que el dueño tuviera que intervenir. No tienen ninguna acción pendiente.
- **"Archivadas"** — Conversaciones resueltas o archivadas manualmente.

**3. Chips de sub-filtro por urgencia** (solo visible en "Atención requerida")
Cinco pastillas de colores que permiten filtrar por tipo de acción:
- **Todos** — ver todo sin filtrar
- **Urgente** (rojo, con punto parpadeante) — situaciones que el agente marcó como urgentes
- **Sensible** (ámbar) — temas que requieren criterio del dueño, el agente no quiso arriesgar
- **Informativo** (azul) — el agente no tenía la información necesaria para responder
- **Sugerencia** (verde) — el agente ya tiene lista una respuesta para que el dueño la apruebe

**4. Lista de conversaciones**
Cada fila de conversación muestra:
- Avatar con las iniciales del cliente
- Nombre del cliente y hora del último mensaje
- Una etiqueta de color indicando el tipo de acción requerida
- Un fragmento del último mensaje

Si la conversación es urgente, la fila tiene un borde rojo a la izquierda para destacarla visualmente.

Al tocar cualquier fila, se abre el chat de esa conversación (Pantalla 3).

#### Cómo se actualiza
La bandeja escucha cambios en tiempo real. Cuando llega un mensaje nuevo o cambia el estado de una conversación en cualquier parte (puede ser el backend procesando un mensaje de WhatsApp), la lista se actualiza automáticamente sin que el usuario tenga que recargar.

---

### Pantalla 3 — Chat (Thread de conversación)
**URL:** `/dashboard/conversations/[id]`

#### ¿Para qué sirve?
Es la pantalla del chat individual. El dueño puede leer todos los mensajes de la conversación con un cliente, ver qué propuso el agente, aprobar o rechazar respuestas, responder mensajes urgentes y escribir mensajes manuales.

#### ¿Qué aparece en pantalla?

**1. Cabecera (parte superior)**
Muestra el nombre del cliente y su número de teléfono. Un botón de flecha ← para volver a la bandeja. Un ícono de tres puntos ⋮ en la esquina derecha (actualmente sin funcionalidad — pendiente archivar/eliminar).

**2. Historial de mensajes (área central)**
Todos los mensajes de la conversación en orden cronológico, del más antiguo al más reciente. Hay tres tipos de burbuja:
- **Mensajes del cliente** → aparecen a la izquierda, fondo blanco con borde gris, con avatar de letras del cliente
- **Mensajes del agente IA** → aparecen a la derecha, fondo verde muy claro con borde verde suave, con ícono de robot
- **Mensajes del dueño** → aparecen a la derecha, fondo verde oscuro, texto blanco, con ícono de persona

Cuando se abre el chat, la pantalla hace scroll automático hasta el último mensaje. Cuando llega un mensaje nuevo en tiempo real, también hace scroll.

**3. Panel de acción (parte inferior fija)**
Este es el elemento más importante de la pantalla. Cambia completamente según el estado de la conversación. Solo puede mostrar uno de estos tres estados a la vez:

**Estado A — Borrador del agente (cuando el agente ya tiene una respuesta lista)**
Aparece cuando el dueño llega a una conversación que tiene `status = pending_approval`. El agente propuso una respuesta y el dueño debe revisarla.
- Muestra el texto que propuso el agente en un recuadro verde claro
- Tres acciones: **X Descartar** (rechaza el borrador, queda el input manual), **Editar** (abre un textarea para modificar el texto antes de enviar), **Aprobar** (envía el mensaje tal cual al cliente vía WhatsApp)
- Si se edita: aparece un textarea con el texto y el botón "Enviar y Enseñar" que envía la versión editada
- Si se descarta: el borrador desaparece pero queda un chip pequeño "Borrador descartado — toca para verlo de nuevo" para recuperarlo si fue un error

**Estado B — Banner de escalación (cuando el agente escala el tema)**
Aparece cuando la conversación tiene `status = escalated_*`. Significa que el agente decidió no responder porque el tema era demasiado delicado, urgente o le faltaba información.
- Muestra un banner con color según el tipo (rojo para urgente, ámbar para sensible o informativo)
- Dice el motivo por el que el agente escaló (viene del backend)
- Tiene un campo de texto directo para que el dueño responda al cliente sin salir de la pantalla
- Tiene un botón "Atender" que toma el control manual de la conversación y cambia el estado

**Estado C — Input manual (conversación sin acción pendiente)**
Aparece en cualquier conversación activa o resuelta donde no hay sugerencia ni escalación. Es una barra de texto con un botón circular de enviar. El dueño puede escribir directamente al cliente. Presionar Enter o el botón envía el mensaje vía WhatsApp al cliente.

#### Cómo se actualiza
La pantalla escucha cuatro tipos de cambios en tiempo real: nuevos mensajes, cambios de estado en la conversación, nueva sugerencia del agente, y nueva escalación del agente. Cualquiera de estos eventos actualiza la pantalla automáticamente.

#### Conexiones con otras pantallas
- Botón ← → vuelve a la Bandeja (Pantalla 2)
- No hay links a otras pantallas desde aquí

---

### Pantalla 4 — Agente (Mi Agente)
**URL:** `/dashboard/agent`

#### ¿Para qué sirve?
Es el panel de control del agente de IA. El dueño puede ver qué tan bien entrenado está su agente, enseñarle cosas nuevas, ver qué sabe sobre cada área del negocio, y acceder al historial y las métricas.

#### ¿Qué aparece en pantalla?

**1. Tarjeta de salud operativa**
Una tarjeta oscura (verde muy oscuro) con una puntuación del 0% al 100% que indica qué porcentaje de las áreas del negocio tiene al menos una instrucción enseñada. No es una métrica de calidad, es binaria: si un área tiene aunque sea una instrucción, cuenta como "cubierta". Debajo del porcentaje hay dos números: cuántas áreas están cubiertas y cuántas no. El nivel textual cambia según el porcentaje: "Excelente" si está por encima del 80%, "Óptimo" si está entre 50% y 79%, "En Desarrollo" si está por debajo.

**2. Panel de instrucción rápida**
El mismo panel de entrada de texto que aparece en la pantalla de Inicio. Permite escribir, dictar o adjuntar una imagen/PDF para enseñarle al agente. La diferencia aquí es que cuando se confirma una instrucción, el mapa de áreas de abajo se actualiza automáticamente en tiempo real para reflejar el nuevo conocimiento.

**3. Mapa de áreas del negocio**
Una lista de todas las áreas temáticas que el agente debe conocer. Hay dos tipos de áreas:
- **Áreas principales** (las que se definen durante el onboarding del negocio): se muestran siempre, una debajo de otra
- **Conocimiento adicional** (información extra que no entra en categorías fijas): aparecen colapsadas debajo de un botón expandible que dice "Conocimiento adicional (N)"

Cada área se muestra como una tarjeta con:
- Un check verde si tiene al menos una instrucción, o un círculo gris si no tiene ninguna
- El nombre del área
- Cuántas instrucciones tiene ("2 instrucciones") o "Sin cubrir"

Al tocar una tarjeta de área, se expande para mostrar el listado de instrucciones que el agente tiene sobre ese tema. Cada instrucción muestra de qué tipo es (Dato fijo, Política, Descriptivo, Aprendido) y el texto de la instrucción.

Si hay áreas sin ninguna instrucción, aparece una nota recordando al dueño que puede usar la instrucción rápida de arriba para cubrirlas.

**4. Acceso a Inteligencia**
Al final de la pantalla hay una fila que lleva a la pantalla de Inteligencia (métricas y estadísticas del agente). Se ve como un link con ícono de gráficas, título y descripción.

#### Botón "Historial" (esquina superior derecha)
Lleva a la pantalla del Historial de aprendizaje (Pantalla 5).

#### Cómo se actualiza
Cuando el dueño confirma una nueva instrucción (desde el panel de arriba), el mapa de áreas se actualiza automáticamente gracias a una conexión en tiempo real con la base de datos. Si un área que estaba "sin cubrir" recibe su primera instrucción, el círculo gris se convierte en check verde al instante.

#### Conexiones con otras pantallas
- Botón "Historial" → Pantalla 5 (Historial de aprendizaje)
- Fila "Inteligencia" → Pantalla 6 (Inteligencia)

---

### Pantalla 5 — Historial de aprendizaje
**URL:** `/dashboard/agent/history`

#### ¿Para qué sirve?
Muestra todo lo que el dueño le ha enseñado al agente, en orden cronológico del más reciente al más antiguo. Permite desactivar instrucciones que ya no son válidas (por ejemplo, un precio que cambió o una política que ya no aplica) y reactivarlas si fue un error.

#### ¿Qué aparece en pantalla?

**1. Buscador**
Un campo de texto que filtra la lista instantáneamente por el contenido de la instrucción o por el nombre del área a la que pertenece.

**2. Filtro por tipo de fuente**
Cuatro opciones en forma de pastillas: Todos / Texto / Voz / Imagen. Filtra según cómo fue creada la instrucción (si el dueño la escribió, la dictó o la subió como imagen/PDF).

**3. Lista de instrucciones**
Cada instrucción muestra:
- A qué área del negocio pertenece (por ejemplo, "Horarios", "Precios", "Políticas de reserva")
- El tipo de instrucción (Dato fijo, Política, Descriptivo, Aprendido) con un badge de color
- Cuándo fue creada
- El texto completo de la instrucción
- Un toggle (interruptor) para activar o desactivar

**4. Comportamiento del toggle**
- **Desactivar** una instrucción activa: antes de hacerlo, aparece un modal de confirmación que dice "¿Desactivar esta instrucción?" con el resumen del contenido. El dueño debe confirmar expresamente. Esto evita desactivaciones accidentales.
- **Reactivar** una instrucción desactivada: se hace directamente sin confirmación, porque es una acción de bajo riesgo.

Cuando se activa o desactiva una instrucción, el agente actualiza su conocimiento de forma inmediata. Las instrucciones desactivadas quedan visibles en la lista pero con apariencia atenuada, para que el dueño pueda verlas y reactivarlas si lo necesita.

#### Conexiones con otras pantallas
- Link "← Volver a Tu Agente" → Pantalla 4 (Agente)

---

### Pantalla 6 — Inteligencia
**URL:** `/dashboard/agent/intelligence`

#### ¿Para qué sirve?
Muestra estadísticas de lo que ha hecho el agente: cuántas conversaciones atendió, cuántas resolvió solo, cuántas necesitaron la intervención del dueño, y qué áreas tiene el agente sin cubrir. También permite enviar un resumen de prueba al WhatsApp del dueño.

#### ¿Qué aparece en pantalla?

**1. Selector de período**
Tres opciones: "Esta semana", "Este mes", "Todo el tiempo". Al cambiar el período, todas las métricas de abajo se recalculan automáticamente.

**2. Métricas de actividad del agente**
Cinco tarjetas organizadas en una cuadrícula 2x3:
- **Conversaciones** — Total de conversaciones con actividad en el período seleccionado
- **Resueltas solas** — Cuántas el agente respondió directamente sin intervención del dueño (modo autónomo activado)
- **Con tu aprobación** — Cuántas el dueño revisó y aprobó la respuesta del agente, o respondió manualmente
- **Escaladas** — Cuántas el agente escaló porque no supo qué hacer o el tema era sensible
- **Tiempo estimado ahorrado** — Cálculo simple: (resueltas solas + con aprobación) × 3 minutos. Aparece en una tarjeta más ancha que ocupa todo el ancho.

**3. Oportunidades de entrenamiento**
Lista de áreas del negocio que no tienen ninguna instrucción todavía. Cada tarjeta muestra el nombre del área y tiene un botón que lleva directamente a la pantalla del Agente con ese tema preseleccionado para entrenar. Si todas las áreas tienen instrucciones, aparece un emoji de celebración y el mensaje "Tu agente está bien entrenado por ahora".

**4. Botón "Enviar resumen de prueba ahora"**
Llama al backend para generar el resumen diario del negocio y enviarlo al número de WhatsApp del dueño en ese momento, sin esperar a la hora programada. Muestra el resultado debajo: si se envió bien, si hubo error y por qué.

#### Conexiones con otras pantallas
- Botón ← → Pantalla 4 (Agente)
- Botón "Entrenar" en cada tarjeta de oportunidad → Pantalla 4 (Agente), abriendo el área específica

---

### Pantalla 7 — Entrenar
**URL:** `/dashboard/train`

#### ¿Para qué sirve?
Es el centro de control del conocimiento del agente. Desde aquí el dueño puede enseñarle cosas nuevas, ver qué ha aprendido recientemente, descubrir qué temas no tienen instrucciones todavía, y desactivar instrucciones que ya no son válidas.

#### ¿Qué aparece en pantalla?

La pantalla se organiza en cuatro bloques apilados verticalmente:

**1. Instrucciones recientes (burbujas de chat)**
Muestra las últimas 3 instrucciones que el dueño le ha dado al agente en formato de conversación: la instrucción del dueño aparece como burbuja verde alineada a la derecha, y debajo una burbuja gris a la izquierda simula la confirmación del agente ("Entendido. Lo usaré para responder preguntas sobre [tema]."). Este bloque solo aparece si hay instrucciones previas. Un botón "Ver todo" lleva al historial completo en `/dashboard/agent/history`.

**2. Nueva instrucción (QuickInstruct)**
El mismo componente de instrucción rápida que existe en el Home: caja de texto + soporte para voz, imagen y PDF. Al enviar, la IA interpreta la instrucción, propone cómo clasificarla, y el dueño confirma. Si el dueño llegó aquí desde una tarjeta de oportunidad, aparece un chip encima del input mostrando el tema seleccionado (ej. "Entrenando sobre: Horarios") con una X para descartar. Al confirmar la instrucción, la pantalla se recarga y la lista de recientes se actualiza.

**3. Temas sin cubrir (oportunidades)**
Lista de `competency_topics` que tienen `knowledge_count = 0` — es decir, temas que el sistema conoce pero para los cuales el dueño nunca ha dado instrucciones. Cada tarjeta muestra el nombre del tema y un botón "Entrenar". Al tocarlo, aparece el chip de contexto en el bloque de nueva instrucción y la pantalla hace scroll hasta él. Si todos los temas están cubiertos, aparece un estado positivo: "Tu agente está bien entrenado".

**4. Historial de aprendizaje (mini-lista)**
Las mismas 5 instrucciones recientes del bloque 1, ahora en formato de tarjeta expandida (`HistoryCard`) mostrando el contenido completo, el tipo de instrucción, el tema, la fecha, y un botón para desactivar la instrucción si ya no es válida. Al desactivar, el agente deja de usar esa información. Un botón "Ver todo" lleva al historial completo.

#### Datos reales que usa
- `knowledge_items`: instrucciones recientes (limitado a 5, ordenadas por `created_at DESC`)
- `competency_topics`: filtrados por `knowledge_count = 0`
- Edge Functions: `process-quick-instruct` y `confirm-instruction` para guardar nuevas instrucciones

#### Conexiones con otras pantallas
- Botón "Ver todo" en instrucciones recientes → Historial completo (`/dashboard/agent/history`)
- Botón "Ver todo" en historial → Historial completo (`/dashboard/agent/history`)
- Botón "Entrenar" en tarjeta de oportunidad → se queda en la misma pantalla, activa el contexto de tema

---

### Pantalla 8 — Ajustes (Hub)
**URL:** `/dashboard/settings`

#### ¿Para qué sirve?
Es una pantalla de menú. No hace nada por sí sola, simplemente lista las cinco secciones de configuración y lleva al dueño a cada una al tocarlas.

#### ¿Qué aparece en pantalla?

Una lista de cinco filas navegables, cada una con un ícono, un título y una descripción breve:

1. **Perfil del negocio** → nombre, horario, contacto
2. **Autonomía del agente** → cuándo responde solo
3. **Plan y soporte** → cuánto del plan está usando
4. **Canal de WhatsApp** → estado de la conexión
5. **Notificaciones** → hora del resumen y alertas

Al tocar cualquier fila se navega a la sub-pantalla correspondiente.

#### Conexiones con otras pantallas
- Fila "Perfil del negocio" → Pantalla 8.1
- Fila "Autonomía del agente" → Pantalla 8.2
- Fila "Plan y soporte" → Pantalla 8.3
- Fila "Canal de WhatsApp" → Pantalla 8.4
- Fila "Notificaciones" → Pantalla 8.5

---

### Pantalla 8.1 — Perfil del negocio
**URL:** `/dashboard/settings/profile`

#### ¿Para qué sirve?
Permite al dueño ver y editar la información básica de su negocio: nombre, descripción, dirección, teléfono y horario de atención. Esta información no es solo visual — cuando el dueño cambia el horario, el agente aprende automáticamente el nuevo horario y lo usará para responder a los clientes.

#### ¿Qué aparece en pantalla?

**Modo lectura (por defecto)**
La pantalla muestra todos los datos del negocio en formato de solo lectura. En la esquina superior derecha hay un botón "Editar" (ícono de lápiz). Debajo de los datos básicos se muestra el horario de la semana: qué días está abierto el negocio, de qué hora a qué hora.

**Modo edición (al tocar "Editar")**
Los campos de texto se convierten en inputs editables. El horario pasa a tener selectores de hora y checkboxes para marcar días como cerrados. El botón "Editar" se reemplaza por dos botones: "Cancelar" (descarta cambios) y "Guardar".

**Al guardar:**
- Los datos se envían al servidor
- Si el horario cambió, el agente crea automáticamente una nueva instrucción con el horario actualizado y aparece un toast que dice "Tu agente ya conoce el nuevo horario"
- Si solo cambió información básica (nombre, teléfono, etc.), aparece un toast simple "Listo"

**Editor de horario**
Muestra los 7 días de la semana. Cada día tiene:
- Un checkbox "Cerrado" que al activarse oculta los campos de hora
- Si está abierto: campo de hora de apertura y campo de hora de cierre

#### Conexiones con otras pantallas
- Botón ← → Pantalla 8 (Hub de Ajustes)

---

### Pantalla 8.2 — Autonomía del agente
**URL:** `/dashboard/settings/autonomy`

#### ¿Para qué sirve?
Permite al dueño activar o desactivar que el agente responda automáticamente (sin pedir aprobación) para cada área del negocio. Cuando la autonomía está activa para un área, si el agente tiene alta confianza en su respuesta, la envía directo al cliente sin esperar que el dueño la apruebe.

#### ¿Qué aparece en pantalla?

Una lista de tarjetas, una por cada área principal del negocio. Cada tarjeta muestra:

**1. Nombre del área y estado del toggle**
Si el toggle está ON (activo), el agente puede responder solo en ese tema. Si está OFF, siempre pedirá aprobación.

**2. Indicadores de elegibilidad (al expandir la tarjeta)**
Al tocar una tarjeta se expande y muestra tres criterios que el agente debe cumplir para poder ser autónomo en ese tema:
- Tiene al menos 70% de cobertura de conocimiento en ese tema
- El 85% o más de sus respuestas pasadas en ese tema fueron aprobadas por el dueño
- No ha habido incidentes reportados en los últimos 7 días

Cada criterio aparece con un ✓ si está cumplido o un ✗ si no.

**3. Comportamiento del toggle**

Si el área cumple los tres criterios y el dueño activa el toggle, aparece un modal de confirmación que lista los criterios cumplidos y pregunta "¿Activar autonomía en [nombre del área]?". Al confirmar, el agente empieza a responder solo en ese tema inmediatamente.

Si el área NO cumple los criterios y el dueño intenta activar el toggle, aparece una notificación que dice "Este tema aún no cumple los requisitos para operar de forma autónoma" y el toggle no cambia.

Si el dueño desactiva un toggle que estaba activo, la desactivación ocurre directamente sin confirmación.

#### Situación actual
Todos los temas están al 25% de cobertura, por lo que ninguno puede activarse todavía. El sistema muestra correctamente el bloqueo con el mensaje de "no cumple los requisitos".

#### Conexiones con otras pantallas
- Botón ← → Pantalla 8 (Hub de Ajustes)

---

### Pantalla 8.3 — Plan y soporte
**URL:** `/dashboard/settings/plan`

#### ¿Para qué sirve?
Muestra cuántas conversaciones ha tenido el negocio en el mes actual versus el límite del plan. También hay botones para ver opciones de plan y contactar soporte, aunque ambos están deshabilitados durante el período piloto.

#### ¿Qué aparece en pantalla?

**Tarjeta del plan actual**
- Nombre del plan: "Plan Piloto" con badge verde "Activo"
- Barra de progreso que muestra `X / 500` conversaciones del mes
- La barra cambia de color: verde hasta el 79%, ámbar al 80%, rojo al 100%
- Si se acerca o supera el límite, aparece un aviso textual debajo de la barra

**Tarjeta de upgrade**
Texto explicativo sobre cómo ampliar el plan, con un botón "Ver opciones de plan" que está deshabilitado.

**Tarjeta de soporte**
Botón "Enviar mensaje al equipo" también deshabilitado, con una nota que dice que el dueño puede escribir directamente a su contacto de AGENTI.

#### Conexiones con otras pantallas
- Botón ← → Pantalla 8 (Hub de Ajustes)

---

### Pantalla 8.4 — Canal de WhatsApp
**URL:** `/dashboard/settings/whatsapp`

#### ¿Para qué sirve?
Muestra el estado actual de la conexión de WhatsApp del negocio y permite desconectar el canal si es necesario. Es importante porque si el canal está desconectado, el agente no recibe ni puede enviar mensajes.

#### ¿Qué aparece en pantalla?

**Tarjeta de estado**
Muestra un ícono circular y una etiqueta de texto que indica el estado actual. Hay cinco estados posibles:
- **Conectado** (verde, ícono de wifi): todo funciona normalmente. Muestra el ID del número y la fecha desde que está conectado.
- **Desconectado** (gris, ícono de wifi tachado): el canal no está activo.
- **Conectando…** (ámbar, ícono girando): en proceso de conexión.
- **Token expirado** (rojo, ícono de alerta): el token de acceso de Meta expiró y ya no puede enviar mensajes.
- **Error de conexión** (rojo, ícono de alerta): hay un error técnico con la conexión.

Si el estado es "Token expirado" o "Error", aparece además un banner rojo debajo de la tarjeta explicando el problema y pidiendo al dueño que reconecte.

**Botones de acción**
- Si el canal **no está conectado**: aparece el botón "Reconectar WhatsApp" (actualmente deshabilitado — se habilitará en la Fase 6 cuando se migre a producción de Meta)
- Si el canal **está conectado**: aparece el botón "Desconectar canal"

**Al tocar "Desconectar canal"**
Aparece un modal de confirmación que advierte que el agente dejará de recibir y responder mensajes, pero que el historial de conversaciones y el conocimiento del agente quedan intactos. El dueño debe confirmar con un botón rojo "Desconectar".

Hay una nota bajo los botones que dice "Desconectar el canal no elimina tu historial de conversaciones ni el conocimiento de tu agente", para tranquilizar al dueño antes de desconectar.

#### Conexiones con otras pantallas
- Botón ← → Pantalla 8 (Hub de Ajustes)

---

### Pantalla 8.5 — Notificaciones
**URL:** `/dashboard/settings/notifications`

#### ¿Para qué sirve?
Permite al dueño configurar tres cosas: a qué hora quiere recibir el resumen diario de actividad por WhatsApp, en qué horario no quiere recibir notificaciones, y si quiere que el agente le avise cuando detecte áreas que necesitan más entrenamiento.

#### ¿Qué aparece en pantalla?

**1. Hora del resumen diario**
Un selector de hora (de 12:00 AM a 11:00 PM). El dueño elige a qué hora quiere recibir en su WhatsApp el resumen del día: cuántas conversaciones hubo, cuántas el agente resolvió solo, etc.

**2. Horas de silencio**
Dos selectores de hora: "Desde" y "Hasta". Define el rango de tiempo en el que el dueño no quiere recibir notificaciones de la app. Por ejemplo, de 10:00 PM a 7:00 AM para no ser interrumpido de noche. Las situaciones urgentes siempre llegan independientemente de este horario.

**3. Toggle de alertas de entrenamiento**
Un interruptor que activa o desactiva si el agente le avisa al dueño cuando detecta áreas del negocio que necesitan más instrucciones.

#### Cómo funciona el guardado
Cualquier cambio (cambiar una hora, activar o desactivar el toggle) se guarda automáticamente después de 800 milisegundos de inactividad. No hay botón "Guardar". Mientras está guardando, aparece un pequeño spinner junto al título de la pantalla. Cuando termina, aparece una notificación de confirmación breve.

#### Conexiones con otras pantallas
- Botón ← → Pantalla 8 (Hub de Ajustes)

---

## Cómo se conectan las pantallas entre sí

```
Navegación principal (tabs/sidebar)
├── Inicio (/dashboard)
│   ├── → cada conversación en "Actividad reciente" → Chat (/conversations/[id])
│   └── → "Ver bandeja →" → Bandeja (/conversations)
│
├── Conversaciones (/conversations)
│   └── → cada fila → Chat (/conversations/[id])
│           └── → botón ← → Bandeja
│
├── Agente (/agent)
│   ├── → "Historial" → Historial (/agent/history)
│   │       └── → "← Volver" → Agente
│   └── → "Inteligencia" → Inteligencia (/agent/intelligence)
│           ├── → botón ← → Agente
│           └── → "Entrenar" en oportunidades → Agente
│
├── Entrenar (/train)
│   └── → "Ver todo" (historial) → Historial (/agent/history)
│
└── Ajustes (/settings)
    ├── → "Perfil del negocio" → Perfil (/settings/profile)
    ├── → "Autonomía del agente" → Autonomía (/settings/autonomy)
    ├── → "Plan y soporte" → Plan (/settings/plan)
    ├── → "Canal de WhatsApp" → WhatsApp (/settings/whatsapp)
    └── → "Notificaciones" → Notificaciones (/settings/notifications)
        (todas regresan con ← al Hub de Ajustes)
```

---

## Problemas conocidos actualmente

Todos los bugs reportados en sesiones anteriores han sido resueltos. No hay problemas conocidos abiertos en este momento.
