# Estado actual
Fase activa: 5
Bloque activo: Bloque 5.1 — Instrucción rápida y entrenamiento
Objetivo Inmediato: Implementar la interfaz de entrenamiento y el mapa de competencias.
Última sesión: 2026-03-12

## Qué se construyó (sesión 2026-03-12 - Fase 4 final)
- **Bloque 4.2 & 4.3 (Infraestructura de Notificaciones y Flujos Proactivos):**
  - Integración completa de **OneSignal** (Frontend SDK + Edge Function `send-notification`).
  - Lógica de **Urgencia** en `process-message` con detección de palabras clave y LLM.
  - Implementación de **pg_cron** y **pg_net** para el fallback de WhatsApp a los 5 minutos (`process_escalation_fallbacks`).
  - Lógica de **Silencio Nocturno** (22h - 07h) con bypass para emergencias.
  - Notificaciones de **Actividad** (inbound) y **Sugerencias** (modo colaborador).

## Decisiones tomadas
- **Escalamiento vía DB (pg_cron):** Se decidió usar `pg_cron` en la base de datos para manejar el timeout de 5 minutos, garantizando que el fallback a WhatsApp ocurra incluso si el servidor de aplicaciones o el agente tienen hipo.
- **Transparencia Total:** Se habilitaron notificaciones de actividad pasiva para que el dueño tenga visibilidad de cada mensaje entrante, no solo de las escalaciones.
- **Bypass de Silencio:** Se definió que las notificaciones de nivel `urgent` ignoran el horario de silencio nocturno por seguridad del negocio.

## Blockers
- Ninguno técnico.

## DoD Bloque 3.3 ✅
- [x] Confidence score ponderado y jerarquías (Alta, Media, Baja).
- [x] Filtros pre-LLM para palabras críticas.
- [x] Validar que Output se inserta correctamente.

## DoD Bloque 4.1 ✅
- [x] Construcción Pixel-perfect de todas las pantallas del Handler (Sidebar, TopBar, Inbox Split View, Thread).
- [x] Visualización de Suggestion Widget + Acciones Integradas a JS Functions.
- [x] Visualización de Escalation Banner.
- [x] Conexión real de DB Messages y Realtime Insertions.

## DoD Bloque 4.2 ✅
- [x] OneSignal SDK configurado en dashboard.
- [x] Edge Function `send-notification` operativa.
- [x] Player ID sincronizado con `owners.onesignal_id`.

## DoD Bloque 4.3 ✅
- [x] Notificaciones inmediatas en urgencias detectadas (Keyword/LLM).
- [x] Fallback WhatsApp (5 min) vía `pg_cron`.
- [x] Silencio Nocturno con bypass de emergencia.
- [x] Notificaciones de actividad y sugerencias.

## Próximo paso
- [ ] Fase 5 — Entrenamiento, inteligencia y configuración (Bloque 5.1).

## Commits
- `chore: session-end integrate workflow strategies and SIL`
