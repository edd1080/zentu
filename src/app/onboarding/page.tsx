import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current step
  const { data: business } = await supabase
    .from("businesses")
    .select("onboarding_progress (current_step)")
    .eq("owner_id", user.id)
    .single();

  const progress = business?.onboarding_progress?.[0];
  const currentStep = progress?.current_step || "industry";

  // Map step to route
  switch (currentStep) {
    case "industry":
      redirect("/onboarding/industry");
    case "knowledge":
      redirect("/onboarding/knowledge");
    case "escalation_rules":
      redirect("/onboarding/escalation-rules");
    case "whatsapp":
      redirect("/onboarding/whatsapp");
    case "test":
      redirect("/onboarding/test");
    case "complete":
    case "activation":
    default:
      redirect("/dashboard");
  }
}
