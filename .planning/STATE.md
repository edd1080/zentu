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

## Blockers
- Ninguno técnico.

## DoD Bloque 5.1 — COMPLETO ✅

## Próximo paso
Bloque 5.2 — Inteligencia y resúmenes.
DoD 5.2: DailySummary diario 7:30 PM, WhatsApp al dueño, vista M5.1 resumen semanal, vista M5.2 oportunidades de entrenamiento.
