import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AgentStatusBar } from "@/components/dashboard/AgentStatusBar";
import { QuickInstruct } from "@/components/dashboard/QuickInstruct";
import { ConversationItem } from "@/components/dashboard/ConversationItem";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Authentication and specific route checks omitted for brevity but strictly needed:
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  // Fetch quick metrics for home page simulating typical business operations
  // For the MVP, if the db queries don't exist yet, we mock the stats cleanly.
  // We will build the robust Dashboard Realtime Provider next.

  const mockStats = {
    handledToday: 12,
    pendingCount: 2,
    missingTopicsCount: 1,
  };

  // Pending Actions
  const recentItems = [
    {
      id: "conv_1",
      clientName: "Andrea Gómez",
      lastMessageSnippet: "¿A qué hora cierran hoy?",
      timeAgo: "2 min",
      status: "active" as const,
      actionRequired: "pending_approval" as const,
      confidence: "high" as const,
    },
    {
      id: "conv_2",
      clientName: "Carlos R.",
      lastMessageSnippet: "Necesito cambiar mi reserva por favor.",
      timeAgo: "15 min",
      status: "active" as const,
      actionRequired: "escalated_sensitive" as const,
    },
    {
      id: "conv_3",
      clientName: "María",
      lastMessageSnippet: "Gracias, nos vemos pronto.",
      timeAgo: "1 h",
      status: "bot_handled" as const,
      actionRequired: "none" as const,
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background) overflow-y-auto">
      {/* 1. Agent Status Bar */}
      <AgentStatusBar 
        status={mockStats.pendingCount > 0 ? "pending" : "active"} 
        stats={mockStats} 
      />

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-8 pb-32">
        {/* 2. Welcome & Quick Instruct */}
        <section className="flex flex-col gap-4">
          <div className="mb-2">
            <h1 className="font-display italic text-3xl text-(--text-primary)">
              Enséñale algo nuevo
            </h1>
            <p className="text-(--text-secondary) text-sm max-w-md mt-1">
              Tu agente responde usando lo que le enseñas aquí. Funciona como un cerebro que no olvida.
            </p>
          </div>
          
          <QuickInstruct />
        </section>

        {/* 3. Summarized Inbox */}
        <section className="flex flex-col flex-1 bg-white rounded-2xl border border-(--surface-border-strong) overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-(--surface-border)">
            <h2 className="font-semibold text-(--text-primary)">
              Actividad reciente
            </h2>
            <Link 
              href="/dashboard/conversations" 
              className="text-sm text-(--color-primary-700) font-medium flex items-center hover:underline"
            >
              Ver bandeja
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="flex flex-col">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <ConversationItem key={item.id} {...item} />
              ))
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-(--surface-muted) flex items-center justify-center mb-3">
                  <Check className="h-6 w-6 text-(--color-success-500)" />
                </div>
                <h3 className="font-semibold text-(--text-primary)">Tu agente está al día</h3>
                <p className="text-sm text-(--text-secondary) mt-1">Hoy se han resuelto 12 conversaciones automáticamente.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
