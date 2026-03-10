import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { business_id } = await req.json();

        // Validate secret internally or via API gateway
        if (!business_id) {
            return new Response(JSON.stringify({ error: "Missing business_id" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Initialize Supabase Client (Service Role for internal admin operations)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch Business Name
        const { data: businessData, error: businessError } = await supabase
            .from('businesses')
            .select('name')
            .eq('id', business_id)
            .single();

        if (businessError || !businessData) {
            throw new Error(`Business not found: ${businessError?.message}`);
        }

        const businessName = businessData.name;

        // Fetch Knowledge Items
        const { data: knowledgeItems, error: knowledgeError } = await supabase
            .from('knowledge_items')
            .select('*')
            .eq('business_id', business_id)
            .eq('active', true);

        if (knowledgeError) {
            throw new Error(`Error fetching knowledge items: ${knowledgeError.message}`);
        }

        // Fetch Escalation Rules
        const { data: escalationRules, error: escalationError } = await supabase
            .from('escalation_rules')
            .select('*')
            .eq('business_id', business_id)
            .eq('active', true);

        if (escalationError) {
            throw new Error(`Error fetching escalation rules: ${escalationError.message}`);
        }

        // --- Block 1: Role ---
        let contextString = `ERES EL ASISTENTE VIRTUAL DE WHATSAPP PARA EL NEGOCIO: ${businessName}.\n`;
        contextString += `Tu objetivo es responder de manera amable, profesional y concisa a las consultas de los clientes. Siempre debes comportarte como parte del equipo de ${businessName}.\n\n`;

        // --- Block 2 & 3: Knowledge (Structured/Operational vs Narrative/Learned) ---
        const activeKnowledgeItems = knowledgeItems?.filter((item: any) => {
            if (item.valid_until) {
                return new Date(item.valid_until) > new Date();
            }
            return true;
        }) || [];

        const structuredKnowledge = activeKnowledgeItems.filter((item: any) => item.layer === 'structured' || item.layer === 'operational');
        const narrativeKnowledge = activeKnowledgeItems.filter((item: any) => item.layer === 'narrative' || item.layer === 'learned');

        if (structuredKnowledge.length > 0) {
            contextString += `=== CONOCIMIENTO CENTRAL (REGLAS Y DATOS) ===\n`;
            structuredKnowledge.forEach((item: any) => {
                contextString += `- ${item.content}\n`;
            });
            contextString += `\n`;
        }

        if (narrativeKnowledge.length > 0) {
            contextString += `=== INSTRUCCIONES ESPECÍFICAS Y APRENDIZAJES ===\n`;
            narrativeKnowledge.forEach((item: any) => {
                contextString += `- ${item.content}\n`;
            });
            contextString += `\n`;
        }

        // --- Block 4: Escalation Rules ---
        if (escalationRules && escalationRules.length > 0) {
            contextString += `=== REGLAS DE ESCALAMIENTO Y LIMITACIONES ===\n`;
            contextString += `No intentes responder si el cliente pregunta por los siguientes temas y aplica las condiciones descritas:\n`;
            escalationRules.forEach((rule: any) => {
                contextString += `- TEMA (${rule.trigger_type}): ${rule.description} -> Escalar a humano (Nivel: ${rule.escalation_level}).\n`;
            });
            contextString += `\n`;
        }

        // Save Context String to Cache
        const { error: upsertError } = await supabase
            .from('agent_context_cache')
            .upsert(
                {
                    business_id,
                    context_string: contextString,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'business_id' }
            );

        if (upsertError) {
            console.error("Failed to upsert cache: ", upsertError);
            throw new Error(`Failed to save context cache: ${upsertError.message}`);
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Context built and cached successfully."
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("Build Context Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
