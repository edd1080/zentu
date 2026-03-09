import { M13KnowledgeCapture } from "@/components/onboarding/m13-knowledge-capture";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function KnowledgeCapturePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: business } = await supabase
        .from("businesses")
        .select("industry")
        .eq("owner_id", user.id)
        .single();

    return (
        <>
            <OnboardingHeader />
            <M13KnowledgeCapture initialIndustry={business?.industry || "other"} />
        </>
    );
}
