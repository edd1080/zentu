---
name: supabase-patterns
description: >
  Patrones y convenciones de Supabase para AGENTI. Cargar cuando se trabaje con:
  queries a la base de datos, Edge Functions, Realtime, migraciones, RPC,
  manejo de errores de Supabase, o integración Supabase con Next.js.
---

# Supabase Patterns — AGENTI

## Queries

Siempre especificar columnas. Nunca `select('*')`:

```typescript
// Correcto
const { data, error } = await supabase
  .from('conversations')
  .select('id, status, priority, phone_client, last_message_at')
  .eq('business_id', businessId)
  .eq('status', 'pending_approval')
  .order('last_message_at', { ascending: false })

// Siempre verificar error y data null
if (error) throw new Error(`DB error: ${error.message}`)
if (!data) return []
```

## Operaciones multi-tabla — usar RPC

Para crear múltiples registros relacionados en una sola transacción atómica, usar una función RPC en lugar de múltiples queries desde el cliente o la Edge Function:

```sql
-- En una migración: crear función RPC
CREATE OR REPLACE FUNCTION create_owner_with_business(
  p_email text,
  p_full_name text,
  p_phone_personal text
) RETURNS jsonb AS $$
DECLARE
  v_owner_id uuid;
  v_business_id uuid;
  v_agent_id uuid;
BEGIN
  -- Crear owner, business, onboarding_progress, agent
  -- Si falla cualquier INSERT, toda la transacción se revierte
  ...
  RETURN jsonb_build_object('owner_id', v_owner_id, 'business_id', v_business_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

```typescript
// Desde Edge Function
const { data, error } = await supabase.rpc('create_owner_with_business', {
  p_email: email,
  p_full_name: fullName,
  p_phone_personal: phonePersonal
})
```

## Edge Functions

Estructura base de una Edge Function:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  // 1. Solo aceptar método correcto
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // 2. Crear cliente Supabase con service role (solo en Edge Functions)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // 3. Parsear y validar input
    const body = await req.json()
    // validar con Zod o checks manuales

    // 4. Lógica de negocio

    // 5. Retornar respuesta
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    // 6. Loggear error en system_logs, retornar error genérico al cliente
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
```

## Realtime

Para que las Suggestions aparezcan en la app del dueño sin recargar:

```typescript
// En el componente del home
useEffect(() => {
  const channel = supabase
    .channel(`suggestions:${businessId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'suggestions',
        filter: `business_id=eq.${businessId}`
      },
      (payload) => {
        // Actualizar estado local con la nueva suggestion
        setSuggestions(prev => [payload.new as Suggestion, ...prev])
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [businessId])
```

## Invalidación de caché del agente

Cuando se crea o modifica un KnowledgeItem, el caché de contexto del agente debe invalidarse:

```typescript
// Después de cualquier INSERT o UPDATE en knowledge_items
await supabase
  .from('agent_context_cache')
  .delete()
  .eq('business_id', businessId)
```

## Orden de migraciones

Crear siempre en este orden dentro de cada migración:
1. Tipos y enums
2. Tablas (en orden de dependencia — tablas referenciadas primero)
3. Funciones helper (sin referencias a objetos que no existen aún)
4. Triggers
5. Políticas RLS
6. Índices
7. Seed data (con INSERT ... ON CONFLICT DO NOTHING)

## pg_cron para jobs programados

```sql
-- Verificar que pg_cron está habilitado antes de usar
SELECT cron.schedule(
  'expire-suggestions',           -- nombre único del job
  '*/10 * * * *',                 -- cada 10 minutos
  $$ SELECT expire_old_suggestions() $$
);
```
