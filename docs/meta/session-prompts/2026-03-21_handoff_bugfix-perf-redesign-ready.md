# Handoff — 2026-03-21
## Cierre de sesión de bugs críticos + performance + apertura de rediseño UI

---

## Prompt de Inicio (copiar y pegar para la próxima sesión)

```
Continuamos el desarrollo de AGENTI.

## Contexto de la sesión anterior (2026-03-21)

La sesión anterior fue una sesión completa de corrección de bugs críticos, construcción de la pantalla /dashboard/train, optimización de performance y migración a TanStack Query. Todo fue resuelto y documentado.

### Estado actual
- **Fase activa**: Fase Intermedia — Rediseño UI (nueva fase, aún no iniciada)
- **Fase siguiente**: Fase 6 — Bloque 6.1: Migración a Meta producción
- **No hay blockers técnicos**

### Lo que quedó listo en la sesión anterior

**Bugs resueltos (B1–B9):**
- B1: Home con datos reales de Supabase (antes era hardcoded)
- B2: Duplicación de conversaciones — partial unique index + manejo de race condition en process-message + update de last_message_at en inbound
- B3: Chat auto-scroll al último mensaje
- B4: Botón "Aprobar" visible (--color-success-600 no existía → cambiado a --color-success-700)
- B5: Sugerencia rechazada recuperable con chip
- B6: Menú ⋮ en chat con "Marcar como resuelta" y "Archivar"
- B7: Borde verde en inputs eliminado (fix a *:focus-visible en globals.css)
- B8: Badges del nav con datos reales (pending_approval + knowledge_count=0)
- B9: Pantalla /dashboard/train construida completamente

**Pantalla /dashboard/train (nueva):**
- Burbujas de instrucciones recientes (chat-style, últimas 3)
- QuickInstruct con chip de contexto de tema cuando viene desde oportunidad
- Temas sin cubrir (competency_topics donde knowledge_count=0) con botón "Entrenar"
- Mini-historial con HistoryCards + "Ver todo" → /agent/history

**Performance:**
- NavCountsContext: hook centralizado, ya no se ejecuta 2 veces
- TanStack Query v5 integrado con QueryProvider en root layout
- Queries migradas: ["conversations"], ["nav-counts"], ["train-data"]
- loading.tsx para el home (server component)
- conversations/page.tsx: select específico + business_id filter

### Objetivo de esta sesión
**FASE INTERMEDIA — REDISEÑO UI COMPLETO**

El usuario tiene archivos HTML/CSS con el nuevo diseño visual de la aplicación. Los archivos están en `docs/redesign/` (o se entregarán al inicio de la sesión).

El objetivo es reimplementar la interfaz gráfica de todos los componentes y pantallas usando el nuevo estilo visual, manteniendo toda la funcionalidad y lógica existente intacta.

**Reglas para el rediseño:**
1. NO tocar lógica de negocio, queries, Edge Functions ni migraciones
2. Solo modificar archivos en src/components/, src/app/ (parte visual/CSS)
3. Mantener el design system de tokens CSS (globals.css) — actualizar si el nuevo diseño tiene nuevos tokens
4. Verificar `npx tsc --noEmit` después de cada componente rediseñado
5. Seguir la regla de 150 líneas por archivo

### Archivos clave para el rediseño
- `docs/redesign/` — archivos HTML/CSS del nuevo diseño (a entregar)
- `src/app/globals.css` — tokens de diseño actuales
- `docs/ui-spec.md` — especificación UI actual
- `docs/screen-inventory-implemented.md` — inventario de todas las pantallas implementadas
```

---

## Inventario técnico de la sesión

### Archivos CREADOS

| Archivo | Propósito |
|---|---|
| `src/app/dashboard/train/page.tsx` | Pantalla /dashboard/train — hub de entrenamiento con 4 secciones |
| `src/components/dashboard/NavCountsContext.tsx` | Provider centralizado para badges del nav (TanStack Query) |
| `src/providers/QueryProvider.tsx` | QueryClient global con defaults de caché |
| `src/app/dashboard/loading.tsx` | Skeleton para el home (server component) |
| `supabase/migrations/20260321000001_unique_active_conversation_per_phone.sql` | Partial unique index + archivado de duplicados |

### Archivos MODIFICADOS

| Archivo | Cambio |
|---|---|
| `src/app/layout.tsx` | Envuelto en `<QueryProvider>` |
| `src/app/dashboard/layout.tsx` | Envuelto en `<NavCountsProvider>` |
| `src/app/globals.css` | Fix *:focus-visible (excluye inputs), +--surface-base |
| `src/components/dashboard/AppNavigation.tsx` | Eliminado hook local, importa useNavCounts del contexto |
| `src/components/dashboard/AgentSuggestionWidget.tsx` | Fix color botón Aprobar: success-600 → success-700 |
| `src/app/dashboard/page.tsx` | Reescrito con datos reales de Supabase |
| `src/app/dashboard/conversations/page.tsx` | Migrado a useQuery, select específico, filtro business_id, realtime via invalidateQueries |
| `src/app/dashboard/conversations/[id]/page.tsx` | Auto-scroll, menú ⋮, dismissedSuggestion, handleConversationAction |
| `supabase/functions/process-message/index.ts` | Race condition fix, last_message_at update, unique violation handler |
| `docs/screen-inventory-implemented.md` | Pantalla 7 documentada, badges actualizados, bugs limpiados |
| `.planning/STATE.md` | Sesión documentada completamente |
| `.agents/skills/error-prevention/SKILL.md` | 4 nuevas entradas de errores |
| `tasks/lessons.md` | Nueva lección sobre performance y TanStack Query |

### Archivos DESPLEGADOS

| Función | Cambio |
|---|---|
| `process-message` | Race condition fix + last_message_at update |
| `supabase db push` | Migración 20260321000001 aplicada en producción |

---

## Decisiones técnicas de la sesión

| Decisión | Razonamiento |
|---|---|
| TanStack Query sobre SWR | TanStack tiene invalidateQueries por key, crítico para invalidar exactamente lo que cambió tras mutations |
| Partial unique index WHERE status != 'archived' | Permite múltiples archivadas del mismo teléfono (historial) pero solo una activa |
| realtime → invalidateQueries (no fetchAll) | TanStack deduplica, evita ráfagas de queries simultáneas |
| refetchOnWindowFocus: false | App mobile/PWA — focus events frecuentes no indican cambio de datos |
| Pantalla /train como hub unificado | Consolida QuickInstruct + historial + oportunidades. Historial completo sigue en /agent/history |
| Chip de contexto visible sobre QuickInstruct | Más claro que pre-llenar el input — el usuario sabe exactamente qué está entrenando |

---

## Próxima fase

**Fase Intermedia — Rediseño UI**

El usuario entregará archivos HTML/CSS del nuevo diseño. El trabajo consiste en reimplementar todos los componentes y pantallas con el nuevo estilo visual, sin tocar lógica de negocio.

Después: **Fase 6 — Migración a Meta producción** (configuración App modo live, Message Templates, webhook producción, test end-to-end).
