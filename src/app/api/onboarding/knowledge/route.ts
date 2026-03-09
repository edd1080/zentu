import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: business } = await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const body = await request.json();
        const { name, description, address, schedule, services, tone } = body;

        // 1. Update Business info
        const businessUpdates: any = {};
        if (name) businessUpdates.name = name;
        if (description) businessUpdates.description = description;
        if (address) businessUpdates.address = address;
        if (schedule) businessUpdates.schedule = schedule;

        if (Object.keys(businessUpdates).length > 0) {
            await supabase
                .from("businesses")
                .update(businessUpdates)
                .eq("id", business.id);
        }

        // 2. Update Agent Tone
        if (tone) {
            await supabase
                .from("agents")
                .update({ tone })
                .eq("business_id", business.id);
        }

        // 3. Create KnowledgeSource & KnowledgeItems for Services if applicable
        if (services && services.trim().length > 0) {
            // Create source
            const { data: source } = await supabase
                .from("knowledge_sources")
                .insert({
                    business_id: business.id,
                    type: "onboarding",
                    raw_content: services,
                    processed_by: "system"
                })
                .select()
                .single();

            if (source) {
                // Find general/products topic ID (or default if any) to link the knowledge item
                // Alternatively, we just shove it into 'structured' layer without topic link for now, 
                // as structured layer knowledge is global/broad for operations.

                // For MVP, line by line or single blob. The plan says "Texto crudo directo a capa Structurada".
                await supabase
                    .from("knowledge_items")
                    .insert({
                        business_id: business.id,
                        source_id: source.id,
                        layer: "structured",
                        content: `SERVICIOS Y PRECIOS PRINCIPALES:\n${services}`,
                        active: true,
                        validity: "permanent"
                    });
            }
        }

        // 4. Update OnboardingProgress
        await supabase
            .from("onboarding_progress")
            .update({
                knowledge_completed: true,
                current_step: "escalation_rules"
            })
            .eq("business_id", business.id);

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("POST /api/onboarding/knowledge error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
