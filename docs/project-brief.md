# AGENTI — Project Brief v1.0
## Orientación de sesión para el agente de desarrollo

**Versión:** 1.0
**Tipo:** Session Layer Doc — se lee al inicio de cada sesión de desarrollo. Es el documento más corto del sistema pero el más leído. Su función es dar contexto suficiente para que el agente de desarrollo entienda qué es el producto, cómo está construido y cómo trabaja — antes de leer cualquier otro documento.
**Longitud intencionalmente corta:** este documento no reemplaza a los docs técnicos. Los referencia. No debe crecer.

---

## Qué es AGENTI

AGENTI es un agente de IA para WhatsApp que responde mensajes de clientes en nombre de negocios pequeños en Guatemala y LATAM. El dueño del negocio supervisa las respuestas desde una app mobile-first: aprueba, edita o rechaza cada sugerencia del agente. El agente nunca actúa de forma autónoma sin que el dueño lo haya habilitado explícitamente para un tema específico.

Propuesta de valor: "Tu negocio responde solo. Tú solo supervisas."

El producto tiene dos mundos que deben sentirse como uno solo. El mundo del onboarding, que ocurre una vez y construye el agente. Y el mundo operativo, que ocurre todos los días y es donde el dueño vive el valor real.

---

## Quién lo usa

**El dueño del negocio.** No tiene equipo de atención al cliente — él mismo atiende el WhatsApp hoy. Puede ser el dueño de un restaurante, un salón, una clínica pequeña, una tienda o un gimnasio. No es técnico. No lee manuales. Juzga el producto en los primeros 5 minutos de uso.

Industrias soportadas en el MVP: restaurante, clínica, salón, retail, gimnasio, otro (genérico).

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Base de datos | Supabase (PostgreSQL) |
| Backend | Supabase Edge Functions (Deno) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| LLM principal | Gemini Flash 2.5 (Google AI) |
| LLM fast/cheap | Qwen2.5-72B via Together.ai |
| Canal WhatsApp | Meta Cloud API |
| Conexión negocios | Meta Embedded Signup |
| Email transaccional | Resend |
| Deploy frontend | Vercel |
| Tipografía | Geist (UI) + Instrument Serif (display) |
| Iconos | Lucide Icons |

Todo el backend vive en Supabase Edge Functions. No hay servidor separado. No hay otro proveedor de infraestructura en el MVP.

---

## Estructura del producto

El producto tiene 5 mundos organizados en módulos:

```
MUNDO 0 — Adquisición (landing page)
MUNDO 1 — Onboarding (ocurre una vez)
  M1.1 Registro y verificación
  M1.2 Selección de industria
  M1.3 Conocimiento inicial
  M1.4 Reglas de escalamiento
  M1.5 Conexión de WhatsApp
  M1.6 Prueba del agente

MUNDO 2 — Operación diaria (el producto real)
  M2.1 Home / Command center
  M2.2 Bandeja de conversaciones
  M2.3 Vista de conversación individual
  M2.4 Modo colaborador (aprobar / editar / rechazar)
  M2.5 Escalamiento y acción urgente

MUNDO 3 — Entrenamiento
  M3.1 Instrucción rápida
  M3.2 Estado del agente (mapa de competencias)
  M3.3 Historial de aprendizaje

MUNDO 4 — Configuración
  M4.1 Perfil del negocio
  M4.2 Reglas de escalamiento avanzadas
  M4.3 Nivel de autonomía por tema
  M4.4 Canal de WhatsApp
  M4.5 Cuenta y notificaciones

MUNDO 5 — Inteligencia
  M5.1 Resumen de actividad
  M5.2 Oportunidades de entrenamiento
```

Navegación: 5 tabs en bottom nav (Inicio, Conversaciones, Agente, Entrenar, Ajustes). Mobile-first. Sin dark mode en el MVP.

---

## Cómo funciona el motor del agente

Cuando un cliente escribe al WhatsApp del negocio, el sistema ejecuta este pipeline en orden:

1. Meta envía el mensaje al webhook de AGENTI vía POST
2. El webhook responde 200 a Meta inmediatamente, luego procesa
3. El sistema identifica el negocio y verifica que el agente esté activo
4. Aplica filtros determinísticos: duplicados, tipo de mensaje (multimedia escala automáticamente), keywords de escalamiento
5. Si el mensaje pasa los filtros, construye el prompt del agente con el conocimiento del negocio
6. Llama al modelo fast/cheap para clasificar la intención del mensaje
7. Llama al modelo principal para generar la respuesta propuesta
8. Evalúa el output: calcula confidence, aplica guardrails, decide si sugerir o escalar
9. Crea una Suggestion (si puede responder) o una Escalation (si no puede o no debe)
10. Notifica al dueño según las reglas del sistema de notificaciones

El conocimiento del negocio se organiza en 4 capas: estructurado (datos precisos), operativo (reglas de comportamiento), narrativo (tono y descripciones), aprendido (respuestas validadas). El agente nunca inventa datos — si no tiene el dato, escala o indica que no tiene esa información.

---

## Entidades principales del sistema

Las entidades que el agente de desarrollo va a usar con más frecuencia:

**Owner** — el dueño autenticado. Tiene `phone_personal` para notificaciones.

**Business** — el negocio. Tiene `phone_business` (el número de WhatsApp conectado), `whatsapp_status`, `industry`, `schedule`.

**Agent** — el agente del negocio. `status` (inactive / sandbox / active / paused / error), `mode` (collaborator / autonomous_partial).

**Conversation** — un hilo con un cliente. `status` (active / pending_approval / escalated_* / resolved / archived), `priority`.

**Message** — un mensaje individual. `direction` (inbound / outbound), `sender_type` (client / agent / owner / system).

**Suggestion** — la respuesta propuesta por el agente. `status` (pending / approved / edited / rejected / expired / auto_sent), `confidence_tier` (high / medium / low).

**Escalation** — un escalamiento. `level` (informative / sensitive / urgent), `status` (active / attended / resolved).

**KnowledgeItem** — una unidad de conocimiento del agente. `layer` (structured / operational / narrative / learned), `validity` (permanent / temporary / one_time), `active`.

**KnowledgeSource** — el origen de cada KnowledgeItem. `type` (onboarding / quick_instruct / voice_note / image_ocr / link_extraction / correction).

El modelo de datos completo con todos los atributos, enums y relaciones está en **Data Entities v1.0**.

---

## Edge Functions del sistema

11 funciones. Cada una tiene responsabilidad única.

| Función | Qué hace |
|---|---|
| `whatsapp-webhook` | Recibe eventos de Meta. Responde 200 inmediatamente. Invoca `process-message` async. |
| `process-message` | Pipeline completo de un mensaje entrante. Solo la invocan el webhook y el job de reintento. |
| `whatsapp-connect` | Maneja el Embedded Signup: intercambia code por token, registra el número, suscribe webhook. |
| `send-message` | Envía un mensaje al cliente por WhatsApp API. Maneja reintentos. |
| `approve-suggestion` | Aprueba una Suggestion: actualiza estado, invoca send-message, resuelve conversación. |
| `edit-and-send-suggestion` | Edita una Suggestion y la envía: crea KnowledgeSource de corrección. |
| `reject-suggestion` | Rechaza una Suggestion: recibe respuesta manual del dueño, crea KnowledgeSource. |
| `classify-correction` | Clasifica vigencia de una corrección: abstrae el dato, crea KnowledgeItem, invalida caché. |
| `process-quick-instruct` | Procesa instrucción del dueño: abstrae, devuelve confirmación para validar. |
| `confirm-instruction` | Confirma instrucción validada por el dueño: crea KnowledgeItem, invalida caché. |
| `build-agent-context` | Construye o reconstruye el caché de contexto de un negocio (Bloques 1-4 del prompt). |
| `generate-daily-summary` | Genera el DailySummary y lo envía por WhatsApp al número personal del dueño. |
| `send-notification` | Envía una notificación push o WhatsApp al dueño. |

---

## Jobs programados (cron via pg_cron)

| Job | Frecuencia | Qué hace |
|---|---|---|
| Reintento de webhooks | Cada 2 min | Reprocesa `webhook_queue` pendientes < 30 min |
| Expiración de KnowledgeItems | Cada hora | Desactiva ítems vencidos, invalida cachés |
| Expiración de Suggestions | Cada 10 min | Marca como expired, envía mensaje de espera al cliente |
| Resúmenes diarios | 7:30 PM por timezone | Genera y envía DailySummary con actividad del día |
| Salud de WhatsApp | Cada 6 horas | Verifica tokens de todos los negocios conectados |
| Métricas y autonomía | 2 AM diario | Recalcula métricas de CompetencyTopics, evalúa sugerencias de autonomía, procesa aprendizaje implícito |

---

## Variables de entorno requeridas

```
# Supabase
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY

# Meta / WhatsApp
WHATSAPP_APP_ID
WHATSAPP_APP_SECRET
WHATSAPP_WEBHOOK_VERIFY_TOKEN
WHATSAPP_GRAPH_API_VERSION=v21.0
WHATSAPP_GRAPH_API_BASE=https://graph.facebook.com/v21.0

# LLM — Principal
LLM_PRIMARY_PROVIDER=gemini
LLM_PRIMARY_MODEL=gemini-2.5-flash
LLM_PRIMARY_API_KEY
LLM_PRIMARY_MAX_TOKENS=600
LLM_PRIMARY_TEMPERATURE=0.3

# LLM — Fast/Cheap
LLM_FAST_PROVIDER=together
LLM_FAST_MODEL=Qwen/Qwen2.5-72B-Instruct-Turbo
LLM_FAST_API_KEY
LLM_FAST_MAX_TOKENS=200
LLM_FAST_TEMPERATURE=0.1

# Email
RESEND_API_KEY

# Encriptación
APP_ENCRYPTION_KEY
```

---

## Documentos de referencia del sistema

Leer en el orden indicado según el tipo de sesión.

| Documento | Cuándo leerlo |
|---|---|
| **Project Brief v1.0** (este documento) | Siempre, al inicio de cada sesión |
| **PRD v1.0** | Cuando haya duda sobre si algo está dentro o fuera del scope |
| **Data Entities v1.0** | Antes de tocar base de datos, crear tablas o trabajar con datos |
| **Event Map v1.0** | Antes de implementar cualquier acción del usuario o lógica del sistema |
| **TAD v1.0** | Antes de construir el motor del agente, la integración de WhatsApp o la lógica de LLM |
| **WhatsApp Integration Specs v1.0** | Al construir todo lo relacionado con Meta: webhook, Embedded Signup, envío de mensajes |
| **Backend Logic Overview v2.0** | Al construir Edge Functions, el pipeline de mensajes o la lógica de aprendizaje |
| **Entregable 5 v1.0** | Al construir cualquier componente de UI (design system, colores, tipografía, componentes) |
| **Entregable 6 v2.0** | Al construir frontend: especificaciones por módulo, estados de pantalla, UX writing |

---

## Principio de trabajo

El producto se construye bloque por bloque en orden de dependencia. Cada bloque tiene un Definition of Done que debe cumplirse antes de avanzar al siguiente. No se construye el bloque N+1 con el bloque N incompleto o sin conectar.

El diseño del producto sigue el principio "Cálido, simple y operativo." Cualquier decisión de UI no especificada en los documentos de diseño se resuelve con ese principio como guía, no con intuición propia.

El agente del negocio nunca inventa, nunca promete, nunca actúa sin evidencia en su conocimiento. Esa restricción aplica también al desarrollo: si algo no está especificado en los documentos, se pregunta antes de inventar.

---

*AGENTI — Project Brief v1.0*
