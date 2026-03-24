"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConversationItem, ConversationStatus, ActionRequired } from "@/components/dashboard/ConversationItem";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Conv = {
  id: string; clientName: string; lastMessageSnippet: string;
  timeAgo: string; status: ConversationStatus; actionRequired: ActionRequired;
};
type FilterTab = "attention" | "handled" | "archived";

async function fetchConversations(): Promise<Conv[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!biz) return [];
  const { data } = await supabase.from("conversations")
    .select("id, client_name, client_phone, last_message_preview, last_message_at, status")
    .eq("business_id", biz.id).order("last_message_at", { ascending: false });
  return (data || []).map((conv: any) => {
    let actionRequired: ActionRequired = "none";
    let uiStatus: ConversationStatus = "active";
    if (conv.status === "pending_approval")    actionRequired = "pending_approval";
    if (conv.status === "escalated_informative") actionRequired = "escalated_info";
    if (conv.status === "escalated_sensitive")  actionRequired = "escalated_sensitive";
    if (conv.status === "escalated_urgent")     actionRequired = "urgent";
    if (conv.status === "archived")  uiStatus = "archived";
    if (conv.status === "resolved")  uiStatus = "bot_handled";
    return {
      id: conv.id,
      clientName: conv.client_name || conv.client_phone || "Desconocido",
      lastMessageSnippet: conv.last_message_preview || "",
      timeAgo: conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      status: uiStatus, actionRequired,
    };
  });
}

const SUB_FILTERS = [
  { value: "all", label: "Todos", activeCls: "bg-slate-800 text-white", inactiveCls: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" },
  { value: "urgent", label: "Urgente", dot: true, activeCls: "bg-rose-500 text-white", inactiveCls: "bg-white border border-rose-100 text-rose-600 hover:bg-rose-50" },
  { value: "escalated_sensitive", label: "Sensible", activeCls: "bg-amber-500 text-white", inactiveCls: "bg-white border border-amber-100 text-amber-600 hover:bg-amber-50" },
  { value: "escalated_info", label: "Informativo", activeCls: "bg-blue-500 text-white", inactiveCls: "bg-white border border-blue-100 text-blue-600 hover:bg-blue-50" },
  { value: "pending_approval", label: "Sugerencia", activeCls: "bg-emerald-500 text-white", inactiveCls: "bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-50" },
] as const;

export default function ConversationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatRoute = /\/conversations\/[^/]+/.test(pathname);
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [activeTab, setActiveTab] = React.useState<FilterTab>("attention");
  const [urgencyFilter, setUrgencyFilter] = React.useState<ActionRequired | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: conversations = [] } = useQuery({ queryKey: ["conversations"], queryFn: fetchConversations, staleTime: 10_000 });

  React.useEffect(() => {
    const ch = supabase.channel("conversations-realtime-layout").on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => { queryClient.invalidateQueries({ queryKey: ["conversations"] }); }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [queryClient]);

  const attentionCount = React.useMemo(() => conversations.filter(c => c.actionRequired !== "none" || c.status === "active").length, [conversations]);
  const handledCount = React.useMemo(() => conversations.filter(c => c.actionRequired === "none" && c.status === "bot_handled").length, [conversations]);

  const filtered = React.useMemo(() => conversations
    .filter(conv => {
      if (searchQuery && !conv.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeTab === "attention") {
        const matches = conv.actionRequired !== "none" || conv.status === "active";
        if (!matches) return false;
        return urgencyFilter === "all" || conv.actionRequired === urgencyFilter;
      }
      if (activeTab === "handled") return conv.actionRequired === "none" && conv.status === "bot_handled";
      if (activeTab === "archived") return conv.status === "archived" || conv.status === "bot_handled";
      return true;
    })
    .sort((a, b) => {
      if (activeTab === "attention") {
        if (a.actionRequired === "urgent" && b.actionRequired !== "urgent") return -1;
        if (b.actionRequired === "urgent" && a.actionRequired !== "urgent") return 1;
      }
      return 0;
    }), [activeTab, searchQuery, conversations, urgencyFilter]);

  const tabs = [{ key: "attention" as FilterTab, label: "Atención requerida", badge: attentionCount }, { key: "handled" as FilterTab, label: "Atendidas hoy", badge: handledCount }, { key: "archived" as FilterTab, label: "Archivadas", badge: null }];

  return (
    <div className="flex flex-1 overflow-hidden w-full h-full">
      {/* Sidebar: conversations list */}
      <section className={cn(
        "flex-col w-full md:w-[380px] bg-[#FDFDFD] border-r border-slate-100 shrink-0 h-full",
        isChatRoute ? "hidden md:flex" : "flex"
      )}>
        <PageHeader title="Conversaciones" />
        <div className="px-5 pt-4 pb-3 border-b border-slate-100/80 bg-white shrink-0">
          <div className="relative mb-4 group">
            <Icon name="solar:magnifer-linear" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3DC185] transition-colors" />
            <input type="text" placeholder="Buscar cliente..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-[#3DC185]/5 transition-all placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100/60 rounded-xl border border-slate-200/50 mb-4">
            {tabs.map(({ key, label, badge }) => (
              <button key={key} onClick={() => setActiveTab(key)} className={cn("flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all", activeTab === key ? "bg-white shadow-sm ring-1 ring-slate-200/50 text-slate-900" : "text-slate-500 hover:text-slate-700")}>
                {label}
                {badge !== null && badge > 0 && <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center font-semibold">{badge}</span>}
              </button>
            ))}
          </div>
          {activeTab === "attention" && (
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar px-1 pb-1">
              {SUB_FILTERS.map(f => {
                const isActive = urgencyFilter === f.value;
                return (
                  <button key={f.value} onClick={() => setUrgencyFilter(f.value)} className={cn("px-3 py-1 rounded-full text-xs font-medium shrink-0 shadow-sm transition-colors flex items-center gap-1.5", isActive ? f.activeCls : f.inactiveCls)}>
                    {"dot" in f && f.dot && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map(conv => <ConversationItem key={conv.id} {...conv} />)
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Icon name="solar:inbox-in-linear" size={40} className="text-slate-200 mb-3" />
              <h3 className="font-semibold text-slate-900">No hay conversaciones aquí</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Tu bandeja está al día.</p>
            </div>
          )}
        </div>
      </section>

      {/* Right panel: children (empty state or chat thread) */}
      <div className={cn("flex-1 flex flex-col h-full overflow-hidden", isChatRoute ? "flex" : "hidden md:flex")}>{children}</div>
    </div>
  );
}
