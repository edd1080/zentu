import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Onboarding placeholder — protected route.
 * Will be replaced in Bloque 2.2 with the real M1.2 flow.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-8"
      style={{ backgroundColor: "var(--surface-background)" }}
    >
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Onboarding
      </h1>
      <p
        className="text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        Flujo de onboarding se implementa en Bloque 2.2.
      </p>
    </div>
  );
}
