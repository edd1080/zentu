# AGENTI — Roadmap Post-MVP v1.0
## Plan de desarrollo extendido: de producto funcional a producto excepcional

**Versión:** 1.0
**Tipo:** Roadmap Layer Doc — gobierna todo el desarrollo después del MVP piloto.
**Prerequisito:** Las Fases 1-7 del Development Plan v1.0 están completas y el producto está en manos de los primeros 20-30 pilotos reales.
**Principio rector:** Un producto que funciona no es lo mismo que un producto que enamora. Este roadmap convierte el primero en el segundo.

---

## Vista general — 8 fases post-MVP

```
MILESTONE 2 — PRODUCTO COMPLETO

Fase 8   Onboarding de siguiente nivel           (3-4 sesiones)
Fase 9   Monetización y billing                  (2-3 sesiones)
Fase 10  Edge cases y resiliencia                (2-3 sesiones)
Fase 11  UI/UX polish y microanimaciones         (3-4 sesiones)
Fase 12  PWA + integración con landing           (2-3 sesiones)
Fase 13  Performance y escalabilidad             (2-3 sesiones)
Fase 14  Retención y crecimiento                 (2-3 sesiones)
Fase 15  Meta producción completa               (1-2 sesiones)

Total estimado: 17-27 sesiones adicionales
```

---

## Criterio de entrada al roadmap post-MVP

Antes de arrancar cualquier fase de este documento, confirmar que:

1. Las 7 fases del Development Plan v1.0 tienen DoD cumplido
2. Al menos 5 pilotos reales han completado el onboarding de forma autónoma (sin tu ayuda)
3. El pipeline del agente lleva al menos 72 horas continuas sin errores en producción
4. La tasa de aprobación promedio de los pilotos activos es mayor o igual al 50%

Si alguno de estos criterios no se cumple, la prioridad es estabilizar el MVP antes de extender.

---

## Fase 8 — Onboarding de siguiente nivel

**Objetivo:** El onboarding actual es funcional pero básico. Esta fase lo convierte en una experiencia que impresiona desde el primer segundo, extrae el máximo contexto posible del negocio, y deja al agente genuinamente preparado para responder bien desde el día uno.

**Por qué es la primera fase post-MVP:** El onboarding es el momento de mayor abandono y también el momento donde se determina la calidad del agente para siempre. Un agente mal configurado desde el onboarding genera correcciones constantes, fatiga al dueño, y termina en churn. Arreglarlo aquí tiene el mayor retorno de inversión.

### Bloque 8.1 — Captura de contexto enriquecida

**Lo que falta en el onboarding actual:**

El onboarding actual acepta texto libre y notas de voz básicas. Un negocio real tiene mucho más contexto disponible que no se está capturando.

Tareas:
- Captura por PDF: el dueño sube menús, listas de precios, catálogos, reglamentos internos. Extracción de texto vía Gemini Flash con OCR. Cada sección del PDF relevante se convierte en un KnowledgeItem de capa structured.
- Captura por imagen de menú o lista de precios: foto desde el teléfono → OCR + estructuración → KnowledgeItems con precios y descripciones. Corrección inline si el OCR comete errores.
- Captura por link de sitio web propio: el dueño pega su URL → el sistema hace fetch, extrae información relevante (horarios, servicios, precios, ubicación, descripción), presenta un resumen para confirmación, y crea KnowledgeItems.
- Captura por links de redes sociales: Instagram, Facebook. Extrae bio, descripción, posts recientes de productos/servicios. Identifica qué tipo de negocio es y refina la plantilla de industria.
- Captura por audio del dueño hablando de su negocio: nota de voz larga (hasta 3 minutos) donde el dueño describe su negocio con sus propias palabras. Transcripción + extracción de KnowledgeItems de capa narrative. Este audio se convierte en la "voz" del agente.
- Captura por video corto: el dueño graba un tour de 30 segundos de su local. Extracción del audio para transcripción. Identificación visual del tipo de negocio.
- Importación de FAQ existente: si el dueño tiene un documento de preguntas frecuentes (Google Doc, Word, texto), importarlo completo y estructurarlo en KnowledgeItems.

**Definition of Done 8.1:**
- Un PDF de menú de restaurante de 3 páginas produce al menos 10 KnowledgeItems correctos con precios
- Una foto de lista de precios del salón produce KnowledgeItems con nombre y precio de cada servicio
- El link de un sitio web de clínica produce KnowledgeItems de horarios, especialidades y ubicación
- Una nota de voz de 2 minutos del dueño produce KnowledgeItems de capa narrative que suenan como él
- El porcentaje de completitud del agente aumenta con cada tipo de captura agregado

### Bloque 8.2 — Onboarding por plantillas de industria profundas

**Lo que falta:** Las plantillas de industria actuales son genéricas. Un salón de belleza y una peluquería masculina tienen flujos completamente distintos. Esta fase crea plantillas específicas.

Tareas:
- Expandir de 6 a 20+ plantillas de industria con mayor especificidad: no solo "restaurante" sino "restaurante de comida rápida", "restaurante de comida típica", "restaurante de mariscos", "cafetería", "panadería/pastelería"
- Cada plantilla tiene: CompetencyTopics específicos, EscalationRules calibradas para esa industria, KnowledgeItems base pre-llenados con ejemplos editables, preguntas sugeridas de entrenamiento específicas, y tono por defecto recomendado
- Pantalla de selección de plantilla rediseñada: búsqueda por texto, categorías colapsables, preview rico antes de seleccionar
- Plantilla "Otro negocio" con asistente: si el dueño no encuentra su industria, un flujo conversacional de 5 preguntas determina la plantilla más cercana y qué personalizar
- Opción de combinar plantillas: un negocio que es cafetería + venta de postres puede tomar elementos de dos plantillas

**Definition of Done 8.2:**
- Existen al menos 20 plantillas con datos completos y probados
- La búsqueda de plantilla por texto funciona con términos coloquiales guatemaltecos ("tienda de barrio", "taller mecánico", "bufete")
- Seleccionar una plantilla específica produce un agente notablemente mejor calibrado que la plantilla genérica anterior
- El flujo de "Otro negocio" termina con una plantilla funcional en menos de 5 minutos

### Bloque 8.3 — UX del onboarding rediseñado

**Lo que falta:** El onboarding actual es una secuencia de pasos estáticos. Debe sentirse como una conversación que avanza progresivamente y celebra cada logro.

Tareas:
- Rediseño completo del flujo de pasos: de pantallas separadas a un flujo con scroll suave y transiciones entre secciones
- Progress bar animada que avanza en tiempo real mientras el dueño llena información
- Célula de "completitud del agente" visible en todo momento: "Tu agente ya sabe el 40% de tu negocio"
- Microanimaciones de confirmación: cuando se guarda un KnowledgeItem, el chip aparece con una animación suave. Cuando se alcanza el 50% de completitud, una celebración sutil.
- Tooltips contextuales: explicaciones en lenguaje simple de para qué sirve cada dato que se pide
- Guardado automático: el dueño puede cerrar el onboarding y retomarlo exactamente donde lo dejó, desde cualquier dispositivo
- Preview del agente en tiempo real: mientras el dueño llena información, puede ver cómo respondería el agente a una pregunta de ejemplo con el conocimiento actual
- Modo "completar después": el dueño puede activar el agente con información mínima y completar el resto desde el dashboard, con recordatorios progresivos

**Definition of Done 8.3:**
- El onboarding completo (con información básica) es completable en menos de 10 minutos en móvil
- El guardado automático funciona: cerrar y reabrir retoma exactamente en el mismo punto
- El preview del agente en tiempo real responde usando el conocimiento actual con latencia menor a 2 segundos
- Las microanimaciones no afectan el rendimiento en dispositivos de gama media (Moto G-class)

---

## Fase 9 — Monetización y billing

**Objetivo:** El producto deja de ser gratuito. Los pilotos se convierten en clientes pagantes con planes diferenciados. El sistema maneja pagos, límites, upgrades y fallos de cobro de forma autónoma.

**Por qué antes del polish:** Sin monetización, no hay negocio. El polish y las mejoras de UX son inversión que solo tiene retorno si hay ingresos que la sostengan.

### Bloque 9.1 — Estructura de planes y límites

Tareas:
- Definir los 3 planes finales con sus límites exactos (basado en feedback de pilotos sobre uso real)
- Implementar enforcement de límites: mensajes por mes, negocios por cuenta, conversaciones activas simultáneas
- Tabla `subscriptions` y `usage_tracking` en base de datos
- Middleware que verifica límites antes de procesar cada mensaje entrante
- UI de "límite alcanzado": mensaje claro, opciones de upgrade, sin corte abrupto del servicio
- Período de gracia: 3 días después de alcanzar el límite antes de suspensión

**Definition of Done 9.1:**
- Un negocio en plan básico que supera su límite de mensajes recibe un aviso en la app y el agente responde con un mensaje de "servicio temporalmente pausado" al cliente
- El upgrade de plan es inmediato — los límites se actualizan en tiempo real
- El tracking de uso es preciso dentro de un margen del 1%

### Bloque 9.2 — Integración de pagos

Tareas:
- Integración de Stripe con soporte para tarjetas latinoamericanas
- Flujo de suscripción mensual: selección de plan → datos de tarjeta → confirmación → activación
- Soporte para pagos con tarjeta guatemalteca (Visa, Mastercard locales)
- Explorar soporte de pago por transferencia bancaria para negocios sin tarjeta de crédito
- Manejo de fallo de cobro: reintentos automáticos, notificación al dueño, período de gracia
- Portal de billing en el dashboard: facturas, historial de pagos, cambio de tarjeta, cancelación
- Webhook de Stripe para sincronizar estado de suscripción en tiempo real

**Definition of Done 9.2:**
- Un piloto puede suscribirse con tarjeta guatemalteca en menos de 3 minutos
- Un fallo de cobro notifica al dueño por WhatsApp personal y da 3 días de gracia antes de suspender
- El portal de billing muestra histuras descargables en PDF

### Bloque 9.3 — Trial gratuito y conversión

Tareas:
- Trial de 14 días sin tarjeta de crédito (no 30 días — el tiempo al valor es más corto)
- Contador visible de días restantes en el dashboard durante el trial
- Secuencia de emails de conversión durante el trial: día 1 (bienvenida), día 7 (cómo va tu agente), día 12 (recordatorio), día 14 (último día)
- Oferta de early adopter para los primeros 50 clientes: descuento del 30% primer año
- Flujo de upgrade suave: nunca cortar el servicio sin aviso, siempre ofrecer alternativa

**Definition of Done 9.3:**
- La tasa de conversión de trial a pago es medible en el dashboard de métricas
- Los emails de conversión se envían en el horario correcto sin intervención manual
- Un usuario que llega al día 14 sin suscribirse ve un modal de conversión antes de que el servicio se pause

---

## Fase 10 — Edge cases y resiliencia

**Objetivo:** El sistema que funciona el 95% del tiempo no es suficiente. Esta fase identifica y resuelve todos los casos que rompen la experiencia en condiciones reales de uso en Guatemala.

**Por qué después de monetización:** Los edge cases de producción solo se conocen con usuarios reales pagando. Los primeros 2-3 meses de usuarios pagantes revelan los casos que ningún documento anticipó.

### Bloque 10.1 — Edge cases del pipeline del agente

Casos identificados que necesitan solución explícita:

Tareas:
- Mensajes en idiomas mixtos: español + kaqchikel, español + inglés. El agente debe responder en el idioma principal del cliente, no forzar español.
- Mensajes de solo emojis: el cliente manda "👍" o "😊" sin texto. El agente no debe tratar esto como una pregunta sin respuesta — debe interpretar el contexto de la conversación anterior.
- Mensajes de audio de WhatsApp del cliente: el sistema actual los escala automáticamente. Esta fase implementa transcripción automática del audio del cliente antes de procesarlo.
- Mensajes con fotos de clientes: el cliente manda una foto preguntando "¿tienen algo así?". Implementar descripción visual vía Gemini Flash y procesamiento contextual.
- Conversaciones muy largas: más de 50 mensajes en un hilo. El historial de conversación (Bloque 5 del prompt) necesita estrategia de compresión para no superar límites de tokens.
- Cliente que responde mucho después: un cliente que retoma una conversación de hace 3 semanas. El agente no debe asumir continuidad — detectar conversaciones inactivas y tratarlas como nuevas.
- Múltiples clientes con el mismo número: un número de WhatsApp usado por varios miembros de una familia para un negocio compartido.
- El dueño respondiendo desde WhatsApp directamente: si el dueño responde desde el número del negocio sin pasar por la app, el sistema debe detectarlo y marcarlo para no generar respuesta duplicada.
- Mensaje de WhatsApp eliminado por el cliente: Meta envía un event de message deleted. El sistema debe marcarlo y no intentar procesarlo.

**Definition of Done 10.1:**
- Un mensaje en kaqchikel produce una Escalation con nota "idioma no identificado" en lugar de una respuesta incorrecta
- Un audio de cliente de 60 segundos produce una Suggestion basada en la transcripción correcta
- Una conversación de más de 50 mensajes no supera los límites de tokens del modelo
- Un mensaje del dueño enviado directamente desde WhatsApp no genera respuesta duplicada del agente

### Bloque 10.2 — Edge cases del onboarding

Tareas:
- Dueño que abandona el onboarding a la mitad y vuelve semanas después: el sistema retoma exactamente donde lo dejó, con los datos intactos.
- Cambio de número de WhatsApp del negocio: flujo para migrar sin perder el historial de conversaciones.
- Número de WhatsApp que ya tiene un bot de otro proveedor (ManyChat, etc.): detección y guía para desconectar el anterior antes de conectar AGENTI.
- Onboarding desde tablet o desktop: el flujo mobile-first debe ser funcional también en pantallas más grandes.
- Dueño que selecciona la industria incorrecta y quiere cambiarla después de tener conversaciones activas: migración de plantilla sin perder los KnowledgeItems aprendidos.
- Pérdida de conexión a mitad del onboarding: cada paso guarda su estado antes de avanzar.

**Definition of Done 10.2:**
- Un onboarding abandonado por 30 días retoma sin pérdida de datos
- El cambio de industria post-activación es posible con advertencia clara de lo que se resetea

### Bloque 10.3 — Resiliencia de infraestructura

Tareas:
- Qué pasa cuando Gemini Flash tiene downtime: fallback automático a modelo alternativo con latencia mayor pero sin perder mensajes
- Qué pasa cuando Meta tiene downtime: los mensajes en webhook_queue esperan hasta que Meta responda, con reintentos exponenciales
- Qué pasa cuando Supabase tiene downtime: circuit breaker en el pipeline, mensajes encolados localmente hasta que la DB vuelva
- Rate limits de Meta (1000 mensajes/segundo por WABA): detector de rate limit y throttling automático
- Alertas proactivas: si el pipeline tiene tasa de error mayor al 5% en 10 minutos, notificación inmediata al equipo de AGENTI (no al dueño)
- Dashboard de salud del sistema para el equipo: latencia del pipeline, tasa de éxito, errores por tipo, uso de tokens por proveedor

**Definition of Done 10.3:**
- Un downtime de Gemini de 10 minutos no pierde ningún mensaje — todos se procesan cuando el servicio vuelve
- El dashboard de salud muestra métricas en tiempo real con latencia menor a 30 segundos
- Una tasa de error del 10% genera una alerta al equipo en menos de 2 minutos

---

## Fase 11 — UI/UX polish y microanimaciones

**Objetivo:** La interfaz funciona. Ahora debe ser la mejor interfaz que un dueño de PYME guatemalteco haya usado en su vida. Cada interacción debe sentirse intencional, rápida y satisfactoria.

**Por qué en este punto:** El polish sin un producto estable es desperdicio. Con la resiliencia de la Fase 10 confirmada, ahora se puede invertir en la capa de experiencia sin miedo a que cambios de fondo rompan el trabajo visual.

### Bloque 11.1 — Sistema de microanimaciones

Tareas:
- Librería de animaciones: definir el vocabulario de movimiento de AGENTI. Principios: física natural (spring-based), propósito claro (cada animación comunica algo), respeto al usuario (off para usuarios con prefers-reduced-motion).
- Animaciones de entrada de contenido: las conversaciones y Suggestions no aparecen abruptamente — entran con un slide suave desde abajo.
- Animaciones de aprobación: cuando el dueño aprueba una Suggestion, una animación de "mensaje enviado" confirma la acción antes de actualizar la lista.
- Animaciones de estado del agente: el indicador de "agente pensando" (los 3 puntos) tiene timing específico basado en la latencia real del pipeline — si el pipeline tarda más de 1 segundo, el indicador aparece.
- Animaciones de carga de datos: skeleton screens en lugar de spinners. Cada pantalla tiene su skeleton específico que anticipa el layout exacto del contenido.
- Haptic feedback en móvil: vibración sutil al aprobar, al recibir una escalación urgente, al completar el onboarding.
- Transiciones entre pantallas: el bottom nav tiene transiciones de pantalla coherentes con la dirección de navegación.

**Definition of Done 11.1:**
- Todas las animaciones respetan prefers-reduced-motion
- Ninguna animación añade más de 16ms de bloqueo al hilo principal (60fps mantenido)
- El haptic feedback funciona en iOS y Android

### Bloque 11.2 — Refinamiento del home y bandeja

Tareas:
- Home rediseñado: el estado del agente ocupa el espacio correcto según el momento del dueño — si hay Suggestions pendientes, son lo primero; si todo está en calma, el resumen del día domina.
- Bandeja con swipe actions: deslizar una conversación a la derecha la aprueba directamente, deslizar a la izquierda la escala. Confirmación con haptic antes de ejecutar.
- Agrupación inteligente de conversaciones: si el mismo cliente mandó 3 mensajes distintos, se agrupan en un solo hilo con contador.
- Filtros de bandeja: solo pendientes, solo escalaciones, solo resueltas hoy. Persistencia del filtro entre sesiones.
- Búsqueda de conversaciones: por nombre de cliente, por número, por contenido del mensaje.
- Vista compacta vs vista detallada: el dueño elige la densidad de información que prefiere.

**Definition of Done 11.2:**
- El swipe de aprobación funciona correctamente con un margen de error menor al 2% de activaciones accidentales
- La búsqueda de conversaciones devuelve resultados en menos de 500ms
- El filtro de bandeja persiste entre sesiones

### Bloque 11.3 — Refinamiento del módulo de entrenamiento

Tareas:
- El componente "Dile algo a tu agente" en home soporta: texto, nota de voz, imagen, link, y combinaciones.
- Historial de instrucciones: el dueño puede ver todo lo que le ha dicho al agente en los últimos 30 días y revertir cualquier instrucción.
- Editor de KnowledgeItems: el dueño puede ver todos los KnowledgeItems del agente organizados por capa, editarlos en texto libre, desactivar los que ya no aplican.
- Mapa de competencias visual: representación visual de qué temas sabe el agente bien (verde), cuáles sabe parcialmente (amarillo), y cuáles no sabe (gris). Clicar en un tema abre el editor de ese tema.
- Sugerencias de entrenamiento del sistema: basado en el historial de correcciones, el sistema sugiere "Tu agente ha cometido este error 3 veces esta semana. ¿Quieres entrenarlo en esto?"

**Definition of Done 11.3:**
- El mapa de competencias es comprensible sin explicación para un dueño sin conocimiento técnico
- El historial de instrucciones permite revertir cualquier cambio de los últimos 30 días
- Las sugerencias de entrenamiento automáticas tienen una tasa de aceptación mayor al 40% en los primeros 30 días de uso

### Bloque 11.4 — Accesibilidad completa

Tareas:
- Audit completo de WCAG 2.1 AA: contraste de colores, tamaños de fuente mínimos, targets de toque mínimos (44px)
- Soporte completo de VoiceOver (iOS) y TalkBack (Android)
- Textos alternativos en todas las imágenes y iconos con significado
- Navegación completa con teclado externo (para usuarios con discapacidad motora)
- Modo de alto contraste respetado

**Definition of Done 11.4:**
- El audit automatizado de accesibilidad (axe, Lighthouse) pasa sin errores críticos
- Un usuario de VoiceOver puede completar el onboarding y aprobar una Suggestion sin ayuda

---

## Fase 12 — PWA + integración con landing y dominio

**Objetivo:** AGENTI es instalable como app nativa desde el browser, con la landing page oficial integrada en el mismo dominio, y con experiencia offline básica.

### Bloque 12.1 — Conversión a PWA

Tareas:
- Service Worker con estrategia de cache inteligente: el dashboard carga instantáneo aunque la conexión sea lenta (cache-first para assets, network-first para datos)
- Web App Manifest completo: nombre, iconos en todos los tamaños (192px, 512px, maskable), colores de theme (#1B4332), display standalone
- Prompt de instalación personalizado: en lugar del prompt genérico del browser, un banner propio que aparece después de 3 sesiones con beneficios claros
- Experiencia offline básica: si el dueño abre la app sin conexión, ve las conversaciones cacheadas del último acceso con un indicador de "modo offline"
- Push notifications nativas: cuando está instalada como PWA, las notificaciones usan el sistema nativo del OS en lugar de depender del browser
- Actualizaciones silenciosas: cuando hay una versión nueva del service worker, se instala en background y se activa en la próxima apertura

**Definition of Done 12.1:**
- La app es instalable desde Chrome en Android y Safari en iOS con el prompt personalizado
- El Lighthouse PWA score es mayor o igual a 90
- Las push notifications funcionan con la app instalada y el browser cerrado en Android
- El tiempo de carga en segunda visita (cached) es menor a 1 segundo en conexión 3G

### Bloque 12.2 — Integración con la landing page

Tareas:
- Integrar el diseño HTML/CSS existente de la landing en el mismo proyecto Next.js (ruta `/`)
- La landing y el dashboard comparten el mismo dominio: agenti.app (o el dominio definitivo)
- El botón "Crear mi agente gratis" de la landing lleva al registro con tracking UTM
- Demo interactiva en la landing: widget embebido que simula una conversación con el agente según la industria seleccionada, sin requerir registro
- La landing detecta si el usuario ya tiene sesión y muestra "Ir a mi agente" en lugar del CTA de registro
- SEO completo de la landing: meta tags, Open Graph, Twitter Card, sitemap.xml, robots.txt
- Página de precios integrada en la landing con los planes actuales
- Blog básico para SEO: estructura lista para publicar artículos, aunque inicie vacío

**Definition of Done 12.2:**
- La landing y el dashboard están en el mismo dominio sin redirecciones extrañas
- La demo interactiva funciona para las 6 industrias principales sin necesidad de registro
- El Lighthouse SEO score de la landing es mayor o igual a 95
- Un usuario con sesión activa que visita la landing es redirigido a su dashboard

### Bloque 12.3 — Configuración de dominio y SSL

Tareas:
- Dominio definitivo configurado en Vercel con SSL automático
- Redirects: www → sin www (o viceversa), http → https
- Configuración de headers de seguridad: CSP, HSTS, X-Frame-Options
- Email transaccional con dominio propio (no @gmail): `hola@agenti.app`, `soporte@agenti.app`
- Configuración de SPF, DKIM y DMARC para que los emails no lleguen a spam

**Definition of Done 12.3:**
- El dominio definitivo está activo con SSL
- Los emails transaccionales llegan a la bandeja principal, no spam, en Gmail y Outlook
- Los headers de seguridad pasan el test de securityheaders.com con grado A

---

## Fase 13 — Performance y escalabilidad

**Objetivo:** El sistema que funciona para 30 negocios debe funcionar para 300 sin degradación. Esta fase identifica y resuelve los cuellos de botella antes de que sean un problema real.

### Bloque 13.1 — Optimización de base de datos

Tareas:
- Query analysis: identificar las 10 queries más frecuentes y optimizarlas con EXPLAIN ANALYZE
- Índices faltantes: después de meses de uso real, los patrones de acceso revelan índices que no se anticiparon
- Particionamiento de tablas grandes: `messages` y `notifications` crecen indefinidamente — implementar particionamiento por mes
- Limpieza automática de datos antiguos: mensajes de más de 12 meses se mueven a cold storage, logs de más de 30 días se archivan
- Connection pooling: configurar pgBouncer en Supabase para manejar picos de conexiones simultáneas

**Definition of Done 13.1:**
- Las 10 queries más frecuentes tienen tiempo de ejecución menor a 50ms en p95
- Un EXPLAIN ANALYZE de las queries principales no muestra sequential scans en tablas grandes

### Bloque 13.2 — Optimización del pipeline del agente

Tareas:
- Load testing: simular 50 negocios activos simultáneos con 10 mensajes por minuto cada uno. Identificar el punto de quiebre.
- Optimización de construcción del contexto: el caché actual de 1 hora puede mejorarse con invalidación más granular
- Compresión del contexto cacheado: los Bloques 1-4 del prompt pueden comprimirse para reducir el tiempo de construcción del prompt final
- Paralelización: clasificación e inicio de construcción del contexto pueden ocurrir en paralelo
- Ajuste de timeouts según latencia real observada en producción

**Definition of Done 13.2:**
- El sistema maneja 50 negocios activos con 10 mensajes/minuto sin degradación de latencia
- El tiempo de pipeline p95 se mantiene bajo 3 segundos con carga alta

### Bloque 13.3 — Frontend performance

Tareas:
- Bundle analysis: identificar los módulos más pesados y aplicar code splitting agresivo
- Image optimization: todas las imágenes del dashboard usan next/image con tamaños correctos
- Font optimization: Geist cargado con subset correcto, sin layout shift
- Core Web Vitals: LCP menor a 2.5s, FID menor a 100ms, CLS menor a 0.1 en móvil de gama media

**Definition of Done 13.3:**
- Core Web Vitals pasan en Lighthouse para móvil con conexión 4G simulada
- El bundle inicial es menor a 200KB gzipped

---

## Fase 14 — Retención y crecimiento

**Objetivo:** Convertir usuarios activos en usuarios que no pueden vivir sin el producto, y usuarios satisfechos en fuente de referidos.

### Bloque 14.1 — Sistema de retención proactiva

Tareas:
- Detector de riesgo de churn: si un dueño no ha abierto la app en 5 días, si la tasa de aprobación cayó más del 20%, o si hay más de 10 escalaciones sin atender — activar protocolo de re-engagement
- Protocolo de re-engagement automatizado: secuencia de 3 mensajes de WhatsApp personal en 7 días con tips específicos basados en el comportamiento del dueño
- Resumen semanal automático: cada lunes a las 9am, el dueño recibe un WhatsApp con: mensajes atendidos, tasa de aprobación, tiempo ahorrado estimado, y el tema más consultado por sus clientes esa semana
- Celebraciones de hito: primera semana activa, primer mes, 100 mensajes atendidos, 500 mensajes. Cada hito tiene un mensaje especial y una micro-celebración en la app.
- Score de salud del agente visible: una métrica simple (1-100) que el dueño puede entender y mejorar entrenando al agente

**Definition of Done 14.1:**
- El detector de riesgo de churn identifica correctamente el 80% de los churns en los 5 días previos a la cancelación
- Los resúmenes semanales tienen una tasa de apertura mayor al 60% (medida por link clicks desde WhatsApp)

### Bloque 14.2 — Programa de referidos

Tareas:
- Sistema de referidos simple: cada dueño tiene un link único de referido
- Incentivo para el que refiere: 1 mes gratis por cada referido que se suscribe
- Incentivo para el referido: 30 días de trial en lugar de 14
- Dashboard de referidos: el dueño ve cuántos referidos tiene, cuántos se suscribieron, cuántos meses gratis ha ganado
- Tracking completo: UTM desde el link de referido hasta la suscripción

**Definition of Done 14.2:**
- Un dueño puede compartir su link de referido desde la app en menos de 2 toques
- El tracking de referidos es preciso y el crédito se aplica automáticamente

### Bloque 14.3 — NPS y feedback estructurado

Tareas:
- NPS automático: a los 30 días de uso activo, el dueño recibe una encuesta NPS por WhatsApp
- Feedback in-app: en momentos clave (después de aprobar la décima Suggestion, después de corregir tres veces al agente), el sistema pregunta "¿Cómo te está ayudando tu agente?" con respuesta libre
- Panel de feedback para el equipo: todas las respuestas centralizadas con tags automáticos por tema
- Cierre de loop: cuando se implementa algo basado en feedback de un usuario, ese usuario recibe un mensaje agradeciéndole por la sugerencia

**Definition of Done 14.3:**
- La tasa de respuesta al NPS es mayor al 30%
- El panel de feedback procesa las respuestas en menos de 1 hora desde que se reciben

---

## Fase 15 — Meta producción completa

**Objetivo:** Salir del modo sandbox/dev de Meta y operar en producción real con todos los números de negocio verificados y con acceso a la API completa de WhatsApp Business.

**Nota:** Esta fase tiene dependencias externas fuera del control de desarrollo — el App Review de Meta puede tomar de 2 a 8 semanas. Iniciarla con suficiente anticipación.

### Bloque 15.1 — Verificación de negocio en Meta

Tareas (proceso, no código):
- Completar la verificación de negocio de AGENTI como plataforma en Meta Business Manager
- Documentación requerida: registro de empresa, nombre legal, dirección, sitio web activo
- Configurar el perfil de WhatsApp Business de AGENTI como plataforma
- Solicitar acceso a nivel de producción (Advanced Access) para la Cloud API

**Definition of Done 15.1:**
- AGENTI tiene acceso de producción a la Cloud API de WhatsApp
- El perfil de plataforma está verificado con el badge de Meta

### Bloque 15.2 — App Review y aprobación de Message Templates

Tareas:
- Someter la app de Meta a App Review con los casos de uso documentados
- Crear y someter a aprobación todos los Message Templates necesarios: escalación urgente al dueño, resumen diario, código de verificación de onboarding, re-engagement de negocio inactivo
- Documentar el proceso de Embedded Signup completo para usuarios reales
- Testing de Embedded Signup con negocios reales en producción

**Definition of Done 15.2:**
- Todos los Message Templates necesarios están aprobados por Meta
- El Embedded Signup funciona en producción con un número de WhatsApp Business real de un piloto

### Bloque 15.3 — Migración de pilotos de sandbox a producción

Tareas:
- Protocolo de migración: por cada piloto que estaba en modo sandbox, guiarlos a conectar su número real en producción
- El historial de conversaciones y KnowledgeItems se preserva durante la migración
- Testing post-migración: verificar que el agente de cada negocio responde correctamente después de la migración
- Comunicación al piloto: mensaje claro de "tu agente ya está activo en tu número real"

**Definition of Done 15.3:**
- El 100% de los pilotos activos están en producción real, no en sandbox
- Ningún piloto perdió conversaciones históricas durante la migración

---

## Lo que este roadmap no cubre (intencional)

Estas áreas existen y son importantes, pero su momento no es ahora:

**App nativa (iOS/Android):** La PWA cubre el 90% de los casos de uso en LATAM donde el mercado es Android-dominante. Una app nativa agrega costo de desarrollo y mantenimiento de dos codebases sin proporcional retorno en el mercado objetivo inicial. Evaluar en el año 2 si los datos de uso lo justifican.

**Multi-idioma (inglés, portugués):** El producto está construido para el mercado guatemalteco y centroamericano hispanohablante. La expansión regional es una decisión de negocio que viene después de dominar el mercado local.

**API pública para integradores:** Permitir que otros sistemas (CRMs, sistemas de punto de venta) se conecten a AGENTI via API requiere un nivel de madurez del producto y de documentación que no es prioritario en este horizonte.

**Modelo de agencia (white-label):** Permitir que agencias de marketing vendan AGENTI bajo su propia marca. Evaluar cuando el producto tenga al menos 200 clientes activos.

---

## Criterio de priorización entre fases

Si en algún momento hay que elegir entre fases por limitación de tiempo o recursos, el criterio es:

1. **Primero lo que reduce churn activo.** Si usuarios están cancelando por una razón específica, esa razón tiene prioridad sobre cualquier feature nuevo.
2. **Segundo lo que aumenta conversión.** Si el trial no convierte, mejorar el onboarding o el billing tiene más retorno que el polish visual.
3. **Tercero lo que habilita más ingresos.** Monetización antes que experiencia.
4. **Cuarto lo que mejora la experiencia.** El polish y las microanimaciones son importantes pero nunca más urgentes que la retención.

---

*AGENTI — Roadmap Post-MVP v1.0*
