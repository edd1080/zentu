import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

type EscalationRule = Database["public"]["Tables"]["escalation_rules"]["Row"];

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Business
        const { data: business } = await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        // Fetch Escalation Rules
        const { data: rules, error } = await supabase
            .from("escalation_rules")
            .select("*")
            .eq("business_id", business.id)
            .order("is_default", { ascending: false });

        if (error) {
            console.error("GET escalation rules error:", error);
            return NextResponse.json({ error: "Failed to fetch escalation rules" }, { status: 500 });
        }

        return NextResponse.json({ success: true, rules });

    } catch (err: any) {
        console.error("GET /api/onboarding/escalation-rules error:", err);
        return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Business
        const { data: business } = await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const body = await request.json();
        const { rules } = body;

        if (!rules || !Array.isArray(rules)) {
            return NextResponse.json({ error: "Rules array is required" }, { status: 400 });
        }

        // Instead of doing multiple calls, we will iterate and upsert.
        // For security, mapping everything carefully.
        const mappedRules = rules.map((rule: Partial<EscalationRule>) => ({
            id: rule.id, // Supabase will match by ID for upsert
            business_id: business.id,
            description: rule.description || "",
            trigger_type: rule.trigger_type || "keyword_match",
            keywords: rule.keywords || [],
            escalation_level: rule.escalation_level || "informative",
            active: rule.active !== undefined ? rule.active : true,
            is_default: rule.is_default !== undefined ? rule.is_default : false
        }));

        const { error: upsertError } = await supabase
            .from("escalation_rules")
            .upsert(mappedRules, { onConflict: "id" });

        if (upsertError) {
            console.error("Upsert rules error:", upsertError);
            return NextResponse.json({ error: "Failed to update rules" }, { status: 500 });
        }

        // Mark escalation_rules step as complete
        await supabase
            .from("onboarding_progress")
            .update({ escalation_rules_completed: true })
            .eq("owner_id", user.id);

        return NextResponse.json({ success: true, message: "Rules updated successfully!" });

    } catch (err: any) {
        console.error("POST /api/onboarding/escalation-rules error:", err);
        return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
    }
}
