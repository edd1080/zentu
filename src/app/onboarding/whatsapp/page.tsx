import { M15WhatsappConnect } from "@/components/onboarding/m15-whatsapp-connect";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WhatsappConnectPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <>
            <OnboardingHeader />
            <M15WhatsappConnect />
        </>
    );
}
