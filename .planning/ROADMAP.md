# AGENTI — Roadmap de Desarrollo

7 fases, 16 bloques. Estimado total: 10-17 sesiones de Claude Code.
Principio: de adentro hacia afuera (DB → backend → motor → frontend).

---

## Fase 1 — Fundación y base de datos
**Objetivo:** El proyecto existe, corre localmente, la DB tiene todas las tablas del MVP y las migraciones son reproducibles.

| Bloque | Nombre | DoD resumido |
|---|---|---|
| 1.1 | Setup del proyecto | `npm run dev` y `supabase start` corren sin errores; CLAUDE.md, .planning/ y commit inicial existen |
| 1.2 | Esquema de base de datos | 4 migraciones corren sin errores; 6 IndustryTemplates con seed data completo; RLS activo; types generados |
| 1.3 | Capa de abstracción LLM | `callPrimaryLLM` y `callFastLLM` retornan respuestas reales; cambiar proveedor no requiere cambiar código |

---

## Fase 2 — Autenticación y onboarding
**Objetivo:** Un dueño puede registrarse, completar el onboarding, conectar WhatsApp (o sandbox) y activar su agente.

| Bloque | Nombre | DoD resumido |
|---|---|---|
| 2.1 | Autenticación | Registro email + Google OAuth funcional; verificación WhatsApp con código; middleware protege rutas; transacción atómica de registro |
| 2.2 | Onboarding M1.2 y M1.3 | Selección de industria seedea datos correctos; captura por texto/voz/imagen/link crea KnowledgeItems; completitud se actualiza en tiempo real |
| 2.3 | Onboarding M1.4, M1.5 y M1.6 | Embedded Signup funciona en sandbox de Meta; prueba del agente responde con KnowledgeItems del onboarding; flujo completo < 20 min en móvil |

---

## Fase 3 — Motor del agente — core pipeline
**Objetivo:** El webhook recibe mensajes reales, genera Suggestions y las muestra al dueño. Modo colaborador completo funciona.

| Bloque | Nombre | DoD resumido |
|---|---|---|
| 3.1 | Webhook y recepción | Mensaje llega a webhook_queue en < 500ms; firma validada; multimedia escala automático; reintentos sin duplicados |
| 3.2 | Contexto y prompt | Contexto cacheado con 4 bloques correctos; invalidación < 1s al cambiar KnowledgeItem; prompt total < 4000 tokens |
| 3.3 | Clasificación, generación y evaluación | Pregunta con datos produce Suggestion high; sin datos produce Escalation; keyword de emergencia produce urgente; pipeline total < 3s p90 |
| 3.4 | Modo colaborador frontend | Suggestion aparece en < 5s; aprobar/editar/rechazar funcionan; corrección permanente crea KnowledgeItem learned; Realtime funciona en móvil |

---

## Fase 4 — Escalamiento y flujos de urgencia
**Objetivo:** Los tres niveles de escalamiento funcionan. Contención al cliente. WhatsApp al dueño en urgencias no atendidas.

| Bloque | Nombre | DoD resumido |
|---|---|---|
| 4.1 | Escalamiento en frontend | Indicadores visuales por nivel; mensaje de contención al cliente < 2s; botón de atender cambia estado | ✅ |
| 4.2 | Infraestructura de Notificaciones (OneSignal) | SDK de OneSignal integrado en Web; permisos solicitados; `player_id` guardado en DB; Edge Function puede enviar Push test | ✅ |
| 4.3 | Flujos de Escalamiento Proactivos | Push urgente < 10s; WhatsApp al dueño si no atiende en 5 min; agrupación de Suggestions correcta; silencio nocturno funciona | ✅ |

---

## Fase 5 — Entrenamiento, inteligencia y configuración
**Objetivo:** El dueño puede entrenar al agente, ver competencias, revisar historial. Configuración avanzada accesible.

| Bloque | Nombre | DoD resumido |
|---|---|---|
| 5.1 | Instrucción rápida y entrenamiento | Instrucción crea KnowledgeItem tras confirmación; mapa de competencias refleja estado real; revertir funciona en tiempo real |
| 5.2 | Inteligencia y resúmenes | DailySummary genera con datos reales; WhatsApp de resumen llega antes de 8 PM; oportunidades de entrenamiento con acceso directo |
| 5.3 | Configuración avanzada | Cambios en perfil invalidan caché; autonomía Nivel 1 cambia comportamiento del agente; reconexión WhatsApp sin perder datos |

---

## Fase 6 — WhatsApp real, landing y go-live prep
**Objetivo:** App funciona con Meta en producción, landing publicada, sistema pasa pruebas de go-live.

| Bloque | Nombre | DoD resumido |
|---|---|---|
| 6.1 | Migración a Meta producción | Mensaje real genera Suggestion; Message Templates aprobados; Embedded Signup funciona con cuenta real |
| 6.2 | Landing page | Demo interactiva para 6 industrias; CTA pre-carga industria; carga < 2s en móvil 4G |
| 6.3 | Pruebas de go-live | 7 flujos críticos pasan con 3 usuarios sin asistencia; 0 errores 5xx; onboarding promedio < 20 min; aprobación sin edición > 50% |

---

## Fase 7 — Estabilización para piloto
**Objetivo:** Sistema listo para 20-30 negocios piloto operando autónomamente durante 30 días.

| Bloque | Nombre | DoD resumido |
|---|---|---|
| 7.1 | Observabilidad y monitoring | Dashboard interno de estado de todos los negocios; alertas de token inválido; costo LLM por mensaje documentado |
| 7.2 | Onboarding concierge | Protocolo de acompañamiento documentado; script de verificación de calidad para primeros 3 días |

---

## Criterio de avance entre fases

1. Todos los bloques de la fase tienen su DoD cumplido
2. STATE.md actualizado con decisiones y aprendizajes
3. Commit de cierre con tag `phase-N-complete`
4. No se empieza Fase N+1 con Fase N incompleta
