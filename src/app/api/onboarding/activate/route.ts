import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

        // Complete onboarding
        const { error: progError } = await supabase
            .from("onboarding_progress")
            .update({
                test_completed: true,
                completed_at: new Date().toISOString()
            })
            .eq("business_id", business.id);

        if (progError) {
            console.error("Progress update error:", progError);
            return NextResponse.json({ error: "Failed to update onboarding progress" }, { status: 500 });
        }

        // Set activated_at on Business
        const { error: bizError } = await supabase
            .from("businesses")
            .update({ activated_at: new Date().toISOString() })
            .eq("id", business.id);

        if (bizError) {
            console.error("Business activation error:", bizError);
        }

        return NextResponse.json({ success: true, message: "Agent activated successfully!" });

    } catch (err: any) {
        console.error("POST /api/onboarding/activate error:", err);
        return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
    }
}
