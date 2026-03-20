import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Authenticate the owner via JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt)
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    // Load current business
    const { data: current, error: fetchErr } = await supabase
      .from('businesses')
      .select('id, name, description, address, phone_business, schedule, timezone')
      .eq('owner_id', user.id)
      .single()

    if (fetchErr || !current) {
      return new Response(JSON.stringify({ error: 'Business not found' }), { status: 404, headers: corsHeaders })
    }

    const body = await req.json()
    const {
      name, description, address, phone_business, schedule,
      notification_hour, quiet_hours_start, quiet_hours_end, notify_training_alerts
    } = body

    // Detect if schedule changed (triggers KnowledgeItem + cache invalidation)
    const prevSchedule = JSON.stringify(current.schedule || {})
    const newSchedule = JSON.stringify(schedule ?? current.schedule ?? {})
    const scheduleChanged = prevSchedule !== newSchedule

    // Build update payload (only fields provided)
    const updatePayload: Record<string, unknown> = {}
    if (name !== undefined) updatePayload.name = name
    if (description !== undefined) updatePayload.description = description
    if (address !== undefined) updatePayload.address = address
    if (phone_business !== undefined) updatePayload.phone_business = phone_business
    if (schedule !== undefined) updatePayload.schedule = schedule
    if (notification_hour !== undefined) updatePayload.notification_hour = notification_hour
    if (quiet_hours_start !== undefined) updatePayload.quiet_hours_start = quiet_hours_start
    if (quiet_hours_end !== undefined) updatePayload.quiet_hours_end = quiet_hours_end
    if (notify_training_alerts !== undefined) updatePayload.notify_training_alerts = notify_training_alerts

    const { error: updateErr } = await supabase
      .from('businesses')
      .update(updatePayload)
      .eq('id', current.id)

    if (updateErr) {
      return new Response(JSON.stringify({ error: 'Failed to update business', details: updateErr.message }), { status: 500, headers: corsHeaders })
    }

    // If schedule changed: create KnowledgeItem + invalidate cache
    if (scheduleChanged && schedule) {
      const scheduleText = buildScheduleText(schedule)

      // Find or create "Horarios" topic
      const { data: topic } = await supabase
        .from('competency_topics')
        .select('id')
        .eq('business_id', current.id)
        .ilike('name', '%horario%')
        .single()

      await supabase.from('knowledge_items').insert({
        business_id: current.id,
        topic_id: topic?.id ?? null,
        layer: 'structured',
        content: scheduleText,
        validity: 'permanent',
        active: true,
        confirmed_by_owner: true,
      })

      // Invalidate agent context cache
      await supabase
        .from('agent_context_cache')
        .delete()
        .eq('business_id', current.id)
    }

    return new Response(JSON.stringify({ success: true, schedule_updated: scheduleChanged }), { headers: corsHeaders })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('update-business-profile crash:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders })
  }
})

function buildScheduleText(schedule: Record<string, unknown>): string {
  const dayNames: Record<string, string> = {
    mon: 'lunes', tue: 'martes', wed: 'miércoles', thu: 'jueves',
    fri: 'viernes', sat: 'sábado', sun: 'domingo'
  }
  const lines: string[] = ['Horario del negocio:']
  for (const [key, val] of Object.entries(schedule)) {
    const day = dayNames[key] || key
    if (!val || typeof val !== 'object') {
      lines.push(`${day}: cerrado`)
    } else {
      const { open, close, closed } = val as { open?: string; close?: string; closed?: boolean }
      if (closed) {
        lines.push(`${day}: cerrado`)
      } else {
        lines.push(`${day}: ${open || '?'} – ${close || '?'}`)
      }
    }
  }
  return lines.join('\n')
}
