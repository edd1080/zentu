import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get Business and Onboarding Progress
        // We assume 1 owner -> 1 business for the MVP
        const { data: business, error: businessError } = await supabase
            .from("businesses")
            .select("id, name, industry, onboarding_progress (*)")
            .eq("owner_id", user.id)
            .single();

        if (businessError || !business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        return NextResponse.json({
            business_id: business.id,
            name: business.name,
            industry: business.industry,
            progress: business.onboarding_progress[0] // since relation is 1-to-1 but might return array
        });

    } catch (err) {
        console.error("GET /api/onboarding/progress error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
