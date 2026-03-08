# AGENTI — Entregable 6 v2.0
## Specs de frontend por módulo

**Versión:** 2.0
**Estado:** Oficial
**Cambios respecto a v1.0:** Adición del principio de dirección de producto para el frontend y del sistema completo de UX Writing con glosario de traducción.
**Destino:** Input directo para Claude Code y Cursor. Este documento contiene todo lo que el agente de desarrollo necesita para construir cada pantalla y componente del producto. No hay referencias técnicas a archivos ni módulos de código: cada spec describe qué construir, por qué, cómo se comporta, qué estados tiene, qué casos borde resuelve, cómo conecta con lo que vino antes y qué habilita hacia adelante.

**Stack confirmado:** Next.js, Supabase, Tailwind CSS, Lucide Icons, Geist + Instrument Serif.

**Orden de construcción:** las specs están organizadas en el orden en que deben construirse. Cada módulo depende de que el anterior esté funcional.

---

## Principio de dirección [NUEVO en v2.0]

Antes de escribir una sola línea de código, el agente de desarrollo debe tener clara esta instrucción de dirección de producto:

**AGENTI debe ser cálido, simple y operativo. Nunca demasiado SaaS. Nunca demasiado consumer.**

El riesgo SaaS es construir algo que funcione pero que rompa la esencia del producto: sidebar pesada, métricas por todos lados, badges de IA, secciones técnicas, tablas, ajustes demasiado visibles, lenguaje de software. Eso destruye la confianza del dueño no técnico aunque el sistema funcione perfectamente.

El riesgo consumer es el contrario: hacer algo visualmente bonito que no tenga estructura operativa. AGENTI no es un juguete ni una demo. Es una herramienta de trabajo diario para operar un negocio real. Necesita claridad, jerarquía y flujos de acción robustos.

El punto medio correcto: una interfaz que se siente como el WhatsApp del dueño con superpoderes. Familiar en sus patrones, capaz en su operación, sin ningún elemento que haga sentir al dueño que está usando software empresarial.

Cada decisión de implementación que no esté explícitamente especificada en este documento debe evaluarse contra esta dirección antes de ejecutarse.

---

## Bloque 0 — Sistema base (construir primero, antes de cualquier pantalla)

Antes de construir cualquier pantalla, el proyecto necesita su andamiaje completo. Esto no es una pantalla: es la infraestructura que hace que todo lo demás funcione.

### 0.1 — Tokens de diseño en Tailwind

Configura el archivo de Tailwind para que todos los tokens del sistema de diseño existan como clases utilitarias. El color primario del producto es un verde esmeralda profundo. El fondo base de la app es un blanco ligeramente cálido, no blanco puro. El color de acento es ámbar. Hay colores funcionales para éxito, advertencia, error e información.

La tipografía usa Geist para todo el UI y reserva Instrument Serif italic para momentos de celebración y display. Configura ambas fuentes en el proyecto. La escala tipográfica sigue proporción de Major Third desde 12px hasta 36px.

El espaciado sigue una escala de base 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Todos los bordes redondeados tienen tokens: 4px para elementos pequeños, 8px para botones e inputs, 12px para tarjetas medianas, 16px para tarjetas grandes y modales, 20px para burbujas de mensaje, y full para avatares y píldoras.

Las sombras usan el tono más oscuro del sistema con opacidad baja para que sean cálidas, no frías. Hay cuatro niveles: sm para tarjetas, md para dropdowns, lg para modales, xl para sheets.

### 0.2 — Layout raíz y navegación

La app tiene una estructura de layout fija. En móvil, el contenido ocupa toda la pantalla con una barra de navegación inferior de 56px más el safe area del dispositivo. En desktop, hay un sidebar izquierdo de 240px siempre visible y el contenido ocupa el resto.

La barra de navegación inferior tiene exactamente cinco destinos: Inicio, Conversaciones, Agente, Entrenar, Ajustes. El destino activo muestra el ícono relleno y el label con el color primario del producto. Los inactivos muestran ícono de contorno y label en gris. Los badges de notificación son círculos rojos en la esquina superior derecha del ícono cuando hay elementos que requieren atención.

La barra de navegación nunca desaparece excepto dentro del hilo de conversación individual en móvil, donde se oculta para dar más espacio al chat y reaparece al hacer scroll hacia arriba.

El sidebar de desktop replica exactamente los cinco destinos con icono, label y badge. En la parte inferior del sidebar hay un item de Ajustes separado del grupo principal por un divisor.

Cada pantalla tiene un header superior de 56px con el título de la sección y máximo dos acciones secundarias a la derecha. El header no scrollea. El contenido debajo del header sí scrollea.

### 0.3 — Componentes base reutilizables

Construye estos componentes antes de cualquier pantalla porque van a aparecer en todas partes.

**Button:** cinco variantes (primary, secondary, ghost, destructive, text) con cuatro estados cada una (default, hover, active, loading, disabled). El botón en estado loading muestra un spinner de 16px en lugar del label y mantiene su ancho para evitar saltos de layout. El botón disabled tiene opacidad reducida pero sigue siendo visible. La altura mínima es 48px en móvil para garantizar área de toque segura.

**Input:** campo de texto con estados default, focus, error y disabled. En focus, el borde cambia al color primario. En error, el borde cambia a rojo y aparece un mensaje de error debajo en texto pequeño. Altura de 48px. Radio de 8px.

**Avatar:** círculo con la inicial del nombre en mayúscula o una imagen si existe. Tres tamaños: 32px, 40px, 48px. El color de fondo es determinístico basado en el nombre del contacto para que el mismo contacto siempre tenga el mismo color.

**Badge:** píldora de texto con cuatro variantes de color: verde para éxito, ámbar para advertencia, rojo para urgente, gris para neutral. Texto en 12px bold. Padding horizontal 8px, vertical 2px.

**Toast:** notificación temporal que aparece en la parte inferior de la pantalla con slide-up y fade-in. Cuatro variantes: éxito (verde), error (rojo), advertencia (ámbar), informativo (azul). Se cierra automáticamente después de 3 segundos para éxito e informativo, 5 segundos para error. El usuario puede cerrarlo tocando.

**Skeleton:** placeholder de carga con efecto shimmer de izquierda a derecha. Disponible en variante de línea de texto (diferentes anchos) y variante de tarjeta de conversación. El color base del skeleton es el fondo muted del sistema.

**Divider:** línea separadora horizontal de 1px en el color de borde del sistema. Puede tener un label centrado opcional para separar secciones con título.

---

## Bloque 1 — Acceso (M0: registro y login)

### 1.1 — Crear cuenta

Esta es la primera pantalla real que ve un usuario nuevo después de la landing. Tiene que ser ligera y rápida. Nada que ralentice el registro.

La pantalla muestra el logo de Agenti en la parte superior, un título en Instrument Serif italic que dice algo como "Tu negocio empieza aquí", y cuatro campos: nombre completo, correo electrónico, contraseña con toggle para mostrar u ocultar, y número de teléfono personal con selector de código de país prefijado en Guatemala (+502).

Debajo de los campos, un párrafo pequeño en texto secundario explica para qué se usa el número personal: para verificar la cuenta y recibir el resumen diario por WhatsApp. Esta nota reduce la fricción de compartir ese dato.

El botón de crear cuenta es primary y ocupa el ancho completo. Después de tocarlo, entra en estado loading mientras el servidor procesa. Si el correo ya existe, aparece un error inline debajo del campo de correo con un link para ir a login. Si hay error del servidor, aparece un toast de error con opción de reintentar.

Al final de la pantalla, un link de texto para ir a login si el usuario ya tiene cuenta.

**Validaciones en tiempo real:** el campo de correo valida formato después de que el usuario sale del campo (blur). La contraseña muestra un indicador de fortaleza debajo del campo mientras el usuario escribe: débil en rojo, media en ámbar, fuerte en verde. El número de teléfono acepta solo dígitos y da formato automático según el país.

**Lo que habilita hacia adelante:** después de crear la cuenta exitosamente, el sistema navega automáticamente a la pantalla de verificación (1.2).

### 1.2 — Verificación por código

El sistema envió un código de verificación al número de WhatsApp que el usuario proporcionó. Esta pantalla captura ese código.

Muestra un header con el número parcialmente oculto al que se envió el código (por privacidad), un campo de seis dígitos con autoenfoque en el primer dígito al cargar la pantalla, y un botón de confirmar que se activa solo cuando los seis dígitos están completos.

El campo de seis dígitos es en realidad un solo input invisible con seis cajas visuales. Cuando el usuario pega un código de 6 dígitos desde el portapapeles, se distribuye automáticamente en las seis cajas. Cuando escribe dígito por dígito, el foco avanza automáticamente al siguiente campo. Cuando borra, el foco retrocede.

Si el código es incorrecto, las seis cajas se agitan horizontalmente (shake animation) y sus bordes cambian a rojo. El código se limpia y el foco vuelve al primer campo.

Si el código expiró, aparece un estado con opción de reenviar. El botón de reenviar tiene un contador de espera de 60 segundos antes de habilitarse de nuevo para evitar spam.

Si el usuario no recibe el código, hay un link de texto que ofrece dos alternativas: reenviar al mismo número o cambiar el número si lo escribió mal.

**Lo que habilita:** verificación exitosa lleva al inicio del onboarding (Bloque 2). El usuario nunca vuelve a esta pantalla en uso normal.

### 1.3 — Login

Dos campos: correo y contraseña con toggle. Botón de login primary a ancho completo. Link de texto para recuperar contraseña. Link de texto para crear cuenta nueva.

Si las credenciales son incorrectas, aparece un error genérico que no especifica si el correo o la contraseña son los incorrectos. Esto es una decisión de seguridad estándar.

Después del tercer intento fallido, aparece un CAPTCHA simple antes de volver a intentar.

**Lo que habilita:** login exitoso navega al home de la app si el onboarding ya fue completado, o al punto donde el onboarding quedó incompleto si no fue terminado.

---

## Bloque 2 — Onboarding (M1.1 a M1.6)

El onboarding es un flujo lineal con barra de progreso en el header. No tiene navegación inferior visible. El usuario avanza hacia adelante; puede retroceder con el botón atrás del header. No puede saltar pasos excepto el de conectar WhatsApp, que tiene opción explícita de omitir temporalmente.

La barra de progreso en el header muestra el paso actual sobre el total. Se actualiza suavemente con cada avance. El botón de retroceder es una flecha a la izquierda del título del paso.

Todos los pasos del onboarding tienen el mismo layout: header con progreso, zona de contenido centrada y vertical, botón de continuar primary al fondo. El botón de continuar solo se activa cuando el paso tiene la información mínima requerida.

### 2.1 — Selección de industria (M1.2)

Una cuadrícula de tarjetas de industria. Cada tarjeta tiene un ícono representativo, el nombre de la industria y un subtexto de 3-4 palabras que describe qué tipo de negocios incluye.

Las industrias disponibles en el MVP son: Restaurante y comida, Salón y estética, Clínica y salud, Tienda y retail, Gimnasio y bienestar, Servicios profesionales, y Otro tipo de negocio.

Al tocar una tarjeta, se selecciona con un borde en color primario y un check en la esquina. Al mismo tiempo, aparece debajo de la cuadrícula un preview de lo que el agente ya sabrá responder con esa plantilla: una lista de 4-5 temas en chips verdes. Esto produce el primer momento de valor percibido antes de terminar el onboarding.

La opción "Otro tipo de negocio" despliega un campo de texto para que el usuario describa su negocio. El sistema intenta mapearlo a una plantilla existente y muestra la mejor coincidencia con opción de confirmar o elegir otra.

El botón de continuar se activa cuando hay una industria seleccionada.

**Lo que habilita:** la industria seleccionada determina la plantilla base que se precarga en el siguiente paso.

### 2.2 — Personalización del negocio (M1.3)

Este paso captura la información base del negocio. Está dividido en bloques que se revelan progresivamente para no abrumar al usuario con un formulario largo de una sola vez.

**Bloque A — Lo esencial:** nombre del negocio, descripción corta de lo que hace (campo de texto libre, máximo 120 caracteres con contador), dirección o zona donde opera.

**Bloque B — Horarios:** una interfaz simple de días de la semana con toggle de activo/inactivo y selector de hora de apertura y cierre. Los horarios de la plantilla de industria ya están precargados como sugerencia; el usuario solo confirma o ajusta.

**Bloque C — Servicios y precios:** el agente necesita saber qué ofrece el negocio. Para evitar la fricción de un formulario de productos, este bloque usa una interfaz conversacional: un campo de texto libre con el placeholder "¿Qué ofreces? Escribe tus servicios o productos principales y sus precios". El usuario puede escribir en lenguaje natural. El sistema extrae la información estructurada y la muestra como lista editable para confirmar. Si el usuario prefiere estructura desde el inicio, puede tocar "Agregar uno por uno" para usar un formulario de ítem por ítem.

**Bloque D — Tono y estilo:** un selector visual de tres estilos de comunicación del agente. Cada opción muestra un ejemplo de cómo respondería el agente a la misma pregunta. Las opciones son: Amigable y cercano, Profesional y directo, o Formal y cuidadoso. El usuario toca el que más se parece a cómo habla su negocio.

Cada bloque tiene un botón de "Continuar" que avanza al siguiente bloque sin cambiar de pantalla. El progreso dentro del paso se muestra con indicadores de punto debajo del contenido activo. El usuario puede tocar un punto anterior para regresar a ese bloque dentro del mismo paso.

El step completo se puede avanzar con información mínima: nombre del negocio y al menos una línea de servicios. Todo lo demás es mejorable después. Un mensaje al fondo del último bloque confirma esto: "Puedes completar y mejorar esta información en cualquier momento desde la app."

**Lo que habilita:** la información capturada aquí define el conocimiento inicial del agente. Es la Capa 1 del modelo de conocimiento.

### 2.3 — Reglas de escalamiento iniciales (M1.4)

Este paso configura en qué situaciones el agente llama al dueño. No se llama "reglas de escalamiento": se llama "¿Cuándo quieres que te llame tu agente?"

Muestra una lista de situaciones comunes con toggles. Las situaciones están precargadas según la industria seleccionada. Para un restaurante podrían ser: reservaciones para grupos grandes, quejas de clientes, preguntas sobre alérgenos, pedidos especiales. Para una clínica: síntomas urgentes, consultas de emergencia, solicitudes de medicamentos.

Cada situación tiene un toggle de activo/inactivo y, al activarse, puede mostrar un campo adicional para personalizar (por ejemplo, "¿A partir de cuántas personas es una reservación grande?").

Al fondo de la lista, un botón de texto "Agregar una situación personalizada" abre un campo para que el usuario describa en lenguaje natural una situación adicional.

Este paso puede completarse sin tocar ningún toggle: las sugerencias de la plantilla ya están activadas por defecto. El usuario solo confirma o ajusta.

### 2.4 — Conectar WhatsApp (M1.5)

Esta pantalla explica qué va a pasar y tiene un solo botón grande: "Conectar mi WhatsApp Business."

La explicación es simple y visual: tres líneas con íconos explicando que el número del negocio es diferente al número personal, que el agente va a responder desde ese número, y que el proceso toma menos de 2 minutos.

Al tocar el botón, se abre el flujo de Meta Embedded Signup en un popup o modal del navegador. El usuario sigue el proceso de Meta directamente. La app espera la confirmación de Meta.

Si la conexión es exitosa, la pantalla muestra un estado de éxito con el número conectado y avanza automáticamente al siguiente paso después de 2 segundos.

Si la conexión falla, muestra el error específico de Meta con opción de reintentar o de omitir este paso. El mensaje explica que sin WhatsApp conectado el agente no puede responder mensajes reales, pero sí puede configurarse y probarse.

Si el usuario toca "Conectar después," avanza al siguiente paso con un indicador persistente en el header del onboarding que recuerda que falta este paso.

**Edge case del número compartido:** si el número que el usuario intenta conectar es el mismo que registró como número personal en el paso 1.1, aparece un mensaje de advertencia antes de abrir el popup de Meta: "Ese parece ser tu número personal. Tu agente funcionará mejor con el número de WhatsApp de tu negocio. ¿Seguro que quieres usar este número?" Con dos opciones: "Sí, usar este número" y "Voy a usar otro número."

### 2.5 — Prueba del agente (M1.6)

Esta es la pantalla más importante del MVP. Recibe toda la atención de diseño y pulido que las demás pantallas combinadas no reciben.

La pantalla se presenta como un chat. En la parte superior, una burbuja del sistema explica el contexto: "Tu agente ya conoce lo básico de tu negocio. Escríbele como si fueras un cliente y ve cómo responde."

El hilo empieza vacío. Debajo del hilo hay dos elementos: un campo de texto con el placeholder "Escribe como si fueras tu cliente..." y una fila de chips de preguntas sugeridas según la industria. Por ejemplo, para un restaurante: "¿A qué hora abren?", "¿Tienen menú del día?", "¿Aceptan reservaciones?". Tocar un chip pone esa pregunta en el campo y la envía automáticamente.

Cuando el usuario envía un mensaje, aparece como burbuja de cliente (izquierda). Aparece un indicador de escritura del agente (tres puntos pulsantes) por 1-2 segundos. Luego aparece la respuesta del agente como burbuja de respuesta (derecha, con color distinto al primario para distinguirlo del modo operativo).

Cada burbuja de respuesta del agente tiene un botón pequeño de "Corregir" en la esquina inferior. Al tocarlo, aparece un campo de corrección con el texto original pre-cargado y la instrucción "¿Cómo debería haber respondido?" El dueño edita y confirma. El agente aprende de esa corrección antes de que el onboarding termine.

Si el usuario intenta avanzar sin haber probado ni una sola pregunta, aparece un nudge suave: "¿Ya probaste a tu agente? Es la mejor forma de ver si está listo." Con un botón "Probar ahora" y otro "Continuar de todas formas."

Si el usuario quiere salir con una respuesta que no le convenció, el sistema interpreta esa señal y muestra: "¿Algo no salió como esperabas? Cuéntanos qué pasó." Con un campo de texto y opción de contactar soporte o ver cómo mejorar al agente.

El botón de "Mi agente está listo" aparece después de al menos una prueba exitosa. Si el usuario aún no probó, el botón dice "Continuar" con menor énfasis visual.

### 2.6 — Activación (M1.6 final)

Una pantalla de celebración. Usa Instrument Serif italic para el título. Mensaje central: el agente está listo y funcionará en modo colaborador — va a preparar respuestas pero el dueño decide qué se envía.

Tres íconos con texto corto explican el modo colaborador en términos operativos: verás sugerencias de respuesta, tú decides si se envían, tu agente aprende de cada corrección que hagas.

Si el WhatsApp ya está conectado: botón primary "Empezar a supervisar mi negocio" que lleva al home.

Si el WhatsApp no está conectado: dos botones. El primary dice "Conectar WhatsApp ahora" y el secundario dice "Explorar la app primero." Los dos llevan al home, pero el primero abre el flujo de conexión de WhatsApp como sheet sobre el home.

---

## Bloque 3 — Home y operación diaria (M2.1 a M2.5)

### 3.1 — Home / Command Center (M2.1)

El home es la pantalla raíz de la app. Es la primera pantalla que ve el dueño cada vez que abre la app después del onboarding.

**Zona superior — Estado del agente (AgentStatusBar):**
Una fila completa de ancho que muestra el estado actual. El estado depende de lo que está pasando en el sistema y cambia dinámicamente.

Si todo está bien: punto verde con animación pulse de 2 segundos infinita + texto: "Tu agente está activo. Atendió [N] conversaciones hoy." Sin ningún elemento de navegación en esta zona.

Si hay conversaciones pendientes de aprobación: punto ámbar estático + texto con el contador: "Hay [N] respuestas esperando tu aprobación." Toda la fila es tocable y lleva a la bandeja filtrada por pendientes.

Si el agente tiene temas sin cubrir: punto ámbar + ícono de libro pequeño + texto: "A tu agente le falta información en [N] temas." Toda la fila es tocable y lleva al estado del agente (M3.2).

Si hay un escalamiento urgente activo: la zona superior se reemplaza completamente por un banner de urgencia. Fondo rojo suave, borde izquierdo de 3px en rojo oscuro, ícono de alerta, nombre del cliente y descripción en una línea, botón "Atender ahora" que lleva directamente a esa conversación. Este banner no desaparece hasta que el dueño atiende el escalamiento.

Si el agente está desconectado: punto rojo + texto de desconexión + botón "Reconectar" que abre el flujo de reconexión de WhatsApp como sheet.

**Zona media — Instrucción rápida (QuickInstruct):**
Un campo de texto con placeholder rotativo que cambia cada 4 segundos entre ejemplos reales y contextuales según la industria del negocio. A la derecha del campo hay dos íconos: micrófono y clip para adjuntar.

El campo tiene la misma altura visual que el campo de texto de WhatsApp: 52px en estado colapsado, con radio de 16px y borde en el color de borde del sistema.

Al tocar el campo, se expande verticalmente a 120px mínimo para escritura cómoda. El placeholder desaparece. Aparece un contador de caracteres en la esquina inferior derecha y un botón de enviar en la misma esquina. La expansión tiene una transición suave de 200ms.

Al tocar el ícono de micrófono, el campo se convierte en grabadora de voz. Un indicador de onda muestra que está grabando. Un contador de tiempo muestra la duración. El botón de enviar se convierte en botón de detener. Al detener, aparece la transcripción en texto para revisar antes de confirmar. El dueño puede editar el texto transcrito si hay errores antes de enviarlo.

Al tocar el ícono de clip, aparece un sheet con tres opciones: "Foto o imagen del negocio", "Documento o PDF", y "Pegar un link". Cada opción lleva a su flujo correspondiente.

Después de enviar una instrucción, el campo se reemplaza por el estado de confirmación del agente: una zona de 80px de altura con fondo verde muy suave que muestra la respuesta del agente confirmando lo que entendió y dos botones: "Sí, correcto" y "No, déjame explicar." Esta zona tiene altura fija para no generar layout shift. Después de confirmar, la zona desaparece y el campo regresa a su estado neutro.

**Zona inferior — Bandeja resumida:**
Un bloque que muestra máximo cinco conversaciones que requieren acción, en el formato del componente ConversationItem. Cada ítem muestra el estado de la conversación con su etiqueta de color correspondiente.

Al fondo de esta zona, un botón de texto "Ver todas las conversaciones" que lleva a la bandeja completa (M2.2).

Si no hay conversaciones pendientes, la zona muestra un estado vacío positivo: "Tu agente está al día." con el total de conversaciones resueltas hoy como línea secundaria.

**Primera vez post-onboarding:** en el primer acceso al home, una capa de bienvenida contextual presenta los tres elementos del home con puntos de orientación. No es un tour modal: son etiquetas flotantes con flechas que señalan cada zona y texto explicativo corto. Desaparece después de que el dueño toca cualquier elemento o después de 24 horas.

### 3.2 — Bandeja de conversaciones (M2.2)

La bandeja ocupa toda la pantalla. Header con el título "Conversaciones" y a la derecha un ícono de búsqueda y un ícono de filtro.

**Tres secciones con separación visual:**

Sección "Necesitan tu atención": título de sección en texto secundario pequeño. Lista de ConversationItems con etiquetas de acción requerida. Los ítems de escalamiento urgente aparecen primero, luego sensibles, luego aprobaciones pendientes. Si la sección está vacía, no ocupa espacio en pantalla.

Sección "Atendidas": título de sección. Lista de ConversationItems sin etiqueta de acción. Orden cronológico inverso. Mostramos el ícono del agente pequeño en el ítem si el agente la resolvió solo, o el ícono del dueño si fue aprobada manualmente.

Sección "Archivadas": colapsada por defecto con un botón de texto "Ver archivadas ([N])". Al expandir, muestra la lista completa.

**Filtros rápidos:** una fila de chips debajo del header para filtrar: Todas, Por aprobar, Escaladas, Resueltas. El chip activo tiene fondo primario suave y texto primario. Los inactivos tienen fondo muted y texto secundario.

**Búsqueda:** al tocar el ícono de búsqueda, el header se transforma en un campo de búsqueda activo con autoenfoque. Los resultados reemplazan la vista de secciones. Al cerrar la búsqueda, la vista de secciones regresa con una transición suave.

**Aprobación rápida en el ítem:** en los ítems de la sección "Necesitan tu atención" que tienen sugerencia pendiente de alta confianza, aparece un botón pequeño "Aprobar" a la derecha del ítem, alineado al fondo. Este botón ejecuta la aprobación sin entrar al detalle de la conversación. Con feedback visual de éxito inmediato: el ítem se anima con un slide-out suave hacia la derecha y desaparece de la sección, luego reaparece en "Atendidas" con una animación de slide-in. El contador de pendientes en el badge de la tab de navegación se actualiza al mismo tiempo.

**Estado vacío:** si la sección "Necesitan tu atención" está vacía y el dueño llega desde el home, la pantalla muestra el estado vacío positivo con el resumen del día.

### 3.3 — Vista de conversación individual (M2.3)

El header de esta pantalla muestra el nombre del cliente, el estado de la conversación como badge de color, y a la derecha un ícono de información que abre el panel de detalle del cliente.

En móvil, la barra de navegación inferior se oculta al entrar a esta vista para maximizar el espacio del hilo. Reaparece al hacer scroll hacia arriba.

**El hilo de mensajes:**

Los mensajes del cliente aparecen a la izquierda con fondo gris claro y radio de burbuja completo excepto en la esquina inferior izquierda que tiene radio pequeño.

Los mensajes del agente aparecen a la derecha con el fondo primario muy suave (no el color primario completo, sino una versión muy desaturada) y un ícono pequeño de robot de 12px en la esquina inferior derecha de la burbuja.

Los mensajes del dueño aparecen a la derecha con el fondo primario completo y texto blanco. Sin ícono adicional.

Los mensajes del sistema (explicaciones de escalamiento, respuestas de espera enviadas automáticamente) aparecen centrados, sin burbuja, en texto secundario pequeño con fondo muted. Por ejemplo: "Tu agente no tenía esta información. Se envió una respuesta de espera al cliente."

Los timestamps aparecen entre grupos de mensajes cuando hay más de 15 minutos de diferencia entre uno y otro. Texto secundario pequeño centrado.

Si la conversación tiene más de 20 mensajes, el hilo carga los últimos 20 y muestra un botón en la parte superior para cargar mensajes anteriores. Ese botón no bloquea el scroll del hilo.

**Panel de información del cliente:**

En móvil, se abre como un sheet desde abajo al tocar el ícono de información. Ocupa el 60% inferior de la pantalla. Tiene un handle de arrastre en la parte superior. Se cierra arrastrando hacia abajo.

Muestra: nombre y número de teléfono, fecha del primer mensaje al negocio, total de conversaciones históricas, y las últimas tres interacciones resumidas en una línea cada una.

**Zona inferior fija:**

Si hay sugerencia pendiente, muestra el componente AgentSuggestion completo (zona de acciones con aprobar / editar / rechazar).

Si no hay sugerencia, muestra el campo de escritura directa del dueño.

Si la conversación está archivada o resuelta, muestra un mensaje de estado y el botón de reabrir.

### 3.4 — Modo colaborador en detalle (M2.4)

Este es el componente AgentSuggestion dentro de la vista M2.3. Su comportamiento completo está descrito en el sistema de diseño, pero aquí detallamos los flujos de interacción precisos.

**Flujo de aprobación:**

El dueño toca "Aprobar." El botón entra en estado loading por máximo 500ms. Si la respuesta del servidor llega antes, el loading es invisible. La burbuja de sugerencia ejecuta una animación de slide-up con fade-out simultáneo (200ms ease-out). La misma respuesta aparece en el hilo como mensaje del dueño con slide-in desde la derecha (200ms ease-in). El componente AgentSuggestion desaparece. Si había otra sugerencia pendiente en la misma conversación, el componente se actualiza con la nueva sugerencia con un fade-in.

No hay toast, no hay confirmación verbal. La animación es la confirmación. Este principio es innegociable para la fluidez del flujo de aprobación.

**Flujo de edición:**

El dueño toca "Editar." El texto de la sugerencia dentro de la burbuja se convierte en campo editable con cursor al final del texto. El teclado sube con animación estándar del sistema operativo. El layout se ajusta para que el campo de edición sea visible por encima del teclado.

El campo tiene un botón "Cancelar" en la parte superior que restaura la sugerencia original y sale del modo edición. Tiene un botón "Enviar" en la esquina inferior derecha del campo.

Al enviar la edición, el flujo es idéntico al de aprobación en términos de animación. Adicionalmente, 5 segundos después de que el mensaje fue enviado, aparece una zona de clasificación debajo del hilo con la pregunta "¿Quieres que tu agente recuerde esto?" y tres botones compactos: "Solo esta vez", "Siempre", "Por ahora". Esta zona tiene animación de slide-up al aparecer. Si el dueño no interactúa en 5 segundos, la zona desaparece automáticamente con slide-down y la corrección se clasifica como puntual.

Si el dueño toca "Por ahora", los tres botones se reemplazan por un selector de fecha con opciones predefinidas: "Hasta mañana", "Esta semana", "Este mes", y "Elegir fecha". Al confirmar la fecha, aparece una confirmación del agente en el hilo como mensaje del sistema: "Entendido. Usaré esta respuesta hasta el [fecha]."

**Flujo de rechazo:**

El dueño toca "Rechazar." La burbuja de sugerencia desaparece con fade-out (150ms). El campo de escritura directa aparece con fade-in (150ms) y cursor activo. El dueño escribe su propia respuesta. Al enviarla, el flujo de clasificación de corrección aparece igual que en el caso de edición.

Si el dueño toca "Rechazar" y no escribe nada en más de 30 segundos, la conversación se marca como "Pendiente de respuesta manual" con una nota discreta debajo del hilo.

**Aprobación agrupada:**

No ocurre dentro de la vista de conversación individual. Ocurre como banner en la bandeja M2.2 y como opción en el home. Al activarla, se abre una vista de lista simplificada donde el dueño ve cada conversación agrupada con su sugerencia visible. Hay un botón "Aprobar esta" por ítem y un botón "Aprobar todas" al fondo de la vista.

### 3.5 — Escalamiento y acción urgente (M2.5)

Los tres tipos de escalamiento (informativo, sensible, urgente) son estados de la vista de conversación individual M2.3, no pantallas separadas. Se diferencian en el banner de contexto y en las acciones disponibles.

**Escalamiento informativo:**

El EscalationBanner aparece entre los mensajes del hilo, anclado justo después del último mensaje del cliente. Fondo ámbar muy suave, borde izquierdo de 2px en ámbar. Ícono `alert-circle`. Texto: "Tu agente no tenía esta información para responder." Una línea secundaria en texto terciario explica específicamente qué faltó.

Debajo del banner, dos acciones como botones secondary: "Responder ahora" (abre el campo de escritura directa) y "Agregar información al agente" (abre el sheet de instrucción rápida M3.1 pre-configurado para ese tema).

**Escalamiento sensible:**

El EscalationBanner tiene fondo ámbar medio, borde izquierdo de 2px en ámbar oscuro. Ícono `alert-triangle`. Texto: "Esta conversación necesita tu criterio." El banner es colapsable: un ícono de chevron en la esquina derecha lo expande o colapsa. Por defecto está expandido.

Expandido muestra el contexto que el agente detectó: el tipo de situación (queja, negociación, solicitud especial) y una breve descripción de lo que detectó como sensible.

Debajo del banner, dos o tres opciones de respuesta pre-redactadas en botones secondary. Cada botón muestra las primeras palabras de la opción y al tocarlo expande el texto completo para editar antes de enviar.

**Escalamiento urgente:**

Si el dueño llega a la conversación desde el banner de urgencia del home o desde la notificación push, el EscalationBanner ya está visible y expandido. Fondo rojo suave, borde izquierdo de 3px en rojo oscuro. Ícono `alert-octagon`. Texto en negrita: "Situación urgente." El contexto del agente aparece expandido.

Una nota del sistema en el hilo indica que el agente ya envió una respuesta de contención al cliente con el texto exacto de esa respuesta.

El campo de escritura directa está activo y en foco. El dueño puede responder inmediatamente.

Una vez que el dueño envía una respuesta, el banner cambia a estado resuelto con fondo verde suave y texto: "Atendiste esta situación." El badge en el header cambia a verde y la conversación queda marcada.

---

## Bloque 4 — Agente y entrenamiento (M3.1 a M3.3)

### 4.1 — Estado del agente (M3.2)

La pantalla de estado del agente es el mapa de competencias del agente. Muestra cuánto sabe el agente sobre cada área del negocio.

El header tiene el título "Tu agente" y a la derecha un ícono de historial que lleva a M3.3.

Un resumen en la parte superior de la pantalla: una frase en texto base que cuantifica el estado general. Por ejemplo: "Tu agente conoce bien 4 de 7 temas de tu negocio." Esta frase actualiza dinámicamente.

Debajo, la lista de temas con el componente SkillIndicator para cada uno. La lista está ordenada: los temas en rojo primero, los amarillos después, los verdes al fondo. Esto refleja prioridad de entrenamiento.

Cada SkillIndicator muestra el nombre del tema, la barra de progreso con color según el estado, el badge de estado en texto humano, y los botones de acción directa para los temas en rojo o amarillo.

Al tocar un SkillIndicator, se expande para mostrar más detalle: el número de conversaciones del agente en ese tema en los últimos 7 días, el porcentaje de respuestas aprobadas sin edición, y una lista de las últimas preguntas de clientes sobre ese tema. Esta expansión es un accordion con animación de slide-down.

**Sugerencia de autonomía:** si el tema está en verde y todos los indicadores de evidencia están en positivo, aparece dentro del SkillIndicator expandido un elemento especial: "¿Quieres que tu agente responda solo en este tema?" con un botón "Activar autonomía" que abre el modal de M4.3.

### 4.2 — Instrucción rápida y entrenamiento (M3.1)

En el home, el componente QuickInstruct es el punto de entrada a M3.1. Pero M3.1 también existe como pantalla completa accesible desde la sección "Entrenar" de la navegación y desde los botones de acción directa en M3.2.

Cuando se abre como pantalla completa, tiene el header "Entrena a tu agente" con un botón de cerrar.

La pantalla muestra el historial de instrucciones recientes en el formato de burbujas de chat: instrucción del dueño a la derecha, confirmación del agente a la izquierda. Esto permite al dueño ver qué le ha enseñado al agente recientemente.

En la parte inferior, el mismo componente QuickInstruct que existe en el home. Funciona exactamente igual.

Si M3.1 se abre pre-configurado desde un botón de acción de escalamiento, el campo de instrucción rápida tiene un contexto pre-cargado: "Tu cliente preguntó sobre [tema]. Dile a tu agente qué responder:" El dueño puede editar ese contexto o responder directamente.

### 4.3 — Historial de aprendizaje (M3.3)

Una pantalla de solo lectura que muestra el historial de correcciones e instrucciones que el agente ha recibido. Es la herramienta de auditoría del dueño para entender qué está aprendiendo su agente y qué puede estar aprendiendo mal.

Lista de ítems en orden cronológico inverso. Cada ítem muestra: la fecha y hora, el tipo de evento (corrección de sugerencia, instrucción rápida, corrección de prueba), el contenido de lo que se enseñó en una línea truncada, y la clasificación de vigencia (permanente, temporal con fecha, puntual).

Al tocar un ítem, se expande para mostrar el contexto completo: la conversación que generó la corrección o el texto completo de la instrucción, la respuesta del agente confirmando el aprendizaje, y opciones para cambiar la clasificación de vigencia o deshacer el aprendizaje.

La opción de "Deshacer aprendizaje" tiene un modal de confirmación: "¿Quieres que tu agente deje de usar esta información?" con la acción y sus consecuencias explicadas en lenguaje simple.

Un filtro en el header permite ver todos los eventos o filtrar por tipo (solo correcciones, solo instrucciones).

### 4.4 — Oportunidades de entrenamiento (dentro de "Entrenar")

Una sección dentro de la pantalla principal de "Entrenar" que aparece debajo del acceso a la instrucción rápida y del historial reciente.

Muestra una lista de oportunidades detectadas por el sistema: preguntas repetidas sin respuesta, temas en rojo con alta frecuencia, y temas donde el dueño corrige frecuentemente las mismas sugerencias.

Cada oportunidad es una tarjeta con el tema, la cantidad de ocurrencias en los últimos 7 días, y un botón de acción directa que abre M3.1 pre-configurado para ese tema.

Si no hay oportunidades detectadas, esta sección muestra un estado positivo: "Tu agente está bien entrenado por ahora. Aparecerán sugerencias cuando tus clientes pregunten algo que tu agente no sepa."

---

## Bloque 5 — Configuración (M4.1 a M4.5)

La sección de Ajustes está intencionalmente por debajo en jerarquía visual. El header dice "Ajustes" y el contenido se organiza como grupos de ítems con separadores.

### 5.1 — Perfil del negocio (M4.1)

Un formulario de edición de la información básica del negocio. Los mismos campos que en M1.3 del onboarding. Modo lectura por defecto con un botón "Editar" en el header que activa el modo edición.

En modo edición, los campos son editables con los mismos componentes de input del sistema. El botón del header cambia a "Guardar" y aparece un botón "Cancelar" a su lado. Al guardar, los cambios se aplican inmediatamente y una toast de éxito confirma.

### 5.2 — Canal de WhatsApp (M4.4)

Muestra el estado actual de la conexión: número conectado, fecha de conexión, estado del token. Si está conectado, el indicador es verde. Si está desconectado o el token está por expirar, el indicador es rojo o ámbar con el botón de acción correspondiente.

Botón "Cambiar número" para reconectar con otro número. Botón "Desconectar" para desvincular el canal. Ambas acciones tienen modal de confirmación porque tienen consecuencias operativas inmediatas.

### 5.3 — Notificaciones (M4.5)

Tres ajustes de notificación en lenguaje humano:

"¿A qué hora quieres recibir tu resumen diario por WhatsApp?" con un selector de hora. Default 8 PM.

"¿Cuándo prefieres no recibir avisos?" con selectores de hora de inicio y fin de la ventana de silencio. Default 10 PM a 7 AM. Una nota debajo: "Las situaciones urgentes siempre te llegarán."

"Avisarme cuando mi agente necesite aprender algo nuevo." Toggle. Default activo.

### 5.4 — Autonomía por tema (M4.3)

Una lista de los mismos temas que en M3.2 pero enfocada en configuración de autonomía. Cada tema muestra el nivel de autonomía actual y los tres indicadores de evidencia.

Si todos los indicadores están en verde para un tema, el sistema muestra una sugerencia proactiva inline: "Tu agente está listo para responder solo en este tema."

Al tocar un tema, se expande con un slider de nivel de autonomía: Nivel 0 (colaborador, siempre sugiere), Nivel 1 (autónomo cuando está seguro, sugiere si tiene dudas), Nivel 2 (autónomo casi siempre, solo escala casos extremos).

Cambiar de Nivel 0 a Nivel 1 requiere confirmación con un modal que muestra los tres indicadores de evidencia. Cambiar de vuelta a Nivel 0 es instantáneo, sin confirmación.

### 5.5 — Plan y soporte (M4.5)

Plan actual con el nombre del plan, el período de facturación y el uso del mes: conversaciones usadas sobre el límite del plan con una barra de progreso. Al 80% de uso, la barra cambia de color a ámbar. Al 100%, a rojo con mensaje de alerta.

Botón "Ver opciones de plan" que muestra los planes disponibles con sus precios y diferencias. Esta es una vista de solo lectura con un botón "Hablar con nosotros" para proceso de upgrade asistido en el MVP.

Sección de soporte: un botón "Enviar mensaje" que abre un campo de texto para enviar una consulta al equipo. Un link de texto "Ver preguntas frecuentes" que abre una vista de FAQ básica.

---

## Bloque 6 — Inteligencia (M5.1 y M5.2)

La sección de inteligencia vive dentro de la tab "Agente" de la navegación, como una subsección debajo del estado del agente.

### 6.1 — Resumen de actividad (M5.1)

Cuatro métricas en lenguaje humano presentadas como tarjetas:

"Tu agente atendió [N] conversaciones esta semana." Con comparativo con la semana anterior en una línea secundaria: "Más que la semana pasada" o "Igual que la semana pasada" con el porcentaje de diferencia.

"Resolvió solo [N] de [Total]. ([X]%)" Con barra de progreso mostrando el porcentaje.

"Te ahorró aproximadamente [X] horas." Con una nota explicando el cálculo en texto terciario muy pequeño.

"[N] temas necesitan más información." Con botón de acción directa.

Un selector de período en el header: Esta semana, Este mes, Todo el tiempo.

No hay gráficas en el MVP. Las métricas son numéricas y en lenguaje del dueño. Las gráficas se introducen cuando hay suficientes datos históricos para que tengan sentido (Fase 2).

### 6.2 — Oportunidades de entrenamiento (M5.2)

Ya documentado en 4.4. Este módulo comparte datos con la sección de Entrenar. La diferencia es que en M5.2 el contexto es analítico (detectadas por el sistema en el período) y en la sección de Entrenar el contexto es operativo (qué hacer ahora).

---

## Dashboard de primera vez (post-onboarding)

Esta es una variante del home que aplica únicamente en las primeras 24 horas después de la activación.

Se diferencia del home normal en que tiene una zona adicional entre el estado del agente y el componente de instrucción rápida: un bloque de "Próximos pasos recomendados."

Este bloque muestra entre 2 y 4 acciones recomendadas basadas en lo que faltó completar durante el onboarding o en lo que el sistema detecta que el agente todavía no tiene bien cubierto. Cada acción es una tarjeta con icono, título corto, tiempo estimado en minutos, y botón de acción directa.

Ejemplos de acciones recomendadas: "Completa tus precios (3 min)", "Agrega tu menú del día (2 min)", "Conecta tu WhatsApp (5 min)", "Prueba a tu agente con más preguntas (5 min)."

Al completar todas las acciones recomendadas, el bloque desaparece y el home queda en su estado normal. También desaparece después de 24 horas aunque no se hayan completado todas, sin mostrar ninguna señal de que algo quedó incompleto: el dueño puede encontrar esas acciones en la sección de Entrenar y en Ajustes cuando quiera.

---

## UX Writing — Glosario y principios de copy [NUEVO en v2.0]

Este bloque es tan importante como cualquier spec de pantalla. Sin él, el agente de desarrollo toma decisiones de copy individuales que producen inconsistencia entre pantallas y filtran jerga técnica que el dueño no debe ver nunca.

### Principios de redacción

**Verbos concretos, no sustantivos abstractos.** "Aprueba esta respuesta" no "Aprobación de respuesta pendiente". "Dile algo nuevo a tu agente" no "Actualización de base de conocimiento".

**Beneficio antes que mecanismo.** Primero qué cambia para el dueño, después cómo funciona si es necesario. "Tu agente ya puede responder preguntas sobre horarios" no "Configuración de intent de horarios completada".

**Siempre decir qué pasa después.** Cada confirmación debe incluir la consecuencia. "Listo. Tu agente usará esto desde ahora" no solo "Guardado."

**Reducir ansiedad en pasos sensibles.** En cualquier paso que requiere una decisión con consecuencias, el copy debe recordar que se puede cambiar después: "Puedes modificar esto en cualquier momento."

**Tono:** claro, directo, tranquilo, útil, humano. Nunca corporativo. Nunca "AI hype". Nunca condescendiente.

### Glosario de traducción obligatorio

Este glosario es una lista de términos técnicos que el sistema puede generar internamente y que nunca deben aparecer en la interfaz del dueño. A la derecha está la traducción correcta al lenguaje del producto.

| Término técnico — NUNCA mostrar | Traducción al lenguaje del dueño |
|---|---|
| Configurar Meta Cloud API | Conectar tu WhatsApp |
| Low confidence response | Tu agente no está seguro de esta respuesta |
| Manual review required | Revisa esta respuesta antes de enviarla |
| Capabilities initialized | Tu agente ya puede responder [tema] |
| Knowledge base | Lo que sabe tu agente |
| Intent detected | Tu agente entendió que el cliente pregunta sobre [tema] |
| Training / fine-tuning | Entrenar a tu agente |
| Confidence score: 0.87 | Tu agente está bastante seguro de esta respuesta |
| Confidence score: 0.43 | Revisa esto con cuidado |
| Escalation triggered | Tu agente necesita tu ayuda |
| Webhook error | Tu agente no pudo conectarse. Reintentando... |
| Token expired | La conexión de WhatsApp necesita renovarse |
| Rate limit exceeded | Tu agente está muy ocupado en este momento. Intenta de nuevo en un momento |
| RAG retrieval failed | Tu agente no encontró la información. Puedes agregarla aquí |
| Null response | Tu agente no tuvo respuesta para esta pregunta |
| Model inference | Tu agente está preparando una respuesta |
| Batch processing | Tu agente está procesando las conversaciones acumuladas |
| API key invalid | Hay un problema con la conexión. Contacta soporte |

### Fórmulas de copy para estados recurrentes

**Confirmación de aprendizaje:** "Listo. A partir de ahora tu agente [describe el cambio en términos operativos]."
Ejemplo: "Listo. A partir de ahora tu agente va a decir que cierran a las 8 PM."

**Sugerencia de autonomía:** "Tu agente lleva [N] respuestas sobre [tema] sin ninguna corrección. ¿Quieres que responda solo en ese tema?"

**Escalamiento con contexto:** "Tu agente necesita tu ayuda. [Nombre del cliente] preguntó algo sobre [tema] y tu agente no tenía la respuesta."

**Estado vacío positivo:** "Todo al día. Tu agente no tiene conversaciones pendientes." Nunca "No hay datos" ni "Sin resultados."

**Error recuperable:** "Algo salió mal al [acción]. [Botón: Intentar de nuevo]" — siempre con botón de acción, nunca solo texto de error.

**Guardado exitoso:** "Listo." — una palabra es suficiente cuando el contexto es claro. No "¡Cambios guardados exitosamente! Tu configuración ha sido actualizada."

**Primer uso de cada sección:** una línea de orientación en texto secundario que desaparece después de la primera interacción. Nunca un tour modal.

---

Estas reglas aplican en todos los bloques y no tienen excepciones.

**Optimistic UI en todas las acciones de aprobación:** la respuesta visualmente se muestra como enviada antes de recibir confirmación del servidor. Si el servidor falla, el estado se revierte con un toast de error y opción de reintentar. Nunca mostrar un estado de carga antes de que la acción se refleje visualmente.

**Skeleton loading en todas las cargas de datos:** nunca un spinner en el centro de la pantalla para la carga de listas. Siempre skeleton con shimmer. El spinner solo se usa en acciones puntuales (botones en estado loading).

**No hay pantallas de error sin salida:** cualquier pantalla de error, mensaje de fallo o estado de problema tiene siempre al menos una acción que el usuario puede tomar: reintentar, ir al inicio, o contactar soporte.

**Los datos nunca se pierden:** si un formulario falla al guardar, los datos ingresados por el usuario se conservan en el estado local del componente. Si el usuario navega a otra pantalla accidentalmente mientras edita algo, aparece un diálogo de confirmación: "¿Salir sin guardar?" con botones "Guardar cambios" y "Descartar." Si el usuario cierra la app, los cambios se restauran al volver.

**El teclado nunca tapa los botones de acción:** en todas las pantallas con campos de texto, el layout se ajusta con `adjustResize` o su equivalente en Next.js para que el botón de enviar o confirmar siempre sea visible por encima del teclado.

**Safe area siempre respetada:** en todos los dispositivos con notch, isla dinámica o gestos de navegación por el sistema operativo, todos los elementos de la interfaz respetan los safe areas con `env(safe-area-inset-*)`.

**El idioma es español de Guatemala siempre:** ningún texto de interfaz en inglés visible para el usuario. Los textos de error técnico del sistema que lleguen del servidor se transforman a lenguaje humano antes de mostrarse al dueño. No hay excepción.

---

*AGENTI — Entregable 6 v2.0 — Specs de frontend por módulo*
