import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID")
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { owner_id, title, body, action_url, business_id } = await req.json()

        if (!owner_id) throw new Error("owner_id is required")

        // 1. Obtener el onesignal_id del owner
        const { data: owner, error: ownerError } = await supabase
            .from('owners')
            .select('onesignal_id')
            .eq('id', owner_id)
            .single()

        if (ownerError || !owner?.onesignal_id) {
            console.error("Owner not found or no onesignal_id:", ownerError)
            return new Response(JSON.stringify({ error: "Owner has no push subscription" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            })
        }

        // 2. Enviar a OneSignal
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                include_player_ids: [owner.onesignal_id],
                headings: { en: title, es: title },
                contents: { en: body, es: body },
                url: action_url
            })
        })

        const result = await response.json()

        // 3. Registrar en public.notifications
        await supabase.from('notifications').insert({
            owner_id,
            business_id,
            title,
            body,
            channel: 'push',
            status: response.ok ? 'sent' : 'failed',
            action_url,
            type: 'escalation'
        })

        if (!response.ok) {
            console.error("OneSignal Error:", result)
            throw new Error(`OneSignal API error: ${JSON.stringify(result)}`)
        }

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })

    } catch (error) {
        console.error("send-notification error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})
