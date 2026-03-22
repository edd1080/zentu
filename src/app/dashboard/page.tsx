import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AgentStatusBar } from "@/components/dashboard/AgentStatusBar";
import { QuickInstruct } from "@/components/dashboard/QuickInstruct";
import { ConversationItem } from "@/components/dashboard/ConversationItem";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { ConversationStatus, ActionRequired } from "@/components/dashboard/ConversationItem";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/onboarding");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Stats reales
  const [{ count: handledToday }, { count: pendingCount }, { count: missingTopicsCount }] = await Promise.all([
    supabase.from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .not("resolved_by", "is", null)
      .gte("last_message_at", todayStart.toISOString()),
    supabase.from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("status", "pending_approval"),
    supabase.from("competency_topics")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("knowledge_count", 0),
  ]);

  const stats = {
    handledToday: handledToday || 0,
    pendingCount: pendingCount || 0,
    missingTopicsCount: missingTopicsCount || 0,
  };

  // Conversaciones recientes reales
  const { data: recentConvs } = await supabase
    .from("conversations")
    .select("id, client_name, client_phone, last_message_preview, last_message_at, status")
    .eq("business_id", business.id)
    .neq("status", "archived")
    .order("last_message_at", { ascending: false })
    .limit(5);

  const recentItems = (recentConvs || []).map((conv) => {
    let actionRequired: ActionRequired = "none";
    let uiStatus: ConversationStatus = "active";

    if (conv.status === "pending_approval") actionRequired = "pending_approval";
    else if (conv.status === "escalated_informative") actionRequired = "escalated_info";
    else if (conv.status === "escalated_sensitive") actionRequired = "escalated_sensitive";
    else if (conv.status === "escalated_urgent") actionRequired = "urgent";

    if (conv.status === "resolved") uiStatus = "bot_handled";
    else if (conv.status === "archived") uiStatus = "archived";

    const timeAgo = conv.last_message_at
      ? new Date(conv.last_message_at).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })
      : "";

    return {
      id: conv.id,
      clientName: conv.client_name || conv.client_phone || "Desconocido",
      lastMessageSnippet: conv.last_message_preview || "",
      timeAgo,
      status: uiStatus,
      actionRequired,
    };
  });

  const agentStatus = stats.pendingCount > 0 ? "pending" : "active";

  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background) overflow-y-auto">
      <AgentStatusBar status={agentStatus} stats={stats} />

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-8 pb-32">
        <section className="flex flex-col gap-4">
          <div className="mb-2">
            <h1 className="font-display italic text-3xl text-(--text-primary)">
              Enséñale algo nuevo
            </h1>
            <p className="text-(--text-secondary) text-sm max-w-md mt-1">
              Tu agente responde usando lo que le enseñas aquí. Funciona como un cerebro que no olvida.
            </p>
          </div>
          <QuickInstruct businessId={business.id} />
        </section>

        <section className="flex flex-col flex-1 bg-white rounded-2xl border border-(--surface-border-strong) overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-(--surface-border)">
            <h2 className="font-semibold text-(--text-primary)">Actividad reciente</h2>
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
                <p className="text-sm text-(--text-secondary) mt-1">No hay conversaciones recientes.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
