import { M14EscalationRules } from "@/components/onboarding/m14-escalation-rules";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EscalationRulesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Verify business exists
    const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!business) {
        redirect("/onboarding/industry");
    }

    return (
        <>
            <OnboardingHeader />
            <M14EscalationRules />
        </>
    );
}
