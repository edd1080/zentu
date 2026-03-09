import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Dashboard placeholder — protected route.
 * Checks auth and onboarding status, redirects accordingly.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check onboarding status
  const { data: owner } = await supabase
    .from("owners")
    .select("id, full_name")
    .eq("id", user.id)
    .single();

  if (!owner) {
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
        ¡Bienvenido, {owner.full_name}!
      </h1>
      <p
        className="text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        Dashboard en construcción — Bloque 2.1 completo.
      </p>
    </div>
  );
}
