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

        // Parse optional intent (simulate success / later)
        const body = await request.json();
        const { simulateSuccess } = body;

        // Verify Business
        const { data: business } = await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        if (simulateSuccess) {
            // Update Business with "connected" status
            const { error: bizUpdateError } = await supabase
                .from("businesses")
                .update({
                    whatsapp_status: "connected",
                    whatsapp_phone_number_id: "simulated_phone_id",
                    whatsapp_waba_id: "simulated_waba_id",
                    whatsapp_access_token: "simulated_token"
                })
                .eq("id", business.id);

            if (bizUpdateError) {
                console.error("WhatsApp status update error:", bizUpdateError);
                return NextResponse.json({ error: "Failed to update business WhatsApp status" }, { status: 500 });
            }
        }

        // Mark whatsapp flow as complete in onboarding_progress
        const { error: progError } = await supabase
            .from("onboarding_progress")
            .update({
                whatsapp_completed: true,
                whatsapp_skipped: !simulateSuccess
            })
            .eq("business_id", business.id);

        if (progError) {
            console.error("Progress update error:", progError);
            return NextResponse.json({ error: "Failed to update onboarding progress" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "WhatsApp setup simulated successfully!" });

    } catch (err: any) {
        console.error("POST /api/onboarding/whatsapp error:", err);
        return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
    }
}
