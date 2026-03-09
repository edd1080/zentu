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

        const body = await request.json();
        const { industry } = body;

        if (!industry) {
            return NextResponse.json({ error: "Industry is required" }, { status: 400 });
        }

        // Use RPC seed_industry_data
        const { data: topics, error: rpcError } = await supabase.rpc("seed_industry_data", {
            p_business_id: business.id,
            p_industry: industry
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            return NextResponse.json({ error: rpcError.message || "Failed to seed industry data", details: rpcError }, { status: 500 });
        }

        return NextResponse.json({ success: true, topics });

    } catch (err: any) {
        console.error("POST /api/onboarding/industry error:", err);
        return NextResponse.json({ error: err?.message || "Internal Server Error", raw: String(err) }, { status: 500 });
    }
}
