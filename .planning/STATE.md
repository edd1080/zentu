# Estado actual
Fase activa: 5
Bloque activo: Bloque 5.1 — Instrucción rápida y entrenamiento
Última sesión: 2026-03-19

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
- [ ] Notas de voz (grabación real — actualmente simulada)
- [ ] Test 1.3 PDFs/imágenes end-to-end

## Blockers
- Ninguno técnico.

## Próximo paso
Evaluar si notas de voz y test 1.3 (PDFs) son necesarios para cerrar formalmente Bloque 5.1 con `/phase-done`, o si se mueven a deuda técnica y se avanza a Bloque 5.2 (Inteligencia y resúmenes).
