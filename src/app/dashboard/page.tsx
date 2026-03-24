import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AgentStatusBar } from "@/components/dashboard/AgentStatusBar";
import { QuickInstruct } from "@/components/dashboard/QuickInstruct";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { ActionRequired } from "@/components/dashboard/ConversationItem";
import { PageHeader } from "@/components/dashboard/PageHeader";

type ActivityItem = {
  id: string;
  clientName: string;
  snippet: string;
  timeAgo: string;
  actionRequired: ActionRequired;
};

function getInitials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const activityBadgeMap: Record<string, { label: string; icon: string; bg: string; text: string; avatarBg: string; avatarText: string; avatarBorder: string; dot?: boolean }> = {
  pending_approval: { label: "Por aprobar", icon: "solar:eye-linear", bg: "bg-amber-50", text: "text-amber-700", avatarBg: "bg-amber-50", avatarText: "text-amber-600", avatarBorder: "border-amber-100/50", dot: true },
  urgent: { label: "Urgente", icon: "solar:danger-triangle-linear", bg: "bg-rose-50", text: "text-rose-700", avatarBg: "bg-rose-50", avatarText: "text-rose-600", avatarBorder: "border-rose-100/50", dot: false },
  escalated_sensitive: { label: "Sensible", icon: "solar:shield-warning-linear", bg: "bg-amber-50", text: "text-amber-700", avatarBg: "bg-amber-50", avatarText: "text-amber-600", avatarBorder: "border-amber-100/50" },
  escalated_info: { label: "Informativo", icon: "solar:info-circle-linear", bg: "bg-blue-50", text: "text-blue-700", avatarBg: "bg-blue-50", avatarText: "text-blue-600", avatarBorder: "border-blue-100/50" },
  none: { label: "Resuelto", icon: "solar:check-circle-linear", bg: "bg-slate-50", text: "text-slate-500", avatarBg: "bg-slate-100", avatarText: "text-slate-600", avatarBorder: "border-slate-200/50" },
};

function ActivityRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const cfg = activityBadgeMap[item.actionRequired] ?? activityBadgeMap.none;
  return (
    <Link
      href={`/dashboard/conversations/${item.id}`}
      className={cn("p-4 md:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center hover:bg-slate-50 cursor-pointer transition-colors group active:bg-slate-100", !isLast && "border-b border-slate-100")}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0 w-full">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border relative", cfg.avatarBg, cfg.avatarBorder)}>
          <span className={cn("text-sm font-medium", cfg.avatarText)}>{getInitials(item.clientName)}</span>
          {cfg.dot && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 border-2 border-white rounded-full" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-slate-900 text-sm truncate">{item.clientName}</span>
            <span className="text-[11px] text-slate-400 shrink-0">{item.timeAgo}</span>
          </div>
          <p className="text-sm text-slate-500 truncate">{item.snippet}</p>
        </div>
      </div>
      <div className="flex items-center w-full sm:w-auto mt-0 shrink-0">
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium w-full sm:w-auto justify-center", cfg.bg, cfg.text, item.actionRequired === "none" && "border border-slate-200/60")}>
          <Icon name={cfg.icon} size={12} />
          {cfg.label}
        </span>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) redirect("/onboarding");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count: handledToday }, { count: pendingCount }, { count: missingTopicsCount }] = await Promise.all([
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("business_id", business.id).not("resolved_by", "is", null).gte("last_message_at", todayStart.toISOString()),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("status", "pending_approval"),
    supabase.from("competency_topics").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("knowledge_count", 0),
  ]);

  const stats = { handledToday: handledToday || 0, pendingCount: pendingCount || 0, missingTopicsCount: missingTopicsCount || 0 };

  const { data: recentConvs } = await supabase.from("conversations").select("id, client_name, client_phone, last_message_preview, last_message_at, status").eq("business_id", business.id).neq("status", "archived").order("last_message_at", { ascending: false }).limit(5);

  const recentItems: ActivityItem[] = (recentConvs || []).map((conv) => {
    let actionRequired: ActionRequired = "none";
    if (conv.status === "pending_approval") actionRequired = "pending_approval";
    else if (conv.status === "escalated_informative") actionRequired = "escalated_info";
    else if (conv.status === "escalated_sensitive") actionRequired = "escalated_sensitive";
    else if (conv.status === "escalated_urgent") actionRequired = "urgent";
    return {
      id: conv.id,
      clientName: conv.client_name || conv.client_phone || "Desconocido",
      snippet: conv.last_message_preview || "",
      timeAgo: conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" }) : "",
      actionRequired,
    };
  });

  const agentStatus = stats.pendingCount > 0 ? "pending" : "active";

  return (
    <div className="flex flex-1 flex-col h-full touch-scroll w-full overflow-x-hidden bg-[#F8F9FA] md:bg-white overflow-y-auto">
      <PageHeader title="Inicio" />
    <div className="flex-1 px-5 py-6 md:px-8 lg:px-10 max-w-3xl mx-auto w-full space-y-10 pb-28 md:pb-12">
      <AgentStatusBar status={agentStatus} stats={stats} />

      {/* Enséñale algo nuevo */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-medium tracking-tight text-slate-900 italic">Enséñale algo nuevo</h1>
          <p className="text-sm text-slate-500 mt-1">Escribe, graba o adjunta una instrucción rápida para tu agente.</p>
        </div>
        <QuickInstruct businessId={business.id} />
      </div>

      {/* Actividad reciente */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Actividad reciente</h2>
          <Link href="/dashboard/conversations" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors active:opacity-70">
            Ver bandeja
            <Icon name="solar:alt-arrow-right-linear" size={16} />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]">
          {recentItems.length > 0 ? (
            recentItems.map((item, i) => (
              <ActivityRow key={item.id} item={item} isLast={i === recentItems.length - 1} />
            ))
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3">
                <Icon name="solar:check-circle-linear" size={24} />
              </div>
              <h3 className="font-semibold text-slate-900">Tu agente está al día</h3>
              <p className="text-sm text-slate-500 mt-1">No hay conversaciones recientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
