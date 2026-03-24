import { M16AgentTesting } from "@/components/onboarding/m16-agent-testing";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AgentSandboxPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: business } = await supabase
        .from("businesses")
        .select("name, industry")
        .eq("owner_id", user.id)
        .single();

    if (!business) {
        redirect("/onboarding/industry");
    }

    return (
        <>
            <OnboardingHeader />
            <M16AgentTesting businessName={business.name} industry={business.industry} />
        </>
    );
}
