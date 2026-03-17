# Estado actual
Fase activa: 5
Bloque activo: Bloque 5.1 — Instrucción rápida y entrenamiento
Última sesión: 2026-03-17

## Qué se construyó (sesión 2026-03-17)

### Fixes de datos y cobertura de competencias
- **Migración `20260316000001_refresh_competency_coverage.sql`:** Función `refresh_competency_coverage(p_business_id)` que recalcula `coverage_percentage` y `status` en `competency_topics` basándose en el conteo de `knowledge_items` activos por topic.
- **Migración `20260316000002_enable_realtime_competency_topics.sql`:** Habilitó Realtime (`supabase_realtime` publication) para la tabla `competency_topics`.

### Fix de asignación de topics en Quick Instruct
- **`supabase/functions/process-quick-instruct/index.ts`:** El LLM ahora recibe la lista de topics existentes del negocio antes de procesar la instrucción. Regla crítica: usar el nombre exacto de un topic existente si el contenido encaja, solo crear uno nuevo si no encaja en ninguno.
- **`supabase/functions/confirm-instruction/index.ts`:** Llama a `refresh_competency_coverage` via RPC después de persistir el `KnowledgeItem`. Esto actualiza la cobertura inmediatamente después de confirmar cada instrucción.

### Redesign de "Áreas del negocio" (antes "Mapa de competencias")
- **`src/app/dashboard/agent/page.tsx`:** Refactorizado completamente. Nuevo modelo binario de health score (áreas core cubiertas/total). Separación de topics en `coreTopics` (is_default=true) y adicionales. Realtime subscription para UPDATE en competency_topics. Callback `onSuccess` en QuickInstruct para recargar topics al confirmar instrucción.
- **`src/components/dashboard/CompetencyMap.tsx`:** Rediseño completo. Cards binarias (✓ Cubierta / ○ Sin cubrir) sin barras de progreso por área. Sección colapsable "Conocimiento adicional" para topics no-core. Panel expandido por card muestra instrucciones aprendidas organizadas por capa (Dato fijo, Política, Descriptivo, Aprendido). Carga lazy de knowledge_items al expandir.
- **`src/components/dashboard/QuickInstruct.tsx`:** Agregado prop `onSuccess?: () => void` llamado tras confirmar instrucción exitosamente.

### Documentación actualizada
- **`docs/screen-specs.md`:** Sección 4.1 (M3.2) actualizada con el nuevo modelo de "Áreas del negocio".
- **`docs/module-map.md`:** Sección M3.2 actualizada con modelo binario, health score y Realtime.

## Decisiones tomadas

- **Health score binario:** Se abandonó el modelo de porcentaje promedio de `coverage_percentage` (susceptible a dilución) por un conteo binario: áreas core cubiertas / total áreas core. Más honesto y estable para el usuario.
- **Topics core vs. adicionales:** Los topics `is_default=true` (del template de industria) forman el mapa principal y son los únicos que afectan el health score. Los topics `is_default=false` (creados por el LLM) van a una sección colapsable "Conocimiento adicional" — son aditivos, nunca diluyen.
- **Cobertura binaria por área:** Una instrucción es suficiente para marcar un área como "Cubierta". Elimina la confusión de porcentajes parciales (25%, 50%) en el mapa de áreas.
- **Renaming:** "Mapa de competencias" → "Áreas del negocio". Las cards ya no se llaman competencias para evitar confusión con las instrucciones individuales.
- **Supabase project-ref correcto:** `rutzgbwziinixdrryirv` (no `jmwdxopjyotvrvifcpuv`).

## Blockers
- Ninguno técnico.

## DoD Bloque 5.1 (parcial) ✅
- [x] QuickInstruct funcional con LLM (process-quick-instruct + confirm-instruction).
- [x] Topics existentes pasados al LLM para evitar duplicación de áreas.
- [x] Coverage recalculada automáticamente al confirmar instrucción.
- [x] Realtime activo en competency_topics.
- [x] "Áreas del negocio" con modelo binario implementado.
- [x] Panel expandido muestra instrucciones aprendidas por área.
- [ ] Pendiente: Tests 3.1 (instrucción contradictoria) y 3.3 (timeout/loading) formales.
- [ ] Pendiente: Historial de aprendizaje (M3.3) — pantalla completa.

## Próximo paso
Ejecutar los tests formales 3.1 y 3.3 del plan de pruebas del Bloque 5.1, luego construir la pantalla completa de Historial de aprendizaje (M3.3) en `/dashboard/agent/history`.
