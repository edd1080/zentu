# AGENTI — Product Requirements Document (PRD) v1.0
## Fuente de verdad del scope del MVP

**Versión:** 1.0
**Tipo:** System Execution Doc — fuente de verdad para decisiones de scope durante el desarrollo. Cuando surja una duda sobre si algo está dentro o fuera del MVP, este documento responde. No se agrega funcionalidad al MVP sin actualizar este PRD primero.
**Referencia cruzada:** Complementa a Entregable 2 v2.0 (mapa de módulos), Entregable 3B v1.0 (inventario de pantallas), Data Entities v1.0, Event Map v1.0, TAD v1.0, Backend Logic Overview v2.0 y WhatsApp Integration Specs v1.0.

---

## 1. Qué es AGENTI y para quién es

AGENTI es un agente de IA para WhatsApp que responde mensajes de clientes en nombre de un negocio pequeño, en modo supervisado por el dueño. El dueño aprueba, edita o rechaza cada respuesta propuesta — el agente nunca actúa de forma autónoma en el MVP sin que el dueño haya habilitado esa opción explícitamente para un tema específico.

**Para quién:** dueños de PYMEs en Guatemala y LATAM que atienden clientes por WhatsApp de forma manual hoy y sienten que ese tiempo les está costando dinero o crecimiento. No es para empresas con equipos de atención al cliente. Es para el dueño que también es el que atiende.

**El problema que resuelve:** un negocio pequeño pierde clientes potenciales porque no responde rápido en WhatsApp. El dueño no puede estar pegado al teléfono todo el día. AGENTI hace que el negocio responda solo mientras el dueño supervisa en sus tiempos libres.

**La propuesta de valor central:** "Tu negocio responde solo. Tú solo supervisas."

**Mercado inicial:** Guatemala. Idioma: español guatemalteco. Timezone default: America/Guatemala.

**Industrias soportadas en MVP:** restaurante, clínica, salón, retail, gimnasio, otro (genérico).

---

## 2. Objetivo del MVP

El MVP no es una versión reducida del producto ideal. Es la versión mínima que puede demostrar que el modelo de negocio funciona con usuarios reales pagando o comprometidos a pagar.

**Objetivo concreto:** 20 a 30 negocios piloto usando AGENTI de forma autónoma — sin acompañamiento activo del equipo — durante al menos 30 días consecutivos, con al menos el 60% de ellos renovando o comprometiéndose a pagar el plan mensual al finalizar el piloto.

**Qué valida este objetivo:**
- Que el agente responde preguntas reales de clientes reales con suficiente calidad para que el dueño apruebe sin editar la mayoría de las veces
- Que el onboarding es completable de forma autónoma en menos de 20 minutos
- Que el dueño vuelve a la app al menos 3 veces por semana sin que nadie lo empuje
- Que el tiempo de respuesta percibido por el cliente mejora respecto a antes de AGENTI

**Lo que el MVP no necesita demostrar:** autonomía total del agente, múltiples negocios por cuenta, integraciones con sistemas externos, o métricas de inteligencia avanzadas.

---

## 3. Criterios de éxito medibles

Estos son los indicadores que determinan si el MVP fue exitoso. No son aspiraciones — son criterios de go/no-go para Fase 2.

| Indicador | Meta | Cómo se mide |
|---|---|---|
| Negocios piloto activos | 20-30 | Negocios con al menos 1 conversación procesada en los últimos 7 días |
| Tasa de aprobación de sugerencias sin edición | >= 60% | `suggestions aprobadas sin edición / total suggestions` por negocio |
| Tiempo de onboarding autónomo | <= 20 minutos | Desde `owner_registered` hasta `agent_activated` sin intervención del equipo |
| Retención semana 4 | >= 70% | Negocios que siguen activos 28 días después de `agent_activated` |
| NPS del piloto | >= 40 | Encuesta al día 30 del piloto |
| Tiempo promedio de aprobación | <= 5 minutos | Desde `suggestion_generated` hasta `suggestion_approved` o `suggestion_edited` |

---

## 4. Scope del MVP — qué está dentro

### 4.1 Onboarding completo (Mundo 1)

**Dentro:**
- Registro con email + contraseña y opción de Google OAuth
- Verificación de número personal por WhatsApp con código de 6 dígitos
- Selección de industria con preview de plantilla (6 industrias)
- Captura de conocimiento inicial por texto libre, nota de voz, imagen OCR y link de sitio web
- Configuración de reglas de escalamiento iniciales con toggles por industria
- Conexión de WhatsApp Business vía Meta Embedded Signup
- Soporte de coexistencia con WhatsApp Business App
- Omisión de la conexión con sandbox como alternativa
- Prueba del agente en sandbox con chat real y correcciones persistentes
- Activación del agente

**Fuera:**
- Registro por número de teléfono sin email
- Onboarding por video o llamada asistida (puede existir como concierge manual, no como flujo del producto)
- Importación de datos desde CRM, hojas de cálculo u otros sistemas
- Configuración de múltiples agentes en el mismo onboarding
- Selección de idioma distinto al español

### 4.2 Operación diaria (Mundo 2)

**Dentro:**
- Home con estado del agente, instrucción rápida y bandeja resumida
- Bandeja de conversaciones con tres secciones: necesitan atención, atendidas, archivadas
- Vista de conversación individual con hilo de mensajes completo
- Modo colaborador: aprobar, editar, rechazar sugerencias del agente
- Clasificación de correcciones: permanente, temporal con fecha, solo esta vez
- Escalamiento en tres niveles: informativo, sensible, urgente
- Mensaje de contención automático para escalamientos sensibles y urgentes
- Escalamiento urgente con notificación al número personal del dueño si no hay respuesta en 5 minutos
- Respuesta de espera automática cuando una Suggestion lleva más de 30 minutos sin resolución

**Fuera:**
- Responder múltiples conversaciones en batch desde la bandeja
- Asignar conversaciones a otros miembros del equipo
- Etiquetas o categorías manuales de conversaciones
- Búsqueda de conversaciones por contenido
- Exportar historial de conversaciones
- Vista de perfil del cliente con historial completo unificado

### 4.3 Entrenamiento (Mundo 3)

**Dentro:**
- Instrucción rápida desde el home: texto, nota de voz, imagen OCR, link
- Confirmación del agente con validación del dueño antes de persistir
- Clasificación de vigencia de instrucciones: permanente, temporal, una sola vez
- Mapa de competencias por tema con indicador de tres estados (verde/amarillo/rojo)
- Historial de aprendizaje con opción de revertir cualquier entrada
- Oportunidades de entrenamiento: lista de temas donde el agente no pudo responder bien

**Fuera:**
- Subida de documentos PDF o Word para alimentar el agente
- Entrenamiento por conversación: marcar un hilo completo como fuente de conocimiento
- Generación automática de FAQ desde el historial
- Editor visual de conocimiento por capa (el dueño ve los KnowledgeItems individuales como lista editable)

### 4.4 Configuración (Mundo 4)

**Dentro:**
- Perfil del negocio editable (los mismos campos del onboarding, siempre accesibles)
- Reglas de escalamiento avanzadas con estadísticas de frecuencia por tema
- Nivel de autonomía por tema (Nivel 0 colaborador, Nivel 1 autónomo con guardrails)
- Estado y reconexión del canal de WhatsApp
- Configuración de notificaciones push y resumen diario por WhatsApp
- Datos de cuenta del dueño y plan activo

**Fuera:**
- Nivel 2 de autonomía (autónomo amplio) — disponible en Fase 2 después de validar Nivel 1
- Horarios de atención configurables con fuera de horario automático
- Múltiples números de WhatsApp por negocio
- Gestión de facturación y cambio de plan dentro del producto (se maneja externamente en el piloto)
- Configuración de plantillas de mensajes de Meta para mensajes iniciados por el negocio
- Control parental o permisos por usuario

### 4.5 Inteligencia (Mundo 5)

**Dentro:**
- Resumen semanal de actividad en lenguaje humano (conversaciones atendidas, tasa de autonomía, tiempo estimado ahorrado)
- Resumen de primera semana con análisis de temas fuertes y débiles
- Lista de oportunidades de entrenamiento agrupadas por tema

**Fuera:**
- Dashboard con gráficas de tendencias históricas
- Comparativa con promedios de la industria
- Exportación de reportes
- Análisis de sentimiento de los clientes
- Predicciones o recomendaciones basadas en ML propio

### 4.6 Notificaciones

**Dentro:**
- Push para Suggestions pendientes (agrupadas en ventanas de 15 minutos, máximo 8 pushes/día)
- Push inmediata para escalamientos sensibles
- Push inmediata para escalamientos urgentes
- WhatsApp al número personal del dueño para urgencias no atendidas en 5 minutos
- WhatsApp diario con resumen de actividad (si hubo actividad)
- WhatsApp de primera semana a los 7 días de activación
- Silencio nocturno entre 10 PM y 7 AM (excepto urgencias)
- In-app para sugerencias de autonomía cuando el sistema detecta un tema maduro

**Fuera:**
- Email transaccional para notificaciones operativas (solo para comunicaciones de cuenta: bienvenida, cambio de contraseña, facturación)
- SMS como canal alternativo a WhatsApp
- Notificaciones configurables por tipo de evento a nivel granular

### 4.7 Landing page y adquisición (Mundo 0)

**Dentro:**
- Landing page con headline, propuesta de valor, demo interactiva, pricing y captura de registro
- Demo interactiva que simula el agente sin crear cuenta
- Pre-carga de industria desde la demo al registro

**Fuera:**
- Blog o contenido SEO
- Página de casos de éxito o testimonios (se agregan cuando existan pilotos reales)
- Programa de referidos
- Integración con herramientas de analytics de marketing

---

## 5. Industrias y plantillas del MVP

Cada industria tiene una plantilla con contenido predeterminado. El contenido exacto de cada plantilla es seed data que se construye una vez y se puede actualizar sin cambios en el código.

### Restaurante
**CompetencyTopics predeterminados:** horarios, menú y precios, tipo de cocina, opciones de pedido (delivery, para llevar, comer en el lugar), reservaciones, métodos de pago, ubicación y cómo llegar.
**EscalationRules predeterminadas:** grupo grande (más de 8 personas), queja sobre un pedido, solicitud de factura, alérgenos o restricciones dietéticas especiales.
**Keywords de emergencia:** intoxicación, alergia severa, accidente.

### Clínica / consultorio
**CompetencyTopics predeterminados:** horarios de atención, especialidades, cómo agendar cita, seguros médicos aceptados, ubicación, precios de consulta.
**EscalationRules predeterminadas:** emergencia médica, resultados de exámenes, solicitud de receta, segundo opinión, cancelación de cita del mismo día.
**Keywords de emergencia:** emergencia, urgente, dolor fuerte, sangrado, desmayo.

### Salón de belleza
**CompetencyTopics predeterminados:** servicios y precios, duración de cada servicio, disponibilidad de citas, estilistas disponibles, productos usados, horarios.
**EscalationRules predeterminadas:** cita grupal (más de 3 personas), servicio que requiere evaluación previa, queja sobre resultado.
**Keywords de emergencia:** reacción alérgica, quemadura.

### Retail / tienda
**CompetencyTopics predeterminados:** productos disponibles, precios, horarios, métodos de pago, políticas de cambio y devolución, disponibilidad de stock, envíos.
**EscalationRules predeterminadas:** pedido mayorista, reclamación por producto dañado, cotización personalizada.
**Keywords de emergencia:** ninguno predeterminado.

### Gimnasio
**CompetencyTopics predeterminados:** membresías y precios, horarios de clases, entrenadores disponibles, instalaciones, políticas de cancelación.
**EscalationRules predeterminadas:** lesión o accidente, solicitud de entrenamiento personalizado, congelamiento de membresía.
**Keywords de emergencia:** accidente, lesión, dolor fuerte.

### Otro (genérico)
**CompetencyTopics predeterminados:** horarios, servicios principales, precios, métodos de pago, ubicación, cómo contactar.
**EscalationRules predeterminadas:** queja, solicitud urgente.
**Keywords de emergencia:** urgente, emergencia.

---

## 6. Reglas de comportamiento del agente en el MVP

Estas reglas son invariantes. Se implementan en el prompt del agente y en la lógica de guardrails del backend. No se pueden desactivar en el MVP.

El agente siempre responde en español, independientemente del idioma en que escriba el cliente. Si el cliente escribe en otro idioma, el agente responde en español con una nota amigable.

El agente nunca se identifica como una inteligencia artificial a menos que el cliente lo pregunte directamente. Si el cliente pregunta directamente, el agente confirma que es un asistente virtual del negocio sin más detalle.

El agente nunca inventa información. Si no tiene el dato en su conocimiento, no lo dice — escala o responde que no tiene esa información disponible y que el equipo del negocio puede ayudar.

El agente nunca hace promesas que contradigan las reglas operativas del negocio (Capa 2 del conocimiento).

El agente nunca da información de contacto que no esté en el perfil del negocio.

El agente nunca procesa multimedia entrante del cliente en el MVP. Imágenes, audios y documentos del cliente escalan automáticamente como informativo.

El agente nunca inicia conversaciones con clientes. Solo responde mensajes entrantes.

---

## 7. Stack tecnológico del MVP

Estas decisiones están cerradas. No se evalúan alternativas durante el desarrollo del MVP.

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | Next.js + Tailwind CSS | Mobile-first, SSR para landing, familiar para vibe coding |
| Base de datos | Supabase (PostgreSQL) | Auth, storage, realtime y edge functions en un solo proveedor |
| Backend / API | Supabase Edge Functions (Deno) | Sin servidor separado, latencia baja, integración nativa con Supabase |
| LLM principal | Gemini Flash 2.5 (Google AI) | Mejor ratio costo/calidad/latencia LATAM para el MVP |
| LLM fast/cheap | Qwen2.5-72B via Together.ai | Clasificación e inferencias ligeras a costo mínimo |
| Canal de mensajería | Meta Cloud API | Acceso directo sin intermediarios |
| Conexión de negocios | Meta Embedded Signup | Onboarding self-serve del canal |
| Email transaccional | Resend | Simple, confiable, barato |
| Tipografía | Geist (UI) + Instrument Serif (display) | Sistema tipográfico ya definido en diseño |
| Iconos | Lucide Icons | Consistente con el design system |
| Deploy | Vercel (frontend) | Integración nativa con Next.js |

**Abstracción de proveedores LLM:** el motor del agente nunca llama directamente a la API de Gemini o Together.ai. Toda llamada pasa por una capa de abstracción que permite cambiar de proveedor cambiando variables de entorno sin modificar lógica de negocio. Ver TAD v1.0 para el detalle.

---

## 8. Pantallas del MVP

27 pantallas esenciales. Sin estas no existe el producto. El detalle de cada pantalla está en Entregable 3B v1.0 y Entregable 6 v2.0.

**Públicas:** landing page, demo interactiva, captura de lead no convertido.

**Acceso:** crear cuenta, verificación por código, login, recuperar acceso.

**Onboarding:** selección de industria, personalización del negocio, fuentes adicionales, reglas de escalamiento, conectar WhatsApp, estado de conexión, prueba del agente, activación, dashboard primera vez.

**Operación diaria:** home, bandeja de conversaciones, conversación individual con modo colaborador integrado, mapa de competencias, conocimiento actual, ajustes básicos, soporte contextual.

**7 pantallas de MVP+ que se agregan inmediatamente después del piloto si las métricas lo justifican:** historial de aprendizaje, resumen de actividad, oportunidades de entrenamiento, autonomía por tema, canal de WhatsApp (gestión), cuenta y notificaciones (avanzado), perfil del negocio (avanzado).

---

## 9. Flujos críticos del MVP

Estos son los flujos que deben funcionar perfectamente antes del lanzamiento del piloto. Un fallo en cualquiera de estos flujos es un blocker de go-live.

**Flujo 1 — Onboarding autónomo completo:** un dueño puede registrarse, configurar su negocio, conectar WhatsApp y activar su agente sin ayuda del equipo de AGENTI. Tiempo objetivo: menos de 20 minutos.

**Flujo 2 — Recepción y sugerencia:** cuando un cliente escribe al número del negocio, el agente genera una Suggestion en menos de 2 segundos desde la llegada del mensaje al webhook. El dueño recibe notificación push.

**Flujo 3 — Aprobación de sugerencia:** el dueño aprueba la Suggestion en la app. El mensaje llega al cliente en menos de 1 segundo desde la aprobación. La conversación se marca como resuelta.

**Flujo 4 — Edición y aprendizaje:** el dueño edita la sugerencia, la envía, clasifica la corrección como permanente. La próxima vez que llegue una pregunta similar, el agente usa el dato actualizado.

**Flujo 5 — Escalamiento urgente:** el agente detecta una situación que no puede manejar y la marca como urgente. Se envía mensaje de contención al cliente. El dueño recibe push inmediata. Si no abre la app en 5 minutos, recibe WhatsApp en su número personal.

**Flujo 6 — Instrucción rápida:** el dueño escribe una instrucción en el QuickInstruct del home. El agente confirma lo que entendió. El dueño confirma. El conocimiento se actualiza y el caché del agente se invalida. La próxima conversación ya usa el nuevo dato.

**Flujo 7 — Reconexión de WhatsApp:** el token del negocio se invalida. El agente se detiene. El dueño ve el indicador de error. Completa el flujo de reconexión. El agente retoma operación.

---

## 10. Criterios de Definition of Done del MVP completo

El MVP está listo para el piloto cuando todos estos criterios se cumplen sin excepción.

**Onboarding:** un usuario sin conocimiento previo del producto puede completar el onboarding en menos de 20 minutos en un dispositivo móvil. El agente queda activo y responde correctamente al menos 3 preguntas de prueba sobre la información ingresada.

**Motor del agente:** el tiempo desde que Meta entrega el webhook hasta que la Suggestion aparece en la app del dueño es menor a 3 segundos en el 90% de los casos en condiciones normales de red.

**Modo colaborador:** aprobar, editar y rechazar Suggestions funciona sin errores. El mensaje llega al cliente correctamente en los tres casos. La corrección permanente se refleja en la siguiente Suggestion del mismo tipo.

**Escalamiento:** los tres niveles de escalamiento funcionan correctamente. Los mensajes de contención se envían automáticamente para sensible y urgente. La notificación por WhatsApp al número personal del dueño se envía cuando corresponde.

**Notificaciones:** las pushes se envían sin duplicaciones. El silencio nocturno funciona. Los resúmenes diarios llegan al número personal del dueño si hubo actividad.

**Reconexión:** cuando el token de Meta se invalida artificialmente en pruebas, el sistema detecta el error, detiene el agente, notifica al dueño y permite reconectar desde M4.4.

**Seguridad:** ninguna credencial de Meta, ningún access token y ningún App Secret es accesible desde el frontend. Todas las llamadas a la API de Meta ocurren desde Edge Functions.

**Datos:** no existe ningún KnowledgeItem sin KnowledgeSource asociado. No existe ninguna Suggestion sin trace_id en los logs del sistema.

---

## 11. Lo que explícitamente no es el MVP

Para evitar scope creep durante el desarrollo, esta lista de exclusiones es tan importante como el scope incluido.

**No es multi-tenant por negocio.** En el MVP, un Owner tiene un Business y un Agent. El modelo de datos soporta múltiples en el futuro, pero la interfaz y el flujo del MVP sirven exactamente a uno.

**No tiene facturación integrada.** El cobro del piloto se maneja manualmente o con un link de pago externo. La gestión de planes dentro del producto es Fase 2.

**No tiene app nativa.** Es una PWA mobile-first. El comportamiento debe ser indistinguible de una app nativa en uso real, pero no se publica en App Store ni Google Play en el MVP.

**No tiene integración con agenda, CRM ni sistemas externos.** El agente captura intención de agendar y escala. La integración real con calendarios o sistemas del negocio es Fase 3.

**No procesa multimedia entrante del cliente.** Imágenes y audios que manda el cliente escalan automáticamente. El agente no los procesa ni los describe.

**No inicia conversaciones con clientes.** Solo responde mensajes entrantes. Los resúmenes de WhatsApp y las notificaciones urgentes van al número personal del dueño, no a los clientes.

**No tiene dark mode.** Decisión de diseño para el MVP. Se evalúa en Fase 2.

**No tiene soporte multi-idioma.** El producto es en español. El agente responde en español. La internacionalización es Fase 3.

---

## 12. Riesgos conocidos del MVP y mitigaciones

**Riesgo 1 — Calidad del agente insuficiente para el piloto.**
Si el agente genera Suggestions que el dueño rechaza o edita más del 40% de las veces, el valor percibido baja y la retención se ve afectada.
Mitigación: las primeras dos semanas del piloto son acompañadas. El equipo revisa los logs de cada negocio y detecta temas donde el agente está fallando para ayudar al dueño a entrenar. El umbral de calidad mínimo antes de dejar a un negocio autónomo es 60% de aprobación sin edición en los primeros 3 días.

**Riesgo 2 — Abandono en el onboarding.**
El Embedded Signup de Meta es el paso con mayor probabilidad de abandono. Si el dueño no tiene clara la diferencia entre su número personal y el número del negocio, o si tiene problemas con su Business Manager de Meta, puede abandonar antes de activar el agente.
Mitigación: la opción de omitir la conexión de WhatsApp y probar en sandbox reduce la fricción. El concierge manual del equipo está disponible para desbloquear casos atascados durante el piloto.

**Riesgo 3 — Tokens de Meta que expiran o se invalidan inesperadamente.**
Meta puede invalidar tokens si el usuario revoca permisos, si hay cambios en la configuración de la app, o si hay actividad inusual en la cuenta.
Mitigación: la verificación de salud de tokens corre cada 6 horas. La detección de error 401 en cualquier llamada a Meta dispara el flujo de reconexión inmediatamente. El dueño siempre sabe el estado de su conexión desde el home.

**Riesgo 4 — Volumen de mensajes mayor al estimado.**
Si un negocio piloto recibe más de 150 mensajes por día, el costo de LLM puede superar el margen esperado.
Mitigación: el costo estimado incluso a 3x el volumen proyectado sigue siendo menor al 10% del revenue por negocio. Monitorear el consumo de tokens por negocio desde el inicio del piloto para detectar outliers.

**Riesgo 5 — El dueño no vuelve a la app después de la activación.**
Si el dueño activa el agente pero no aprueba las Suggestions a tiempo, el cliente queda esperando y la propuesta de valor se invierte.
Mitigación: el resumen de primera semana a los 7 días incluye una recomendación de tiempo de respuesta objetivo. El mensaje de espera automático protege al cliente cuando el dueño no aprueba en 30 minutos. La retención se monitorea semanalmente durante el piloto.

---

## 13. Preguntas abiertas del MVP

Estas son las decisiones de producto que no están cerradas en este documento y que deben resolverse durante el desarrollo o el piloto.

**Tiempo de expiración de Suggestions.** El default es 30 minutos durante horario de atención. ¿Es ese el tiempo correcto para el mercado guatemalteco? Puede ser muy corto para negocios donde el dueño solo revisa la app 2-3 veces al día, o muy largo para negocios de alta velocidad como restaurantes. Se validará con los primeros pilotos y se convierte en configurable si hay varianza significativa entre industrias.

**Mensaje de contención estándar.** El texto exacto del mensaje de contención automático que va al cliente en escalamientos sensibles y urgentes. Debe estar definido antes del go-live del piloto. Es un texto fijo en el MVP — no personalizable por negocio todavía.

**Precio del piloto.** El PRD no cierra el precio. Las opciones son $19, $29 o $39/mes. Se define fuera de este documento con base en la disposición a pagar que se detecte en las conversaciones de venta de los pilotos.

**Criterio de madurez para sugerir autonomía.** El TAD define `approval_rate_7d >= 0.85`, `incident_count_7d = 0` y `coverage_percentage >= 70` como criterios para que el sistema sugiera activar autonomía en un tema. Estos números se ajustarán con datos reales de los pilotos.

---

*AGENTI — PRD v1.0*
