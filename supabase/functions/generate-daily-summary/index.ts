import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

async function sendWhatsAppMessage(phoneId: string, token: string, toPhone: string, text: string) {
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: toPhone,
      type: "text",
      text: { preview_url: false, body: text }
    })
  })
  if (!response.ok) {
    const errData = await response.text()
    throw new Error(`Meta API error (${response.status}): ${errData}`)
  }
  return await response.json()
}

function buildDailySummaryMessage(params: {
  businessName: string
  date: string
  totalConversations: number
  resolvedAutonomous: number
  resolvedOwnerApproved: number
  escalated: number
  pending: number
  estimatedMinutesSaved: number
  weakTopicNames: string[]
  type: 'daily' | 'first_week'
}): string {
  const {
    businessName, date, totalConversations, resolvedAutonomous,
    resolvedOwnerApproved, escalated, pending, estimatedMinutesSaved,
    weakTopicNames, type
  } = params

  const horasSaved = estimatedMinutesSaved >= 60
    ? `${Math.round(estimatedMinutesSaved / 60 * 10) / 10} horas`
    : `${estimatedMinutesSaved} minutos`

  const header = type === 'first_week'
    ? `📊 *Resumen de tu primera semana — ${businessName}*`
    : `📊 *Resumen del día — ${businessName}*`

  const lines = [
    header,
    `📅 ${date}`,
    ``,
    `Tu agente atendió *${totalConversations}* conversación${totalConversations !== 1 ? 'es' : ''} hoy.`,
    ``,
    `✅ Resueltas sin tu ayuda: *${resolvedAutonomous}*`,
    `👤 Resueltas con tu aprobación: *${resolvedOwnerApproved}*`,
    `⚠️ Requirieron atención especial: *${escalated}*`,
    `🕐 Pendientes al cierre: *${pending}*`,
    ``,
    `⏱ Tiempo estimado ahorrado: *${horasSaved}*`,
  ]

  if (weakTopicNames.length > 0) {
    lines.push(``)
    lines.push(`💡 *Temas donde tu agente puede mejorar:*`)
    weakTopicNames.slice(0, 3).forEach(name => lines.push(`  • ${name}`))
    lines.push(`Abre Zentu → Agente → Inteligencia para ver las oportunidades.`)
  }

  if (type === 'first_week') {
    lines.push(``)
    lines.push(`🎉 ¡Tu agente ya lleva una semana trabajando! Sigue entrenándolo para mejorar su rendimiento.`)
  }

  return lines.join('\n')
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { business_id, date, type = 'daily' } = body

    if (!business_id || !date) {
      return new Response(JSON.stringify({ error: 'business_id and date are required' }), { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Load business + owner data in one join
    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('id, name, owner_id, whatsapp_phone_number_id, whatsapp_access_token, timezone')
      .eq('id', business_id)
      .single()

    if (bizErr || !business) {
      return new Response(JSON.stringify({ error: 'Business not found' }), { status: 404, headers: corsHeaders })
    }

    const { data: owner } = await supabase
      .from('owners')
      .select('phone_personal')
      .eq('id', business.owner_id)
      .single()

    // 2. Aggregate conversations with activity today
    // Use last_message_at (not created_at) — a conversation can span multiple days
    const dateStart = `${date}T00:00:00.000Z`
    const dateEnd = `${date}T23:59:59.999Z`

    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, status, resolved_by')
      .eq('business_id', business_id)
      .gte('last_message_at', dateStart)
      .lte('last_message_at', dateEnd)

    const convos = conversations || []
    const totalConversations = convos.length

    // No activity → skip summary
    if (totalConversations === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_activity' }), { headers: corsHeaders })
    }

    const resolvedAutonomous = convos.filter(c => c.resolved_by === 'agent_autonomous').length
    const resolvedOwnerApproved = convos.filter(c => c.resolved_by === 'owner_approved' || c.resolved_by === 'owner_manual').length
    const escalated = convos.filter(c =>
      c.status === 'escalated_informative' || c.status === 'escalated_sensitive' || c.status === 'escalated_urgent'
    ).length
    const pending = convos.filter(c => c.status === 'active' || c.status === 'pending_approval' || c.status === 'waiting').length
    const estimatedMinutesSaved = (resolvedAutonomous + resolvedOwnerApproved) * 3

    // 3. Detect weak topics (topics with escalations in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: escalationTopics } = await supabase
      .from('escalations')
      .select('conversation_id, conversations!inner(business_id)')
      .eq('conversations.business_id', business_id)
      .gte('created_at', sevenDaysAgo)

    // Also include topics without any active knowledge items
    const { data: weakTopics } = await supabase
      .from('competency_topics')
      .select('id, name, knowledge_count')
      .eq('business_id', business_id)
      .eq('knowledge_count', 0)
      .limit(3)

    const weakTopicNames = (weakTopics || []).map((t: { name: string }) => t.name)

    // 4. Build WhatsApp message
    const dateFormatted = new Date(date + 'T12:00:00Z').toLocaleDateString('es-GT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const messageText = buildDailySummaryMessage({
      businessName: business.name,
      date: dateFormatted,
      totalConversations,
      resolvedAutonomous,
      resolvedOwnerApproved,
      escalated,
      pending,
      estimatedMinutesSaved,
      weakTopicNames,
      type: type as 'daily' | 'first_week'
    })

    // 5. Send WhatsApp to owner's personal number (best-effort)
    let whatsappSentAt: string | null = null
    let whatsappError: string | null = null

    const ownerPhone = owner?.phone_personal
    const canSendWhatsApp = business.whatsapp_phone_number_id && business.whatsapp_access_token && ownerPhone

    if (canSendWhatsApp) {
      try {
        // Remove leading + if present — Meta API expects E.164 without +
        const toPhone = ownerPhone.replace(/^\+/, '')
        await sendWhatsAppMessage(business.whatsapp_phone_number_id, business.whatsapp_access_token, toPhone, messageText)
        whatsappSentAt = new Date().toISOString()
      } catch (err) {
        whatsappError = err instanceof Error ? err.message : String(err)
        console.error(`WhatsApp send failed for business ${business_id}:`, whatsappError)
      }
    } else {
      whatsappError = 'Missing WhatsApp credentials or owner phone'
      console.error(`Skipping WhatsApp for ${business_id}: ${whatsappError}`)
    }

    // 6. Persist DailySummary (upsert — safe to re-run)
    const { data: summary, error: insertErr } = await supabase
      .from('daily_summaries')
      .upsert({
        business_id,
        date,
        type,
        total_conversations: totalConversations,
        resolved_autonomous: resolvedAutonomous,
        resolved_owner_approved: resolvedOwnerApproved,
        escalated,
        pending,
        estimated_minutes_saved: estimatedMinutesSaved,
        weak_topics: (weakTopics || []).map((t: { id: string }) => t.id),
        whatsapp_sent_at: whatsappSentAt,
        whatsapp_content: messageText,
      }, { onConflict: 'business_id,date' })
      .select('id')
      .single()

    if (insertErr) {
      console.error('Failed to persist DailySummary:', insertErr)
      return new Response(JSON.stringify({ error: 'Failed to save summary', details: insertErr.message }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({
      success: true,
      summary_id: summary.id,
      total_conversations: totalConversations,
      whatsapp_sent: !!whatsappSentAt,
      whatsapp_error: whatsappError,
    }), { headers: corsHeaders })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('generate-daily-summary crash:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: corsHeaders })
  }
})
