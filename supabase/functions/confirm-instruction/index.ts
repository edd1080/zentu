import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("AGENTI: confirm-instruction invocada")

    // 1. Extract and verify JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error("AGENTI: Auth failed:", authError?.message)
      return new Response(JSON.stringify({ error: 'auth_failed', message: authError?.message || 'No user session' }), { status: 401, headers: corsHeaders })
    }

    console.log("AGENTI: Autenticado como user:", user.id)

    // 2. Parse body
    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(JSON.stringify({ error: 'invalid_body', message: 'Invalid JSON body' }), { status: 400, headers: corsHeaders })
    }

    const { proposed_item, business_id, replace_previous = false } = body

    // 3. Verify ownership
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('owner_id', user.id)
      .single()

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: 'Business not found or unauthorized' }), { status: 404, headers: corsHeaders })
    }

    // 4. Resolve or Create Topic
    const topicName = proposed_item.topic || 'General'
    let { data: topic } = await supabase
      .from('competency_topics')
      .select('id')
      .eq('business_id', business_id)
      .eq('name', topicName)
      .single()

    if (!topic) {
      const { data: newTopic, error: createTopicError } = await supabase
        .from('competency_topics')
        .insert([{ business_id, name: topicName, status: 'weak', coverage_percentage: 0 }])
        .select('id')
        .single()
      
      if (createTopicError) throw createTopicError
      topic = newTopic
    }

    // 5. If replace_previous, deactivate existing items of same topic+layer
    if (replace_previous && topic) {
      await supabase
        .from('knowledge_items')
        .update({ active: false })
        .eq('business_id', business_id)
        .eq('topic_id', topic.id)
        .eq('layer', proposed_item.layer || 'learned')
        .eq('active', true)
      console.log("AGENTI: Items anteriores desactivados para topic:", topic.id, "layer:", proposed_item.layer)
    }

    // 7. Register Knowledge Source
    const { data: source, error: sourceError } = await supabase
      .from('knowledge_sources')
      .insert([{
        business_id,
        type: 'quick_instruct',
        raw_content: proposed_item.content,
        processed_by: 'process-quick-instruct'
      }])
      .select('id')
      .single()

    if (sourceError) throw sourceError

    // 6. Persist Knowledge Item
    const { data: newItem, error: insertError } = await supabase
      .from('knowledge_items')
      .insert([{
        business_id,
        source_id: source.id,
        topic_id: topic?.id,
        content: proposed_item.content,
        layer: proposed_item.layer || 'learned',
        active: true,
        confirmed_by_owner: true
      }])
      .select('id')
      .single()

    if (insertError) throw insertError

    // 7. Recalculate competency coverage for this topic
    await supabase.rpc('refresh_competency_coverage', { p_business_id: business_id })

    // 8. Invalidate Cache
    await supabase
      .from('agent_context_cache')
      .delete()
      .eq('business_id', business_id)

    // 9. Trigger Context Rebuild (fire and forget)
    supabase.functions.invoke('build-agent-context', { 
      body: { business_id },
      headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    }).catch((err: unknown) => console.error("Cache rebuild trigger failed", err))

    console.log("AGENTI: Instrucción confirmada, item_id:", newItem.id)

    return new Response(JSON.stringify({ success: true, item_id: newItem.id }), {
      headers: corsHeaders,
      status: 200,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("AGENTI: Error:", msg)
    return new Response(JSON.stringify({ error: 'internal_error', message: msg }), {
      headers: corsHeaders,
      status: 400,
    })
  }
})
