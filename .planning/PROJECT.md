# AGENTI — Resumen Ejecutivo del Proyecto

## Qué es AGENTI

Agente de IA para WhatsApp que responde mensajes de clientes en nombre de negocios pequeños en Guatemala y LATAM. El dueño del negocio supervisa desde una app mobile-first: aprueba, edita o rechaza cada sugerencia. El agente nunca actúa de forma autónoma sin habilitación explícita.

**Propuesta de valor:** "Tu negocio responde solo. Tú solo supervisas."

**Modelo de negocio:** SaaS, $19-$59 USD/mes, bootstrapped. Objetivo MVP: 20-30 pilotos reales operando autónomamente durante 30 días, con >= 60% de renovación.

## Usuario objetivo

Dueño de PYME que atiende WhatsApp personalmente. No tiene equipo de atención al cliente. No es técnico. Juzga el producto en los primeros 5 minutos.

**Industrias MVP:** restaurante, clínica, salón, retail, gimnasio, otro (genérico).

**Mercado inicial:** Guatemala. Idioma: español guatemalteco. Timezone: America/Guatemala.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Base de datos | Supabase (PostgreSQL) |
| Backend | Supabase Edge Functions (Deno) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| LLM principal | Gemini Flash 2.5 (Google AI) — temp 0.3, max 600 tokens |
| LLM fast/cheap | Qwen2.5-72B via Together.ai — temp 0.1, max 200 tokens |
| Canal WhatsApp | Meta Cloud API |
| Conexión negocios | Meta Embedded Signup |
| Email transaccional | Resend |
| Deploy frontend | Vercel |
| Tipografía | Geist (UI) + Instrument Serif (display/celebración) |
| Iconos | Lucide Icons |

Todo el backend vive en Supabase Edge Functions. No hay servidor separado.

## Estructura de módulos

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

**Navegación:** 5 tabs en bottom nav (Inicio, Conversaciones, Agente, Entrenar, Ajustes). Mobile-first. Sin dark mode en MVP.

## Entidades principales

- **Owner** — dueño autenticado, con phone_personal para notificaciones
- **Business** — el negocio, con phone_business (WhatsApp conectado), industry, schedule
- **Agent** — el agente del negocio (inactive / sandbox / active / paused / error)
- **Conversation** — hilo con un cliente, con status y priority
- **Message** — mensaje individual, con direction y sender_type
- **Suggestion** — respuesta propuesta por el agente, con confidence_tier (high/medium/low)
- **Escalation** — escalamiento (informative / sensitive / urgent)
- **KnowledgeItem** — unidad de conocimiento (structured / operational / narrative / learned)
- **KnowledgeSource** — origen de cada KnowledgeItem

## Edge Functions (12)

whatsapp-webhook, process-message, whatsapp-connect, send-message, approve-suggestion, edit-and-send-suggestion, reject-suggestion, classify-correction, process-quick-instruct, confirm-instruction, build-agent-context, generate-daily-summary, send-notification

## Pipeline del agente (resumen)

1. Meta envía mensaje al webhook → responde 200 inmediatamente
2. Identifica negocio, verifica agente activo
3. Filtros determinísticos (duplicados, multimedia, keywords)
4. Construye prompt con conocimiento del negocio (4 capas)
5. LLM fast clasifica intención
6. LLM principal genera respuesta
7. Calcula confidence_tier (determinístico), aplica guardrails
8. Crea Suggestion o Escalation
9. Notifica al dueño

**Presupuesto de latencia:** clasificación 500ms, generación 2s, total p90 < 3s.

## Principio de trabajo

"Cálido, simple y operativo." El agente nunca inventa, nunca promete, nunca actúa sin evidencia. Si algo no está especificado en los docs, se pregunta antes de inventar.
