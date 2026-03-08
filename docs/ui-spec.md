# AGENTI — Entregable 5 v1.0
## Arquitectura de UI y sistema de diseño

**Versión:** 1.0
**Estado:** Oficial
**Alcance:** Principios visuales, sistema de color, tipografía, espaciado, componentes core, patrones de interacción, estados del sistema, densidad de información y reglas de layout. Este documento es el input directo para las specs de frontend que van a Claude Code. No hay diseño que se tome antes de que este sistema esté definido.

---

## Identidad visual: la decisión de dirección

Antes de cualquier token de diseño, hay una decisión de dirección que lo gobierna todo.

AGENTI no es un SaaS corporativo. No es una herramienta enterprise. Es el WhatsApp del dueño con superpoderes. Esa frase no es solo copy de producto: es una instrucción de diseño.

WhatsApp como referencia de familiaridad: el dueño ya sabe cómo funciona una bandeja de mensajes, cómo se ve un hilo de conversación, qué significa un tick de entregado. No hay que enseñarle esos patrones. Hay que extenderlos.

Superpoderes como diferencial visual: lo que Agenti agrega encima de esa familiaridad debe sentirse capaz, moderno y ligeramente mágico. Sin ser intimidante. Sin verse como software de empresa.

La dirección de diseño resultante es esta: **bold simplicity con calidez humana**. Interfaces limpias con alta jerarquía, poca decoración, mucho espacio respiratorio, tipografía expresiva, y un sistema de color que se siente vivo sin ser ruidoso. Lo contrario de un dashboard de analytics. Lo contrario de un chatbot corporativo.

Las referencias de nivel de ejecución son Linear, Raycast y el nuevo Revolut. No para copiarlos: para aspirar a su nivel de intencionalidad visual y funcional.

---

## Sistema de color

### Paleta base

El sistema de color tiene tres capas: colores de identidad, colores funcionales y colores de superficie. Cada capa tiene un propósito distinto y no se mezclan.

**Colores de identidad**

El color primario de Agenti es un verde profundo con tendencia al esmeralda. No es el verde de WhatsApp (eso sería confusión intencional). Es un verde más oscuro, más sofisticado, que evoca confianza y presencia sin los connotaciones de mensajería masiva.

```
--color-primary-900: #0D3B2E   /* Texto sobre fondo primario */
--color-primary-800: #145C45   /* Hover de elementos primarios */
--color-primary-700: #1A7A5C   /* Color primario base — botones, acciones principales */
--color-primary-600: #22A075   /* Primary light — estados activos */
--color-primary-100: #E8F7F2   /* Primary tint — fondos de elementos seleccionados */
--color-primary-50:  #F2FBF7   /* Primary ultra-light — hover backgrounds */
```

El color de acento es un ámbar cálido. Se usa exclusivamente para indicadores de atención requerida (sugerencias pendientes, estados amarillos) y para el indicador de confianza media. Su temperatura cálida contrasta con el verde frío del primario sin pelear con él.

```
--color-accent-700: #B45309    /* Ámbar oscuro — texto de alerta */
--color-accent-500: #F59E0B    /* Ámbar base — indicadores amarillos */
--color-accent-100: #FEF3C7    /* Ámbar tint — fondos de alerta baja */
```

**Colores funcionales**

Los colores funcionales son de uso estrictamente semántico. No se usan decorativamente.

```
/* Estado: éxito / resuelto / activo */
--color-success-700: #15803D
--color-success-500: #22C55E
--color-success-100: #DCFCE7

/* Estado: advertencia / atención / pendiente */
--color-warning-700: #B45309
--color-warning-500: #F59E0B
--color-warning-100: #FEF3C7

/* Estado: error / urgente / desconectado */
--color-error-700: #B91C1C
--color-error-500: #EF4444
--color-error-100: #FEE2E2

/* Estado: información / neutral */
--color-info-700: #1D4ED8
--color-info-500: #3B82F6
--color-info-100: #DBEAFE
```

**Colores de superficie**

Las superficies son lo que más se ve en pantalla. Su sistema define la profundidad visual de la app.

```
/* Modo claro */
--surface-background: #FAFAF9    /* Fondo base de la app — ligeramente cálido, no blanco puro */
--surface-card: #FFFFFF          /* Tarjetas y contenedores elevados */
--surface-elevated: #FFFFFF      /* Modales, sheets, dropdowns */
--surface-muted: #F5F5F4         /* Fondos de secciones secundarias */
--surface-border: #E7E5E4        /* Bordes y separadores */
--surface-border-strong: #D6D3D1 /* Bordes con mayor contraste */

/* Texto */
--text-primary: #1C1917          /* Texto principal — casi negro cálido */
--text-secondary: #78716C        /* Texto secundario — marrón medio */
--text-tertiary: #A8A29E         /* Texto terciario — metadatos, placeholders */
--text-inverse: #FAFAF9          /* Texto sobre fondos oscuros */
--text-disabled: #D6D3D1         /* Texto deshabilitado */
```

El fondo base `#FAFAF9` es un blanco con temperatura cálida casi imperceptible. No es blanco puro (#FFFFFF). Esa decisión elimina la frialdad clínica de muchas apps SaaS y da a la interfaz un carácter más humano. La diferencia es sutil pero acumulativa.

### Reglas de uso de color

**El primario se usa para:** botones de acción principal, tabs activos de navegación, indicador de agente en estado saludable, elementos seleccionados, links.

**El primario no se usa para:** fondos de página, texto corriente, iconografía decorativa, separadores.

**El acento ámbar se usa para:** indicador de confianza media en sugerencias, estado "en revisión", etiquetas de aprobación pendiente.

**Los colores funcionales se usan únicamente para:** estados del sistema (éxito, advertencia, error, información). Nunca para decoración.

**La regla de dominancia:** en cualquier pantalla, máximo un color de identidad o funcional visible al mismo tiempo en el área principal. Las pantallas con múltiples colores funcionales son señal de que el diseño tiene demasiado estado activo simultáneo y hay que resolver el problema de información, no el problema visual.

---

## Tipografía

### Familias

El sistema usa dos familias tipográficas. Una para display y navegación, una para cuerpo y UI.

**Display — Instrument Serif (italic)**
Usada exclusivamente en momentos de celebración o énfasis emocional: el headline de la landing, el mensaje de bienvenida post-activación, el resumen de primera semana. No se usa en UI funcional. Su presencia es escasa y por eso es poderosa. Cuando aparece, el usuario siente que algo importante está pasando.

**UI — Geist**
El sistema completo de UI usa Geist (de Vercel). Es moderna, extremadamente legible en tamaños pequeños, tiene excelente rendering en móvil y se siente tecnológicamente sofisticada sin ser fría. Sus números tabulares son perfectos para contadores y métricas. No es Inter. No es Roboto. Tiene carácter propio.

```
--font-display: 'Instrument Serif', Georgia, serif;
--font-ui: 'Geist', -apple-system, sans-serif;
--font-mono: 'Geist Mono', monospace;  /* Para IDs, números de teléfono, códigos */
```

### Escala tipográfica

La escala usa una proporción de 1.25 (Major Third) que produce saltos visuales claros sin ser dramáticos. Todos los valores están en rem para respetar preferencias de accesibilidad del sistema operativo.

```
--text-xs:   0.75rem   /* 12px — metadatos, timestamps, etiquetas pequeñas */
--text-sm:   0.875rem  /* 14px — texto secundario, subtítulos de lista */
--text-base: 1rem      /* 16px — texto de cuerpo, mensajes */
--text-lg:   1.125rem  /* 18px — títulos de sección, texto importante */
--text-xl:   1.25rem   /* 20px — títulos de pantalla en móvil */
--text-2xl:  1.5rem    /* 24px — títulos principales */
--text-3xl:  1.875rem  /* 30px — display en desktop */
--text-4xl:  2.25rem   /* 36px — hero, landing */
```

### Pesos y jerarquía

```
--font-normal:   400   /* Texto de cuerpo, mensajes */
--font-medium:   500   /* Labels, nombres de clientes */
--font-semibold: 600   /* Títulos de sección, botones */
--font-bold:     700   /* Títulos de pantalla, cantidades importantes */
```

### Altura de línea

```
--leading-tight:  1.25  /* Títulos, una sola línea */
--leading-snug:   1.375 /* Subtítulos, dos líneas máximo */
--leading-normal: 1.5   /* Texto de cuerpo, mensajes */
--leading-relaxed: 1.625 /* Texto largo, párrafos de ayuda */
```

### Reglas tipográficas

Máximo dos pesos diferentes en la misma pantalla. Un tercer peso requiere justificación explícita.

Los mensajes del cliente y del agente en el hilo de conversación usan `text-base` con `leading-normal`. Nunca más pequeño: estos mensajes son el contenido principal de la app y deben ser legibles sin esfuerzo en cualquier condición de luz.

Los timestamps y metadatos usan `text-xs` con `--text-tertiary`. No compiten con el contenido.

---

## Espaciado

El sistema de espaciado usa una escala de base 4px con progresión controlada. Todos los valores son múltiplos de 4.

```
--space-1:   4px    /* Micro — separación entre icono y label */
--space-2:   8px    /* Extra small — padding interno de chips y etiquetas */
--space-3:   12px   /* Small — gap entre elementos de lista */
--space-4:   16px   /* Base — padding horizontal de contenedores en móvil */
--space-5:   20px   /* Medium — separación entre secciones relacionadas */
--space-6:   24px   /* Large — separación entre secciones diferentes */
--space-8:   32px   /* Extra large — márgenes de pantalla en desktop */
--space-10:  40px   /* 2XL — separación entre bloques mayores */
--space-12:  48px   /* 3XL — altura de elementos de navegación */
--space-16:  64px   /* 4XL — márgenes superiores de pantallas */
```

### Reglas de espaciado

**Padding horizontal de pantalla en móvil:** `--space-4` (16px) en ambos lados. Constante en todas las pantallas. No varía por contenido.

**Altura de ítem de lista en bandeja:** mínimo 72px. En este espacio caben nombre, mensaje truncado y metadatos sin sensación de densidad.

**Altura de botón primario:** 48px. Suficientemente grande para tocar con certeza en cualquier tamaño de dedo. Nunca menos en móvil.

**Altura de tab de navegación inferior:** 56px desde el fondo seguro del dispositivo más el safe area. El safe area se maneja con `env(safe-area-inset-bottom)`.

**Separación entre secciones de la bandeja:** `--space-6` (24px) con un separador visual de `1px` en `--surface-border`.

---

## Bordes y radios

```
--radius-sm:   4px    /* Chips, etiquetas, badges pequeños */
--radius-base: 8px    /* Botones, inputs, tarjetas pequeñas */
--radius-md:   12px   /* Tarjetas de conversación, componentes medianos */
--radius-lg:   16px   /* Tarjetas grandes, modales en móvil */
--radius-xl:   20px   /* Burbujas de mensaje */
--radius-full: 9999px /* Avatares, indicadores de estado, pills */
```

Las burbujas de mensaje en el hilo de conversación usan `--radius-xl` (20px) para todos los lados excepto la esquina inferior del lado que pertenece al emisor, que usa `--radius-sm` (4px). Este es el patrón estándar de mensajería que el dueño ya reconoce de WhatsApp.

---

## Sombras y elevación

El sistema de elevación define qué elementos "flotan" sobre otros. Se usa con criterio: la mayoría de la interfaz vive en nivel 0 o 1.

```
--shadow-sm:  0 1px 2px rgba(28, 25, 23, 0.05)                           /* Nivel 1: tarjetas */
--shadow-md:  0 4px 6px -1px rgba(28, 25, 23, 0.08),
              0 2px 4px -2px rgba(28, 25, 23, 0.05)                      /* Nivel 2: dropdowns */
--shadow-lg:  0 10px 15px -3px rgba(28, 25, 23, 0.08),
              0 4px 6px -4px rgba(28, 25, 23, 0.05)                      /* Nivel 3: modales */
--shadow-xl:  0 20px 25px -5px rgba(28, 25, 23, 0.10),
              0 8px 10px -6px rgba(28, 25, 23, 0.05)                     /* Nivel 4: sheets */
```

El color base de las sombras usa el tono más oscuro de la paleta (`#1C1917`) con opacidad baja, no negro puro. Esto hace que las sombras sean cálidas y consistentes con la temperatura general del sistema.

---

## Iconografía

El sistema usa **Lucide Icons** como librería base. Son las más compatibles con el stack React que usará el producto, tienen estilo consistente de línea con trazo de 1.5px, y están activamente mantenidas.

**Reglas de iconografía:**

Tamaños estándar: 16px (inline en texto), 20px (en botones y listas), 24px (en navegación y acciones principales).

Los iconos de navegación inferior tienen tamaño 22px con trazo de 2px para mayor legibilidad.

No se usan iconos rellenos (fill) en la interfaz operativa excepto para el estado activo de la tab de navegación seleccionada, donde el ícono cambia de outline a filled para indicar la sección actual.

Los escalamientos tienen sus propios iconos semánticos: `alert-circle` para informativo, `alert-triangle` para sensible, `alert-octagon` para urgente. Estos tres siempre son consistentes en toda la app.

---

## Componentes core del sistema

Estos son los componentes de mayor uso. Cada uno tiene sus variantes, estados y reglas de uso documentadas.

---

### Componente: Button

**Variantes:**

`Primary` — acción principal de pantalla. Fondo `--color-primary-700`, texto `--text-inverse`, radio `--radius-base`, altura 48px en móvil. Solo debe haber un botón primary visible en una sola pantalla a la vez.

`Secondary` — acción importante pero no la principal. Fondo transparente, borde `1px solid --surface-border-strong`, texto `--text-primary`. Mismo radio y altura que primary.

`Ghost` — acción terciaria. Sin fondo ni borde visible. Solo texto con color `--text-secondary`. Se usa en contextos donde el botón no debe competir visualmente.

`Destructive` — acciones irreversibles o de alto riesgo. Fondo `--color-error-500`, texto blanco. Solo se usa cuando la acción realmente destruye o no puede deshacerse.

`Text` — el botón más liviano. Solo texto con `--color-primary-700`. Se usa para acciones secundarias en listas o dentro de notificaciones in-app.

**Estados de todos los botones:**

`default` — estado base.
`hover` — fondo ligeramente más oscuro (10% más saturado). Transición de 150ms ease.
`active` — fondo más oscuro (20% más saturado). Escala 0.98 con transform. Feedback táctil visual.
`loading` — spinner de 16px reemplaza el label. El botón mantiene su ancho para evitar layout shift.
`disabled` — opacidad 40%, cursor not-allowed. Nunca se oculta un botón deshabilitado, siempre visible como señal de que la acción existe pero no está disponible.

**Regla de loading:** cuando el dueño aprueba una sugerencia, el botón de "Aprobar" entra en estado loading por el tiempo que tarda el optimistic UI en confirmar. Si el servidor responde en menos de 300ms, el loading no es visible (se usa un threshold). Si tarda más, el spinner aparece.

---

### Componente: ConversationItem

El ítem de conversación es el componente más repetido de toda la app. Debe ser extremadamente legible y escaneable.

**Estructura:** avatar (inicial del nombre o foto si existe) + contenedor de texto (nombre en `text-sm font-medium --text-primary`, mensaje truncado en `text-sm --text-secondary`, máximo 2 líneas) + metadatos (tiempo en `text-xs --text-tertiary` + etiqueta de estado).

**Etiquetas de estado y su color:**

- Sin acción requerida: sin etiqueta visible.
- Sugerencia pendiente: badge ámbar con texto "Aprobar" + botón de aprobación rápida.
- Escalamiento informativo: badge amarillo con texto "Falta info".
- Escalamiento sensible: badge naranja con texto "Tu criterio".
- Escalamiento urgente: badge rojo con texto "Urgente" + indicador pulsante.
- Respondido por el agente: badge verde muy suave con texto "Resuelto" — solo visible en la sección "Atendidas."

**Botón de aprobación rápida en el ítem:** aparece solo en conversaciones con sugerencia pendiente de alta confianza. Es un botón `Text` con el label "Aprobar" alineado a la derecha del ítem. Permite aprobar sin entrar a la conversación. Si la confianza es media o baja, este botón no aparece: el dueño debe entrar al detalle.

**Hover state:** fondo `--surface-muted`. Transición 100ms.

**Active state (al tocar):** fondo `--color-primary-50`. La respuesta táctil debe ser inmediata.

---

### Componente: AgentSuggestion

El componente de sugerencia del agente es el segundo más crítico después del ConversationItem. Se usa dentro de la vista de conversación individual.

**Estructura de tres zonas:**

Zona 1 — contexto: burbuja pequeña con el último mensaje del cliente + línea de intención detectada en `text-xs --text-tertiary italic`.

Zona 2 — sugerencia: burbuja de respuesta propuesta con el fondo `--color-primary-100` y texto `--text-primary`. En la esquina superior derecha de la burbuja, el indicador de confianza: punto circular de 8px en verde (`--color-success-500`), ámbar (`--color-accent-500`) o naranja (`--color-warning-700`).

Zona 3 — acciones: tres elementos en línea horizontal. Botón `Primary` "Aprobar" (ocupa el 55% del ancho disponible). Botón `Secondary` "Editar" (22% del ancho). Botón `Ghost` "Rechazar" (23% del ancho). Esta asimetría refleja la jerarquía de acciones: aprobar es lo más probable, editar es secundario, rechazar es excepcional.

**Animación de aprobación:** cuando el dueño aprueba, la burbuja de sugerencia se anima con un slide-up y fade de 200ms mientras aparece en el hilo como mensaje enviado. Esta micro-animación confirma la acción sin necesidad de un toast o mensaje adicional.

---

### Componente: QuickInstruct

El componente de instrucción rápida del home.

**Estructura:** campo de texto con placeholder rotativo + icono de micrófono a la derecha + icono de clip a la derecha del micrófono. Todo en una sola línea con altura de 52px y radio `--radius-lg`.

**Fondo:** `--surface-card` con borde `1px solid --surface-border`. En focus, el borde cambia a `--color-primary-600` con transición de 150ms.

**Estado expandido:** cuando el dueño toca el campo, crece verticalmente a 120px mínimo para dar espacio cómodo al texto. El placeholder desaparece. Aparece un contador de caracteres y un botón de enviar en la esquina inferior derecha del campo.

**Estado de confirmación del agente:** después de enviar una instrucción, el campo se reemplaza por una burbuja de respuesta del agente con fondo `--color-primary-50` y los dos botones de confirmación. Esta zona tiene altura fija de 80px para no generar layout shift en el home.

---

### Componente: AgentStatusBar

La barra de estado del agente que vive en la zona superior del home.

**Estructura:** indicador de estado (punto pulsante de 10px) + texto de estado en `text-sm font-medium` + flecha de navegación hacia M3.2 si el estado no es verde.

**Variantes por estado:**

Verde saludable: punto verde pulsante (animación pulse de 2s infinita) + texto positivo. Sin flecha.

Amarillo con pendientes: punto ámbar estático + texto con contador. Sin flecha.

Amarillo con conocimiento bajo: punto ámbar con icono de libro pequeño + texto + flecha hacia M3.2.

Rojo urgente: reemplaza toda la barra con el banner de urgencia. Fondo `--color-error-100`, borde izquierdo de 3px en `--color-error-500`, icono de alerta, nombre del cliente, botón "Atender ahora."

Rojo desconectado: punto rojo estático + texto de desconexión + botón "Reconectar" inline.

---

### Componente: EscalationBanner

El banner contextual que aparece dentro del hilo de conversación para explicar por qué el agente escaló.

**Estructura:** icono semántico según nivel + texto explicativo en `text-sm` + acciones según tipo de escalamiento.

**Variante informativa:** fondo `--color-warning-100`, icono `alert-circle` en `--color-warning-700`, texto en `--text-primary`. Acción: botón "Agregar información" que abre M3.1.

**Variante sensible:** fondo `#FFF7ED` (ámbar muy suave), icono `alert-triangle` en `--color-accent-700`, texto en `--text-primary`. Acciones: opciones de respuesta pre-redactadas como botones `Secondary`.

**Variante urgente:** fondo `--color-error-100`, borde izquierdo de 3px en `--color-error-500`, icono `alert-octagon` en `--color-error-700`, texto en `--text-primary font-medium`. Sin opciones pre-redactadas: el campo de escritura directa está activo.

---

### Componente: SkillIndicator

El indicador de competencia del agente por tema. Se usa en M3.2 y en el modal de activación de autonomía.

**Estructura:** nombre del tema en `text-sm font-medium` + barra de progreso de ancho completo con altura de 4px + badge de estado (texto + color).

**Estados:**

Verde (domina): barra al 80-100% en `--color-success-500`. Badge: "Listo" con fondo `--color-success-100`.

Amarillo (parcial): barra al 40-79% en `--color-accent-500`. Badge: "Puede mejorar" con fondo `--color-accent-100`. Con botón de acción directa: "Mejorar" que abre M3.1.

Rojo (sin información): barra al 0-39% en `--color-error-400`. Badge: "Sin información" con fondo `--color-error-100`. Con botón de acción directa: "Agregar" que abre M3.1 configurado para ese tema.

---

## Patrones de interacción

### Patrones de navegación

**Bottom navigation en móvil:** 5 tabs con icono y label. Tab activa: icono filled + label en `--color-primary-700` + underline de 2px en `--color-primary-700`. Tab inactiva: icono outline + label en `--text-tertiary`.

Los badges de notificación en tabs (por ejemplo, el número de conversaciones pendientes en la tab de Conversaciones) son círculos de 18px con texto en `text-xs font-bold` sobre fondo `--color-error-500`. Aparecen en la esquina superior derecha del icono.

**Gestos en móvil:**

Deslizar hacia la izquierda en un ítem de conversación: revela acciones contextuales (archivar, marcar como urgente). El panel de acciones se desliza desde la derecha con una franja de color que indica el tipo de acción.

Deslizar hacia abajo en un modal o sheet: cierra el modal. El umbral de cierre es 40% de la altura del sheet.

Pull to refresh en la bandeja: recarga conversaciones. Indicador de carga en el color primario.

**Transiciones entre pantallas:**

Navegación hacia adelante (entrar a detalle): slide-in desde la derecha, 250ms ease-out.
Navegación hacia atrás: slide-out hacia la derecha, 200ms ease-in.
Modales y sheets: slide-up desde abajo, 300ms spring.
Toasts: fade-in + slide-up desde el fondo, 200ms. Duración visible: 3 segundos para informativos, 5 segundos para errores.

### Patrones de feedback

**Feedback de aprobación:** la burbuja de sugerencia se anima con slide-up + fade (200ms) mientras simultáneamente aparece como mensaje enviado en el hilo. Sin toast. Sin confirmación verbal. La animación es la confirmación.

**Feedback de instrucción enviada:** el campo de instrucción rápida muestra un spinner de 300ms mientras procesa, luego la respuesta del agente aparece con un fade-in suave (200ms). Si el procesamiento tarda más de 2 segundos, aparece un mensaje de "Procesando..." en el campo para que el dueño no lo toque dos veces.

**Feedback de error:** el elemento que falló obtiene un shake animation horizontal de 400ms (3 oscilaciones) + borde en `--color-error-500`. El mensaje de error aparece debajo del elemento en `text-xs --color-error-700`. Nunca se usa un modal para errores recuperables.

**Feedback de carga:** se usa skeleton loading (barras de color `--surface-muted` con shimmer animation) en lugar de spinners para la carga inicial de la bandeja y del hilo de conversación. Esto da la percepción de contenido más rápido.

### Patrones de estado vacío

Cada pantalla que puede estar vacía tiene un estado vacío diseñado, no un estado de "no hay datos." La diferencia es que el estado vacío tiene intención comunicativa: explica qué está pasando y qué puede hacer el dueño.

**Bandeja vacía en primer uso:** ilustración mínima de chat + texto: "Tu agente está listo y esperando. Cuando tus clientes escriban, aparecerán aquí." + botón: "Enviar un mensaje de prueba."

**Bandeja al día:** sin ilustración, solo texto positivo: "Todo al día. Tu agente no tiene conversaciones pendientes." + resumen del día si hay actividad.

**Estado del agente sin entrenar:** mapa de competencias con todos los temas en rojo + texto: "Tu agente todavía no conoce bien tu negocio. Entrénalo para que responda mejor." + botón prominente: "Empezar a entrenar."

---

## Layout system

### Grid y breakpoints

El producto es web app responsive con diseño móvil-first. No es una app nativa, pero debe sentirse como una.

```
/* Breakpoints */
--bp-mobile:  390px    /* iPhone 14 Pro como referencia de diseño móvil */
--bp-tablet:  768px    /* iPad mini en portrait */
--bp-desktop: 1280px   /* Laptop como referencia de desktop */
--bp-wide:    1536px   /* Desktop amplio */
```

**Móvil (< 768px):** una columna. Padding horizontal `--space-4`. Bottom navigation visible. No hay sidebar.

**Tablet (768px - 1279px):** dos columnas opcionales. La bandeja puede vivir en una columna izquierda y el detalle de conversación en una columna derecha. Bottom navigation o sidebar izquierda condensada.

**Desktop (>= 1280px):** tres columnas. Sidebar izquierda de 240px con los 5 ítems de navegación. Columna central de 380px para la bandeja. Columna derecha flexible para el detalle de conversación, el panel de información del cliente o el estado del agente.

### Estructura de pantalla en móvil

Cada pantalla tiene exactamente tres zonas:

**Zona 1 — Header (56px fija):** título de la pantalla en `text-xl font-bold` + acciones secundarias de la pantalla (máximo 2 iconos) a la derecha. El header no scrollea.

**Zona 2 — Contenido (flex, scrolleable):** el cuerpo principal de la pantalla. Scrolleo vertical. El contenido nunca tiene padding inferior menor a 80px para no quedar tapado por la navegación.

**Zona 3 — Navigation bar (56px + safe area):** la barra de navegación inferior. Fija. Con `backdrop-filter: blur(20px)` y fondo `rgba(255, 255, 255, 0.85)` para el efecto de vidrio iOS que deja ver el contenido scrollear debajo.

---

## Accesibilidad

El sistema cumple WCAG 2.1 nivel AA como mínimo. Estas son las reglas no negociables.

**Contraste de texto:** mínimo 4.5:1 para texto normal, 3:1 para texto grande (18px+). El par `--text-primary` sobre `--surface-background` da 16.5:1. El par `--text-secondary` sobre `--surface-background` da 6.2:1. Ambos superan AA.

**Tamaño de toque:** todos los elementos interactivos tienen un área de toque mínima de 44x44px aunque su representación visual sea menor. Los espacios muertos se rellenan con padding invisible.

**Focus visible:** todos los elementos interactivos tienen un estado focus con outline de 2px en `--color-primary-600` con offset de 2px. No se elimina el outline nativo sin reemplazarlo.

**Motion reducido:** todas las animaciones y transiciones respetan `prefers-reduced-motion`. Cuando está activa esta preferencia, las transiciones de pantalla son instantáneas y las animaciones decorativas se desactivan. Las micro-animaciones de feedback (aprobación de sugerencia, confirmación de instrucción) se reducen a fade simple de 100ms.

**Texto escalable:** toda la tipografía usa `rem` para respetar el tamaño de fuente base del sistema operativo del usuario.

---

## Decisiones de diseño que no se cuestionan en implementación

Estas son decisiones tomadas con intencionalidad y que no deben cambiarse sin una razón de producto explícita.

El fondo base es `#FAFAF9`, no `#FFFFFF`. La temperatura cálida del fondo es parte de la identidad del producto.

El botón de "Aprobar" siempre ocupa más espacio visual que "Editar" y "Rechazar". La asimetría es intencional y refleja la jerarquía de uso esperada.

Los mensajes del agente y del dueño se diferencian por color de burbuja Y por icono pequeño. No solo por color. El doble indicador protege contra daltonismo y da más contexto al escanear el hilo rápidamente.

No hay modo oscuro en el MVP. Agregar modo oscuro duplica el trabajo de QA visual y en el segmento objetivo (dueños de PYME en Guatemala) la adopción de modo oscuro es baja. Se puede agregar en Fase 2 cuando haya usuarios activos que lo pidan.

La navegación inferior nunca tiene más de 5 ítems. Si el producto crece y necesita más áreas, se resuelven como subsecciones dentro de las 5 existentes, no como tabs adicionales.

---

## Lo que este sistema no cubre intencionalmente

**Componentes de onboarding:** el onboarding tiene patrones de interacción distintos al producto core (es lineal, no libre, y tiene una barra de progreso que no existe en el resto del producto). Sus componentes específicos — la pantalla de selección de industria, el chat de prueba del agente, el paso de Embedded Signup — se especifican directamente en las specs de frontend de cada flujo.

**Animaciones de la landing:** la landing tiene una identidad visual que puede separarse ligeramente del sistema de producto. Sus animaciones y tratamiento visual se definen en la spec de frontend de ese módulo específico, con este sistema como base pero con más libertad expresiva.

**Dark mode:** excluido intencionalmente del MVP.

**Componentes de facturación y plan:** son pantallas de uso muy ocasional y bajo impacto en la experiencia diaria. Siguen el sistema pero no tienen componentes propios documentados aquí.

---

*AGENTI — Entregable 5 v1.0 — Arquitectura de UI y sistema de diseño*
