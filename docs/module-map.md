# AGENTI — Entregable 2 v2.0
## Mapa completo de módulos del producto

**Versión:** 2.0  
**Estado:** Oficial  
**Cambios respecto a v1.0:** Modelo de conocimiento en capas (nuevo), tipología de correcciones en M2.4 (actualizado), indicadores de evidencia para activación de autonomía en M4.3 (actualizado)

---

## Principio de organización

El producto tiene dos mundos que deben sentirse como uno solo. El mundo del onboarding, que ocurre una vez y construye el agente. Y el mundo operativo, que ocurre todos los días y es donde el dueño vive el valor real. La arquitectura de módulos respeta esa separación pero los conecta con coherencia.

El sistema completo opera sobre tres capas:

- **Capa 1 — Canal operativo:** donde llegan y salen los mensajes del cliente. Inicialmente WhatsApp vía Meta Cloud API con Embedded Signup.
- **Capa 2 — Motor del agente:** la lógica que interpreta mensajes, busca contexto, decide si puede responder, si debe sugerir o si debe escalar.
- **Capa 3 — Interfaz del dueño:** la web app móvil-first donde el dueño supervisa, aprueba, corrige y entrena.

---

## Mapa visual de módulos

```
AGENTI
│
├── MUNDO 0: ADQUISICIÓN
│   └── Landing page
│
├── MUNDO 1: ONBOARDING (ocurre una vez)
│   ├── M1.1 — Registro y verificación
│   ├── M1.2 — Selección de industria
│   ├── M1.3 — Conocimiento inicial
│   ├── M1.4 — Reglas de escalamiento
│   ├── M1.5 — Conexión de WhatsApp
│   └── M1.6 — Prueba del agente
│
├── MUNDO 2: OPERACIÓN DIARIA (el producto real)
│   ├── M2.1 — Home / Command center
│   ├── M2.2 — Bandeja de conversaciones
│   ├── M2.3 — Vista de conversación individual
│   ├── M2.4 — Modo colaborador (aprobar / editar / rechazar)
│   └── M2.5 — Escalamiento y acción urgente
│
├── MUNDO 3: ENTRENAMIENTO (acceso frecuente)
│   ├── M3.1 — Instrucción rápida
│   ├── M3.2 — Estado del agente (mapa de competencias)
│   └── M3.3 — Historial de aprendizaje
│
├── MUNDO 4: CONFIGURACIÓN (acceso ocasional)
│   ├── M4.1 — Perfil del negocio
│   ├── M4.2 — Reglas de escalamiento
│   ├── M4.3 — Nivel de autonomía por tema
│   ├── M4.4 — Canal de WhatsApp
│   └── M4.5 — Cuenta y notificaciones
│
└── MUNDO 5: INTELIGENCIA (acceso semanal)
    ├── M5.1 — Resumen de actividad
    └── M5.2 — Oportunidades de entrenamiento
```

---

## Modelo de conocimiento en capas [NUEVO en v2.0]

El conocimiento del negocio que alimenta al agente no es texto plano uniforme. Tiene cuatro capas con comportamiento distinto. Esta estructura afecta cómo se almacena, consulta y actualiza la información en M1.3, M3.1 y M4.1.

**Capa 1 — Datos estructurados**
Nombre del negocio, dirección, horarios, servicios, precios base, métodos de pago. Son datos precisos y verificables que el agente consulta de forma directa. Se actualizan por instrucción explícita del dueño. Alta prioridad en la búsqueda del agente.

**Capa 2 — Reglas operativas**
Qué nunca prometer, cuándo escalar, qué excepciones existen, políticas de reservas, cancelaciones o devoluciones. Son reglas que gobiernan el comportamiento del agente, no solo su conocimiento. Un cambio aquí afecta cómo responde el agente en múltiples temas simultáneamente. Requieren confirmación explícita del dueño antes de integrarse.

**Capa 3 — Contenido narrativo**
Tono de comunicación, cómo describir el negocio, promociones activas, contexto adicional que hace las respuestas más ricas. Es la capa más flexible y la que más refleja la personalidad del negocio. Se puede actualizar con frecuencia y con menor fricción.

**Capa 4 — Memoria aprendida**
Respuestas aprobadas para preguntas recurrentes, patrones detectados por el sistema, correcciones del dueño clasificadas como permanentes. Esta capa crece con el uso pero está gobernada: no todo lo que entra aquí es permanente ni tiene el mismo peso.

---

## Descripción detallada por módulo

### MUNDO 0: ADQUISICIÓN

**M0 — Landing page**

Propósito único: convertir visitante en registro. No es un módulo de producto pero define la primera impresión y el contrato de expectativas con el usuario.

Componentes críticos: hero con headline y demo interactiva, sección de dolor en lenguaje del dueño, prueba social o estadísticas del problema, pricing visible, captura de leads no convertidos.

La demo interactiva es el componente de mayor peso: demuestra valor antes de pedir cualquier dato. El tipo de negocio seleccionado en la demo puede pre-cargar la industria en M1.2 si el usuario se registra inmediatamente, eliminando un paso y creando continuidad.

---

### MUNDO 1: ONBOARDING

**M1.1 — Registro y verificación**

Propósito: crear cuenta con mínima fricción y verificar identidad.

Campos: nombre completo, correo electrónico, contraseña, número personal del dueño. Opción de Google que colapsa los primeros tres campos.

El número que se pide aquí es explícitamente el número **personal** del dueño. El label y el contexto visual lo dejan claro: "Aquí te avisamos cuando tu agente necesita tu ayuda. No es el número de tu negocio, ese lo conectamos después." Si después en M1.5 se detecta conflicto entre ambos números, se resuelve ahí con flujo específico.

Verificación por código de 6 dígitos por WhatsApp. Fallbacks: reenvío a los 30 segundos, SMS al segundo intento fallido, correo al tercero.

Estados: vacío, llenando, verificando, verificado, error recuperable, error de email existente.

**M1.2 — Selección de industria**

Propósito: cargar la plantilla correcta. Es la decisión de mayor impacto por menor esfuerzo del onboarding.

Seis opciones en cuadrícula visual: restaurante, clínica, salón, retail, gimnasio, otro. Al seleccionar, preview inmediato de lo que la plantilla ya incluye. Ese preview es el primer momento de confianza con el producto.

Si el usuario viene de la demo de la landing con industria seleccionada, este paso aparece pre-confirmado con opción de cambiar.

Estados: selección vacía, industria seleccionada con preview, confirmado.

**M1.3 — Conocimiento inicial**

Propósito: personalizar el agente con los datos específicos del negocio.

Preguntas cortas en lenguaje natural, específicas por industria. El onboarding cubre principalmente la Capa 1 (datos estructurados) y parte de la Capa 3 (tono, descripción del negocio). Las Capas 2 y 4 se construyen con el uso.

Campos universales: nombre del negocio, dirección o zona, horarios, servicios o productos principales, precios principales, tono preferido. Campos específicos por industria: restaurante agrega tipo de cocina y delivery, clínica agrega especialidades y manejo de emergencias, salón agrega servicios con duración estimada.

Todo es opcional con indicador de completitud. El sistema muestra en tiempo real cómo afecta cada dato al agente.

Métodos de entrada: texto, nota de voz con transcripción automática, link de sitio web o redes para extracción automática, imagen de menú o lista de precios con OCR básico.

Estados: vacío, parcialmente completo, completo, procesando extracción, extracción completa con revisión.

**M1.4 — Reglas de escalamiento**

Propósito: definir qué temas maneja siempre el dueño. Enmarcado como pregunta de confianza, no como configuración técnica.

Título: "¿En qué situaciones prefieres que te llame tu agente?" Lista corta de temas con toggles pre-configurados por industria con defaults conservadores. El dueño puede agregar temas personalizados con texto libre.

Este módulo es intencionalmente corto: 3 a 5 toggles, opción de agregar uno más, botón de continuar. La configuración avanzada vive en M4.2.

Estados: defaults cargados, modificado, tema personalizado agregado, confirmado.

**M1.5 — Conexión de WhatsApp**

Propósito: conectar el canal operativo. El paso técnicamente más complejo y emocionalmente más sensible.

**Opción A:** el dueño tiene número de WhatsApp Business separado para el negocio. Flujo estándar de Embedded Signup: un botón, popup de Meta, autorización, listo.

**Opción B:** el dueño tiene un número regular para el negocio que quiere convertir. El sistema guía paso a paso.

**Opción C — Número único:** cuando el número del M1.1 coincide con el que quiere conectar. El sistema lo detecta automáticamente y explica en lenguaje humano las implicaciones. Ofrece ayuda para conseguir número secundario y, si el dueño insiste, acepta modo de número único con advertencia clara de lo que implica operativamente.

**Opción D:** omitir por ahora. El agente se prueba en sandbox. La conexión se completa después desde M4.4.

Estados: pendiente, Embedded Signup activo, conectado, fallido con causa específica, omitido.

**M1.6 — Prueba del agente**

Propósito: el primer momento de valor. Todo el onboarding culmina aquí.

Interfaz de chat que simula WhatsApp. Sugerencias de preguntas clicables por industria. El agente responde en tiempo real con información configurada, en el tono elegido, con el nombre del negocio. Botón de corrección en cada burbuja con editor inline que genera aprendizaje inmediato.

Después de tres mensajes de prueba: opciones de activar agente, seguir entrenando o conectar WhatsApp si se omitió M1.5.

En desktop: panel lateral que muestra intención detectada y fuente de información usada. En móvil: gesto de expansión en la burbuja del agente.

Estados: sandbox activo, prueba en progreso, corrección en curso, listo para activar.

---

### MUNDO 2: OPERACIÓN DIARIA

**M2.1 — Home / Command center**

Propósito: vista inmediata del estado del negocio y punto de entrada más rápido a la acción más importante del momento.

Tres zonas en móvil:

**Zona superior:** estado del agente en una línea. "Tu agente está activo. Atendió 8 conversaciones hoy." Indicador visual verde/amarillo/rojo según nivel de conocimiento.

**Zona central:** el componente de instrucción rápida. "Dile algo a tu agente." Campo de texto, botón de nota de voz, botón de adjuntar imagen o link. Esta zona es visualmente prominente, no secundaria.

**Zona inferior:** bandeja resumida. 3 a 5 conversaciones que requieren acción del dueño, ordenadas por prioridad. Botón "Ver todas" que lleva a M2.2.

En desktop: vista de tres columnas. Instrucción rápida a la izquierda, bandeja al centro, estado del agente a la derecha.

Estados: agente activo sin pendientes, agente activo con pendientes, agente con advertencia de conocimiento bajo, agente desconectado.

**M2.2 — Bandeja de conversaciones**

Propósito: vista completa de todas las conversaciones organizadas por lo que requieren del dueño.

Tres secciones diferenciadas visualmente:
- **Requieren tu acción:** conversaciones escaladas o pendientes de aprobación, siempre arriba.
- **Atendidas por el agente:** resueltas recientemente, orden cronológico.
- **Archivadas:** conversaciones cerradas.

Cada ítem muestra: nombre del cliente o número, último mensaje truncado, estado con indicador visual, tiempo desde el último mensaje, y si hay sugerencia lista para aprobar.

Filtros por estado y fecha. Búsqueda por nombre o contenido.

Estados: bandeja vacía primer uso, con pendientes, sin pendientes, cargando más.

**M2.3 — Vista de conversación individual**

Propósito: ver el hilo completo y tomar acción sobre la conversación.

El hilo se ve exactamente como WhatsApp. Mensajes del cliente a la izquierda, mensajes del agente o del dueño a la derecha. Los mensajes del agente tienen indicador sutil que los distingue de los escritos por el dueño.

Si hay sugerencia lista, aparece el componente de M2.4 en la parte inferior. Si no, campo para escribir directamente.

Panel lateral colapsable en móvil, visible en desktop: información del cliente, historial de interacciones, etiquetas del agente (comprador potencial, queja, recurrente).

Estados: activa con sugerencia pendiente, activa sin sugerencia, escalada requiriendo acción, resuelta en solo lectura.

**M2.4 — Modo colaborador [ACTUALIZADO en v2.0]**

Propósito: el mecanismo central de confianza. El dueño revisa y aprueba antes de que el agente envíe.

Componente en la parte inferior de M2.3. Estructura: mensaje del cliente en contexto, respuesta sugerida en burbuja destacada con indicador de nivel de confianza (visual, no técnico), y tres acciones:

**Aprobar con un toque:** la respuesta se envía exactamente como está. La acción más probable, más fácil de ejecutar con el pulgar.

**Editar antes de enviar:** abre el texto en campo editable. El dueño modifica y envía.

**Rechazar y escribir:** descarta la sugerencia, abre campo en blanco.

**Tipología de correcciones (nuevo en v2.0):** cuando el dueño edita o rechaza y envía su versión, el sistema hace una pregunta simple posterior al envío: "¿Quieres que tu agente recuerde esto?" con tres opciones:

- **"Solo esta vez"** — corrección puntual. No modifica el conocimiento del agente. Fue una respuesta a una situación excepcional.
- **"Siempre"** — nueva regla o dato permanente. Se integra a la Capa 2 o Capa 4 del modelo de conocimiento según corresponda.
- **"Por ahora"** — dato temporal. El dueño puede definir hasta cuándo aplica (ej. "esta semana", "hasta el lunes").

Si el dueño no responde esa pregunta, la corrección se clasifica como puntual por defecto. Nunca se asume permanencia sin confirmación explícita.

Aprobación agrupada para múltiples conversaciones con sugerencias similares: "Hay 6 preguntas sobre horarios con respuestas similares. ¿Aprobarlas todas?"

**Regla de tiempo de espera:** si el dueño no responde en el tiempo configurado, el sistema envía una respuesta de espera segura configurable: "Gracias por escribirnos. Estamos verificando tu consulta y te respondemos en breve." Nunca silencio total.

Estados: sugerencia lista para aprobar, en edición, aprobando, enviada, rechazada, clasificación de corrección pendiente.

**M2.5 — Escalamiento y acción urgente**

Propósito: asegurar que el dueño nunca pierda una situación que requiere intervención inmediata.

**Escalamiento informativo:** el agente no tiene un dato. Notificación normal en la bandeja. La interfaz muestra: qué preguntó el cliente, qué no sabe el agente, sugerencia de respuesta, y opción de convertir la respuesta en conocimiento permanente.

**Escalamiento sensible:** queja, negociación, situación que requiere criterio. Indicador amarillo en la bandeja. La interfaz muestra: resumen del caso, tono sugerido, riesgo percibido, respuesta editable con opciones pre-generadas.

**Escalamiento urgente:** emergencia, tema de salud o legal. Notificación push prioritaria, indicador rojo, conversación al tope con banner de atención. El agente ya respondió al cliente que un humano lo atenderá en breve.

Estados: nuevo escalamiento, visto sin resolver, en progreso, resuelto por el dueño.

---

### MUNDO 3: ENTRENAMIENTO

**M3.1 — Instrucción rápida**

Propósito: el canal más rápido para actualizar lo que sabe el agente. Vive en la Zona Central del home.

Se comporta como campo de mensaje de WhatsApp. Texto libre, nota de voz con transcripción automática, imagen con OCR para menús o promociones, link para extracción de contenido.

El agente procesa la instrucción y confirma en lenguaje natural: "Entendido. A partir de ahora voy a decirles que los domingos cerramos a las 3 PM. ¿Correcto?" El dueño confirma con un toque o corrige con texto. Si la instrucción es ambigua, el agente hace una sola pregunta de clarificación.

Después de recibir confirmación, el dueño puede clasificar la instrucción usando la misma tipología de M2.4: permanente, por ahora (temporal), o solo esta vez.

Historial de instrucciones recientes visible con opción de deshacer la última.

Estados: campo vacío, escribiendo, procesando, confirmación pendiente, integrada, ambigua requiriendo clarificación.

**M3.2 — Estado del agente**

Propósito: mostrar las "Áreas del negocio" — qué tan cubierto está el conocimiento del agente por área temática.

**Modelo de conocimiento por áreas:**
- **Áreas core (is_default=true):** definidas por el template de industria al completar el onboarding. Fijas y estables — no crecen por instrucciones nuevas. Cada área tiene cobertura binaria: cubierta (≥1 instrucción activa) o sin cubrir (0 instrucciones).
- **Conocimiento adicional (is_default=false):** topics generados automáticamente por el LLM cuando una instrucción no encaja en ningún área core. Se muestran en sección colapsable separada y NO afectan el health score.

**Health score:** porcentaje de áreas core cubiertas / total de áreas core. Nunca se diluye por agregar conocimiento adicional.

**Cobertura por área:** binaria. Una instrucción es suficiente para que un área esté "cubierta". No hay porcentajes por área individual. Al expandir un área, el dueño ve la lista de instrucciones aprendidas en ese tema organizadas por capa.

**Realtime:** el health score y las cards de área actualizan automáticamente vía Supabase Realtime cuando se confirma una instrucción nueva, sin recargar la página.

Estados: áreas vacías (primer uso), parcialmente cubiertas, todas cubiertas, área en detalle con instrucciones.

**M3.3 — Historial de aprendizaje**

Propósito: transparencia de qué ha aprendido el agente, cuándo y con qué clasificación. Herramienta de auditoría para que el dueño detecte y corrija conocimiento obsoleto o incorrecto.

Ruta: `/dashboard/agent/history`. Accesible desde el botón "Historial" en la pantalla "Tu Agente".

**Funcionalidades implementadas:**
- Lista cronológica inversa de `knowledge_items` con topic, fecha, capa (traducida: Dato fijo / Política / Descriptivo / Aprendido) e ícono de tipo (texto / voz / imagen).
- Buscador por contenido o nombre de topic.
- Filtro segmentado por tipo de fuente: Todos / Texto / Voz / Imagen.
- Items inactivos se muestran con opacidad reducida y badge "Inactiva".
- **Desactivar instrucción:** requiere confirmación en modal con preview del contenido. Tras confirmar: `active = false`, llama RPC `refresh_competency_coverage`, invalida `agent_context_cache`. El mapa de áreas actualiza en tiempo real via Realtime.
- **Reactivar instrucción:** acción directa sin modal (reversible, de bajo riesgo).

Estados: historial vacío, con entradas, filtro activo sin resultados.

---

### MUNDO 4: CONFIGURACIÓN

**M4.1 — Perfil del negocio**

Todos los datos del negocio editables organizados por capas de conocimiento. La Capa 1 (datos estructurados) aparece primero y más prominente. La Capa 3 (contenido narrativo y tono) aparece secundaria. La interfaz es la misma conversacional del onboarding disponible permanentemente, no un formulario de configuración.

**M4.2 — Reglas de escalamiento**

Versión completa y granular del M1.4. El dueño puede agregar temas personalizados, cambiar umbrales, y ver estadísticas de cuántas veces escaló cada tema en la última semana. Esa estadística le da información real para decidir si dar más o menos autonomía en ese tema específico.

**M4.3 — Nivel de autonomía por tema [ACTUALIZADO en v2.0]**

Propósito: el control fino de qué responde el agente solo y qué pasa por aprobación.

Por defecto todo está en Nivel 0 (modo colaborador). El dueño puede activar autonomía por tema individual con dos niveles adicionales:

- **Nivel 0 — Colaborador:** el agente siempre sugiere y espera aprobación.
- **Nivel 1 — Autónomo con guardrails:** el agente responde solo si tiene suficiente información y no detecta sensibilidad.
- **Nivel 2 — Autónomo amplio:** el agente responde solo en ese tema casi siempre, salvo urgencia o conflicto. Disponible después de validar el Nivel 1.

**Indicadores de evidencia para activación (nuevo en v2.0):** cuando el dueño considera activar autonomía en un tema, el sistema muestra tres indicadores en lenguaje humano:

1. "Tu agente conoce bien este tema" — basado en cobertura de Capa 1 y Capa 2 para ese tema.
2. "Ha respondido bien últimamente" — basado en porcentaje de sugerencias aprobadas sin edición en los últimos 7 días.
3. "Sin incidentes recientes" — basado en ausencia de escalamientos o correcciones en ese tema en el mismo período.

Si los tres indicadores están en verde, el sistema sugiere proactivamente: "Parece que tu agente ya maneja bien las preguntas de horario. ¿Quieres que responda solo?" Si algún indicador no está en verde, el sistema no bloquea la activación pero muestra la advertencia específica. El dueño decide con información real.

**M4.4 — Canal de WhatsApp**

Estado de la conexión, número conectado, opción de desconectar o cambiar número. Para el dueño que omitió M1.5, este es donde completa esa conexión.

**M4.5 — Cuenta y notificaciones**

Datos de la cuenta del dueño, configuración de notificaciones push, frecuencia y formato del resumen diario por WhatsApp, plan activo y facturación.

---

### MUNDO 5: INTELIGENCIA

**M5.1 — Resumen de actividad**

Vista semanal y mensual en lenguaje humano. "Esta semana tu agente atendió 134 conversaciones. Te ahorró aproximadamente 6 horas. Resolvió solo el 71% sin necesitar tu ayuda." Tendencia simple esta semana vs. semana anterior. Sin dashboards complejos.

**M5.2 — Oportunidades de entrenamiento**

El módulo de mayor valor de inteligencia. Lista de situaciones donde el agente no pudo responder bien, agrupadas por tema. "Esta semana 8 clientes preguntaron por descuentos corporativos y tu agente no tenía respuesta. ¿Quieres definir cómo manejar eso?" Botón que abre M3.1 pre-configurado para ese tema.

---

## Mapa de interdependencias críticas

**M1.2 alimenta M1.3, M1.4 y M2.5.** La industria seleccionada determina las preguntas de conocimiento, los defaults de escalamiento y los temas del mapa de competencias.

**M1.3 alimenta M3.2.** Lo configurado en el onboarding es el estado inicial del mapa de competencias. Cada campo vacío es un tema en rojo.

**M2.4 alimenta M3.3.** Cada corrección del dueño en modo colaborador con su clasificación (puntual/permanente/temporal) genera una entrada en el historial de aprendizaje.

**M3.1 alimenta M3.2 en tiempo real.** Una instrucción que cubre un tema en rojo debe actualizar ese tema inmediatamente a amarillo o verde.

**M4.2 y M4.3 alimentan M2.5.** Cambios en reglas de escalamiento y autonomía afectan el comportamiento del agente en conversaciones activas.

**M5.2 es el output de M2.3 y M2.5.** Las oportunidades de entrenamiento se generan analizando patrones de escalamiento y correcciones del modo colaborador.

**Dependencia crítica de construcción:** no construir autonomía (M4.3) antes de tener bien resueltos conocimiento (M1.3, M3.1) y escalamiento (M2.5, M4.2). Activar autonomía sobre base de conocimiento débil genera respuestas incorrectas autónomas que destruyen la confianza del dueño en el producto.

---

## Lo que este mapa no incluye intencionalmente

**Calendario y agendamiento.** El agente puede captar intención de agendar y escalar al dueño para que confirme manualmente. Integrar agenda propia es Fase 3.

**Pagos y links de pago.** Captar intención de compra y derivar a link externo existente es suficiente para MVP. Fase 3.

**Múltiples agentes o múltiples negocios.** El modelo de datos debe soportarlo desde el inicio, pero la interfaz del MVP sirve a un dueño con un negocio y un agente.

---

## Los 5 módulos verdaderamente core del MVP

En orden de dependencia y prioridad de construcción:

1. **Plantilla + conocimiento (M1.2, M1.3)** — sin esto no hay calidad inicial.
2. **Motor conversacional (interno, Capa 2 del sistema)** — sin esto no existe el producto.
3. **Modo colaborador (M2.4)** — es la forma segura de entrar al mercado.
4. **Escalamiento (M2.5)** — "no inventar" solo sirve si está operativizado.
5. **Bandeja operativa del dueño (M2.1, M2.2, M2.3)** — el valor no solo está en responder, sino en supervisar sin fricción.

---

*AGENTI — Entregable 2 v2.0 — Mapa completo de módulos del producto*
