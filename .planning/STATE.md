# Estado actual
Fase activa: 5
Bloque activo: Bloque 5.2 — Inteligencia y resúmenes
Última sesión: 2026-03-19
Bloque anterior completado: Bloque 5.1 — Instrucción rápida y entrenamiento ✅

## Roadmap Extendido
- Se integró el **Roadmap Post-MVP v1.0** (`docs/development-plan-2.md`) que añade las Fases 8 a 15 para la evolución del producto tras el MVP.

## Qué se construyó (sesión 2026-03-19)

### Flujo "Reemplazar / Agregar" para instrucciones contradictorias
- **`src/components/dashboard/QuickInstruct.tsx`:** Detección de conflicto post-propuesta: consulta `knowledge_items` activos del mismo topic+layer y los guarda en `conflictingItems`. Si hay conflicto, muestra panel ámbar con selector segmentado "Reemplazar / Agregar" (default: agregar). Pasa `replace_previous: boolean` a `confirm-instruction`.
- **`supabase/functions/confirm-instruction/index.ts`:** Acepta `replace_previous` (bool). Si `true`, desactiva los items existentes del mismo `topic_id + layer` antes de crear el nuevo.
- **Deploy:** `confirm-instruction` desplegada en `rutzgbwziinixdrryirv`.

### Fix de spinner fantasma en cards de conocimiento
- **`src/app/dashboard/agent/page.tsx`:** `loadTopics` ahora preserva el array `items` de topics previamente expandidos al recargar (evita spinner). `handleTopicClick` siempre hace refetch para garantizar datos frescos. Realtime handler también fetchea `knowledge_count` actualizado al recibir UPDATE en `competency_topics`.

### M3.3 — Historial de aprendizaje (completo)
- **`src/app/dashboard/agent/history/page.tsx`:** Reescritura completa. Lista cronológica de `knowledge_items` con buscador, filtro segmentado por tipo (Todos/Texto/Voz/Imagen), labels de capa traducidos, modal de confirmación antes de desactivar, reactivar sin modal. Tras cada toggle: llama `refresh_competency_coverage` + invalida `agent_context_cache` → mapa actualiza en tiempo real.

### Documentación actualizada
- **`docs/event-map.md`:** Evento `instruction_confirmed` actualizado con `replace_previous`, flujo de conflicto y Realtime.
- **`docs/module-map.md`:** Sección M3.3 reescrita con funcionalidades reales implementadas.

## Decisiones tomadas

- **Segmented control para conflicto:** Los botones "Reemplazar / Agregar" son un selector segmentado (pill ámbar), no botones de acción independientes. Evita confusión de que cada botón ejecuta una acción inmediata.
- **Default = Agregar:** Al detectar conflicto, la opción pre-seleccionada es "Agregar sin reemplazar". Reemplazar requiere selección explícita.
- **Reactivar sin modal:** Reactivar un item desactivado es una acción de bajo riesgo — se ejecuta directamente sin confirmación.
- **Realtime + knowledge_count:** El handler de Realtime en `agent/page.tsx` ahora hace un fetch adicional del count al recibir UPDATE. Esto garantiza que la card cambie de estado binary (gris ↔ verde) en tiempo real, incluso cuando el cambio viene del historial.

## DoD Bloque 5.1

- [x] QuickInstruct funcional end-to-end (LLM + confirmación + persistencia)
- [x] Topics no se duplican (LLM recibe lista existente)
- [x] Coverage actualiza automáticamente al confirmar
- [x] Realtime en competency_topics
- [x] "Áreas del negocio" con modelo binario
- [x] Panel expandido con instrucciones aprendidas
- [x] Instrucción contradictoria: selector Reemplazar/Agregar
- [x] M3.3 Historial de aprendizaje completo
- [x] Revertir instrucción desde historial refleja en mapa en tiempo real
- [x] Notas de voz (grabación real — MediaRecorder + base64 → Gemini multimodal)
- [x] Test 1.3 PDFs/imágenes end-to-end — verificado con imagen (✅) y PDF (✅ tras fix de modelo y UX)

## Qué se construyó (sesión 2026-03-19 — continuación)

### Notas de voz (grabación real) + PDFs/imágenes multimodal
- **`src/components/dashboard/useVoiceRecorder.ts`** (nuevo, 53 líneas): Hook que encapsula MediaRecorder real. `getUserMedia → MediaRecorder → Blob → FileReader → base64 → onSubmit`. Libera el micrófono después de cada grabación. Falla silenciosamente si se deniega el permiso.
- **`src/components/dashboard/InputPanel.tsx`** (150 líneas): Usa `useVoiceRecorder`. Exporta `QuickInstructPayload` (tipo discriminado) y `FileAttachment`. `handleFileChange` convierte archivos a base64 vía `FileReader` al seleccionarlos. `handleSubmit` construye el payload correcto según tipo (`text` / `image_ocr` / `pdf`).
- **`src/components/dashboard/QuickInstruct.tsx`** (143 líneas): Acepta `QuickInstructPayload` en `processInstruction`. Construye el body del Edge Function según el tipo.
- **`supabase/functions/_shared/multimodal.ts`** (nuevo, 60 líneas): `callMultimodalLLM` — llama a OpenRouter con content parts multimodal: audio via `input_audio`, imagen/PDF via `image_url` data URL.
- **`supabase/functions/process-quick-instruct/index.ts`** (148 líneas): Bifurca entre `callMultimodalLLM` (voz/imagen/PDF) y `callPrimaryLLM` (texto). Debug logs eliminados. Desplegado en `rutzgbwziinixdrryirv`.

## Qué se construyó (sesión 2026-03-20)

### Fixes post-cierre Bloque 5.1 — Multimodal PDF + UX InputPanel

**Bug 1 — PDF Bad Request:**
- `callMultimodalLLM` enviaba PDFs a `openai/gpt-4o-mini` vía Azure, que no soporta `application/pdf` en `image_url`.
- Fix: PDFs ahora usan `google/gemini-2.0-flash-001` (configurable vía `LLM_MULTIMODAL_MODEL`).
- `max_tokens` subido a 1200 para PDFs (vs 800 para imágenes).
- Agregado strip de markdown fences antes de `JSON.parse` (Gemini a veces devuelve ```json...```).
- `process-quick-instruct`: `mediaKind` ahora distingue `'pdf'` de `'image'` correctamente.

**Bug 2 — UX InputPanel:**
- El panel colapsaba y limpiaba el texto inmediatamente al hacer submit (antes de que `isProcessing` se activara).
- Fix: estado (content, attachedFiles, isExpanded) se limpia solo cuando `isProcessing` vuelve a `false` via `wasProcessingRef`.
- Agregado `loadingFileNames`: chip con spinner aparece inmediatamente al seleccionar archivo (nombre disponible de forma síncrona). Submit deshabilitado mientras FileReader procesa.

**Archivos modificados:**
- `supabase/functions/_shared/multimodal.ts` — PDF model routing, max_tokens, fence stripping
- `supabase/functions/process-quick-instruct/index.ts` — mediaKind 'pdf'
- `src/components/dashboard/InputPanel.tsx` — deferred cleanup + loadingFileNames chip

## Decisiones tomadas (2026-03-20)

- **Modelo para PDFs:** `google/gemini-2.0-flash-001` hardcoded como fallback para PDFs vía `LLM_MULTIMODAL_MODEL`. Configurable sin cambio de código.
- **PDFs como KnowledgeItems:** Todo documento (incluyendo PDFs de branding, manuales, etc.) se convierte en un KnowledgeItem `narrative` con el contexto destilado. El agente no guarda el PDF, guarda las reglas/conocimiento esencial extraído por el LLM.
- **max_tokens PDFs = 1200:** Documentos ricos necesitan más tokens para resumir adecuadamente. Imágenes usan 800.

## Qué se construyó (sesión 2026-03-20 — Bloque 5.2)

### Bloque 5.2 — Inteligencia y resúmenes (completo)

**Backend:**
- **`supabase/functions/generate-daily-summary/index.ts`** (nuevo, 242 líneas): Edge Function que genera el resumen diario del negocio. Agrega conversaciones por `last_message_at`, calcula métricas (resolvedAutonomous, resolvedOwnerApproved, escalated, pending, minutesSaved), detecta weak topics (knowledge_count=0), construye mensaje WhatsApp en español, envía a `owner.phone_personal` via Meta API, upserta en `daily_summaries`. Desplegada con `--no-verify-jwt`.
- **`supabase/migrations/20260320000001_schedule_daily_summaries.sql`**: Habilita `pg_cron` + `pg_net`. Función `trigger_daily_summaries()` que itera businesses activos y llama a la Edge Function via `pg_net.http_post`. Schedule: `30 1 * * *` (01:30 UTC = 7:30 PM Guatemala).
- **`supabase/config.toml`**: `[functions.generate-daily-summary] verify_jwt = false`.

**Frontend:**
- **`src/app/dashboard/agent/intelligence/page.tsx`** (nuevo): Vista M5.1 + M5.2. Selector de período (semana/mes/todo). Queries por `last_message_at`. 5 ActivitySummaryCards. TrainingOpportunityCards para topics con `knowledge_count=0`. Botón "Enviar resumen de prueba ahora" que invoca la Edge Function directamente.
- **`src/components/dashboard/ActivitySummaryCard.tsx`** (nuevo): Card de métrica con accent variants (success/warning/info/default).
- **`src/components/dashboard/TrainingOpportunityCard.tsx`** (nuevo): Card de oportunidad de entrenamiento con link a `/dashboard/agent?train=`.
- **`src/app/dashboard/agent/page.tsx`**: Agregado entry point "Inteligencia" al fondo de la página.

**Bug crítico corregido:**
- `generate-daily-summary` y `intelligence/page.tsx` usaban `created_at` para filtrar conversaciones → reportaban "sin actividad". Fix: `last_message_at`.

## Decisiones tomadas (Bloque 5.2)

- **WhatsApp fallback para pruebas:** El número del dueño (`owner.phone_personal`) se usa como receptor del resumen. En producción, cuando WhatsApp Business API esté activo, el mismo número recibe el resumen diario. Sin ventana de servicio activa, Meta API retorna error de "window closed" — aceptable, el resumen se persiste en `daily_summaries` de todas formas.
- **`last_message_at` como proxy de actividad:** Una conversación existe a lo largo de días. "Actividad hoy" = hubo un mensaje hoy, no que la conversación se creó hoy.
- **WhatsApp envío best-effort:** Falla de envío no bloquea el upsert del DailySummary. `whatsapp_error` se persiste para debugging.
- **pg_cron schedule UTC:** 01:30 UTC = 7:30 PM hora de Guatemala (CST, UTC-6). Ajustar si el negocio está en otra zona horaria.

## DoD Bloque 5.1 — COMPLETO ✅
## DoD Bloque 5.2 — COMPLETO ✅

- [x] `generate-daily-summary` Edge Function funcional y desplegada
- [x] Resumen generado con métricas reales de conversaciones
- [x] Envío WhatsApp al número personal del dueño
- [x] pg_cron programado a 7:30 PM Guatemala
- [x] Vista M5.1 — métricas de actividad con selector de período
- [x] Vista M5.2 — oportunidades de entrenamiento (topics sin conocimiento)
- [x] Botón de prueba manual en UI — verificado end-to-end

## Qué se construyó (sesión 2026-03-20 — Bloque 5.3)

### Bloque 5.3 — Configuración avanzada (completo)

**Migración SQL:**
- `20260320000002_settings_columns.sql`: columnas de notificaciones en `businesses` (`notification_hour`, `quiet_hours_start`, `quiet_hours_end`, `notify_training_alerts`). `knowledge_count` en `competency_topics`. `refresh_competency_coverage` actualizado para mantener `knowledge_count`.

**Edge Functions:**
- `supabase/functions/update-business-profile/index.ts` (nuevo): guarda campos del perfil, detecta cambio en `schedule`, crea KnowledgeItem `structured` e invalida `agent_context_cache`. Auth via `supabase.auth.getUser(jwt)`. Desplegada con `--no-verify-jwt`.
- `supabase/functions/process-message/index.ts` (modificado): lee `autonomy_rules` activas. Si hay regla activa + `confidence_tier === 'high'` → crea Suggestion con `status = auto_sent`, envía mensaje directamente vía `send-message`, resuelve conversación como `agent_autonomous`.

**Pages:**
- `src/app/dashboard/settings/page.tsx` — hub de ajustes (5 ítems navegables)
- `src/app/dashboard/settings/profile/page.tsx` — M4.1 perfil con modo lectura/edición + horario
- `src/app/dashboard/settings/autonomy/page.tsx` — M4.3 indicadores de madurez + toggle Nivel 0/1
- `src/app/dashboard/settings/whatsapp/page.tsx` — M4.4 estado de conexión + desconectar
- `src/app/dashboard/settings/notifications/page.tsx` — M4.5 hora resumen, silencio, toggle, autosave
- `src/app/dashboard/settings/plan/page.tsx` — uso del mes con barra de progreso

**Componentes extraídos:**
- `src/components/dashboard/ScheduleEditor.tsx` — editor de horarios reutilizable
- `src/components/dashboard/TopicAutonomyCard.tsx` — card de autonomía con indicadores

## Decisiones tomadas (Bloque 5.3)

- **`verify_jwt = false` para TODAS las Edge Functions:** incluso las invocadas por el cliente autenticado. El gateway de Supabase puede rechazar tokens válidos con `verify_jwt = true`. Siempre manejar auth internamente con `supabase.auth.getUser(jwt)`.
- **Autonomía simplificada (MVP):** Si ANY `autonomy_rule` del negocio está activa + `confidence_tier = high` → auto-send. No se mapea intent a topic_id (no disponible con certeza del LLM). Suficiente para MVP.
- **`knowledge_count` como columna**: añadida a `competency_topics` en migración + backfill + mantenimiento en `refresh_competency_coverage`. Antes era calculada solo en el cliente.
- **Regla 150 líneas cumplida**: autonomy y profile refactorizados extrayendo `TopicAutonomyCard` y `ScheduleEditor`.

## DoD Bloque 5.1 — COMPLETO ✅
## DoD Bloque 5.2 — COMPLETO ✅
## DoD Bloque 5.3 — COMPLETO ✅

- [x] Cambiar horario en M4.1 crea KnowledgeItem structured e invalida caché — verificado end-to-end
- [x] Indicadores de madurez en M4.3 muestran datos reales (25% → bloqueado correctamente)
- [x] Activar Nivel 1 → cambia comportamiento de process-message (lógica desplegada)
- [x] M4.4 muestra estado real de conexión, desconectar no toca KnowledgeItems
- [x] Tag `block-5.3-complete` creado

## Fase 5 — COMPLETA ✅ (Bloques 5.1, 5.2, 5.3)

## Qué se construyó (sesión 2026-03-21)

### Corrección de bugs críticos + pantalla Entrenar

**B1 — Home con datos hardcodeados:**
- `src/app/dashboard/page.tsx`: reescritura completa con queries reales a Supabase. Stats reales via `Promise.all`. Conversaciones recientes desde `conversations` ordenadas por `last_message_at DESC`.

**B2 — Duplicación de conversaciones en bandeja:**
- Root cause: sin constraint único en `(business_id, client_phone)` → race condition al llegar 2 mensajes simultáneos del mismo número creaba 2 conversaciones.
- `supabase/migrations/20260321000001_unique_active_conversation_per_phone.sql`: archiva duplicados existentes + crea `UNIQUE INDEX ... WHERE status != 'archived'`.
- `supabase/functions/process-message/index.ts`: maneja `23505` unique violation re-fetching la conversación existente. También agrega update de `last_message_at` al recibir mensaje entrante.

**B3 — Chat no hace scroll al último mensaje:**
- `src/app/dashboard/conversations/[id]/page.tsx`: `messagesEndRef` + `useEffect([messages])` con `scrollIntoView`.

**B4 — Botón "Aprobar" en sugerencia blanco/invisible:**
- `src/components/dashboard/AgentSuggestionWidget.tsx`: `--color-success-600` no existía en tokens → cambiado a `--color-success-700`.

**B5 — Sugerencia rechazada no recuperable:**
- `src/app/dashboard/conversations/[id]/page.tsx`: `dismissedSuggestion` state preserva la sugerencia rechazada; chip de recuperación permite restaurarla.

**B6 — ⋮ sin menú en chat:**
- `src/app/dashboard/conversations/[id]/page.tsx`: dropdown con "Marcar como resuelta" y "Archivar conversación". Backdrop cierra el menú. Navega a bandeja tras la acción.

**B7 — Borde verde en inputs:**
- `src/app/globals.css`: `*:focus-visible` excluye inputs/textarea/select. Sin override `focus:outline-none` de Tailwind que no cubre `:focus-visible` en mobile.

**B8 — Badges hardcodeados en nav:**
- `src/components/dashboard/AppNavigation.tsx`: hook `useNavCounts()` carga datos reales al montar. Badge Conversaciones = `pending_approval`. Badge Entrenar = `knowledge_count = 0`.

**B9 — /dashboard/train es 404:**
- `src/app/dashboard/train/page.tsx` (nuevo): hub de entrenamiento con 4 secciones: burbujas de instrucciones recientes, QuickInstruct, temas sin cubrir (oportunidades), mini-historial con HistoryCards.

**Documentación actualizada:**
- `docs/screen-inventory-implemented.md`: Pantalla 7 descrita completamente, badges actualizados, nav tree corregido, tabla de bugs limpiada.

## Decisiones tomadas (2026-03-21)

- **Pantalla Entrenar como hub unificado:** Consolida QuickInstruct, historial y oportunidades en una sola pantalla. El historial completo sigue en `/agent/history` pero se accede desde aquí con "Ver todo".
- **Contexto de tema vía chip visible:** Al tocar "Entrenar" en una oportunidad, se muestra un chip encima del input (no se pre-llena el input). Más claro visualmente que texto pre-cargado.
- **Partial unique index `WHERE status != 'archived'`:** Permite múltiples conversaciones archivadas del mismo teléfono (histórico) pero solo una activa.

## Qué se construyó (sesión 2026-03-21 — Performance + Caché)

### Corrección de lag de navegación

**Root causes identificados y resueltos:**
- `useNavCounts()` local en AppNavigation → llamado en AppSidebar Y MobileNav → 4 queries por mount
- `conversations/page.tsx`: `select('*')` sin filtro `business_id` → payload innecesariamente grande
- Sin `loading.tsx` → server components congelaban la UI hasta respuesta completa del servidor

**Archivos creados:**
- `src/components/dashboard/NavCountsContext.tsx`: Provider único con `useQuery` — ambos nav consumen del contexto
- `src/providers/QueryProvider.tsx`: `QueryClient` con defaults globales (staleTime 30s, gcTime 5min, no refetch on focus)
- `src/app/dashboard/loading.tsx`: Skeleton para el home (server component)

**Archivos modificados:**
- `src/app/layout.tsx`: Envuelto en `QueryProvider`
- `src/app/dashboard/layout.tsx`: Envuelto en `NavCountsProvider`
- `src/components/dashboard/AppNavigation.tsx`: Eliminado hook local, importa de contexto
- `src/app/dashboard/conversations/page.tsx`: Migrado a `useQuery(["conversations"])` + realtime via `invalidateQueries`
- `src/app/dashboard/train/page.tsx`: Migrado a `useQuery(["train-data"])` + invalidación en mutations

### TanStack Query integrado (v5.94.5)

**Query keys y staleTime:**
- `["nav-counts"]` — 20s: badges de navegación
- `["conversations"]` — 10s: bandeja, invalidado por Realtime y nav-counts
- `["train-data"]` — 20s: historial + oportunidades, invalidado tras confirmar instrucción o toggle

## Decisiones tomadas (2026-03-21 — Performance)

- **TanStack Query sobre SWR**: TanStack tiene `invalidateQueries` por key, esencial para invalidar exactamente lo que cambió tras una mutation. SWR requiere workarounds para esto.
- **`refetchOnWindowFocus: false`**: App mobile-first — los focus events en PWA son frecuentes y no señalan que los datos cambiaron.
- **Realtime + invalidation pattern**: Los handlers de Realtime NO re-fetchean manualmente — solo llaman `invalidateQueries`. TanStack deduplica y decide cuándo refetchear.
- **`staleTime` corto en conversaciones (10s)**: La bandeja es el dato más sensible a cambios. 10s asegura frescura sin sobrecarga.

## Blockers
- Ninguno técnico.

## Próximo paso
**FASE INTERMEDIA — Rediseño UI**
- El usuario tiene archivos HTML/CSS con el nuevo diseño
- Entregar archivos en `docs/redesign/` y abrir nueva sesión enfocada en frontend
- Después del rediseño → **Fase 6 — Bloque 6.1: Migración a Meta producción.**
- Salir de sandbox de Meta (App modo live)
- Configurar dominio de producción en webhook de Meta
- Crear y aprobar Message Templates de WhatsApp
- Verificar Embedded Signup con App en modo live
- Test end-to-end con número real de negocio
