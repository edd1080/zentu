"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConversationItem, ConversationStatus, ActionRequired } from "@/components/dashboard/ConversationItem";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Conv = {
  id: string;
  clientName: string;
  lastMessageSnippet: string;
  timeAgo: string;
  status: ConversationStatus;
  actionRequired: ActionRequired;
};

type FilterTab = "attention" | "handled" | "archived";

async function fetchConversations(): Promise<Conv[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: biz } = await supabase
    .from("businesses").select("id").eq("owner_id", user.id).single();
  if (!biz) return [];

  const { data } = await supabase
    .from("conversations")
    .select("id, client_name, client_phone, last_message_preview, last_message_at, status")
    .eq("business_id", biz.id)
    .order("last_message_at", { ascending: false });

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
      timeAgo: conv.last_message_at
        ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
      status: uiStatus,
      actionRequired,
    };
  });
}

export default function InboxPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [activeTab, setActiveTab] = React.useState<FilterTab>("attention");
  const [urgencyFilter, setUrgencyFilter] = React.useState<ActionRequired | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 10_000,
  });

  // Realtime: invalidate cache on any conversation change instead of re-fetching manually
  React.useEffect(() => {
    const channel = supabase
      .channel("conversations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["nav-counts"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const attentionCount = React.useMemo(
    () => conversations.filter(c => c.actionRequired !== "none" || c.status === "active").length,
    [conversations]
  );

  const handledCount = React.useMemo(
    () => conversations.filter(c => c.actionRequired === "none" && c.status === "bot_handled").length,
    [conversations]
  );

  const filteredConversations = React.useMemo(() => {
    return conversations
      .filter((conv) => {
        if (searchQuery && !conv.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (activeTab === "attention") {
          const matches = conv.actionRequired !== "none" || conv.status === "active";
          if (!matches) return false;
          return urgencyFilter === "all" || conv.actionRequired === urgencyFilter;
        }
        if (activeTab === "handled")  return conv.actionRequired === "none" && conv.status === "bot_handled";
        if (activeTab === "archived") return conv.status === "archived" || conv.status === "bot_handled";
        return true;
      })
      .sort((a, b) => {
        if (activeTab === "attention") {
          if (a.actionRequired === "urgent" && b.actionRequired !== "urgent") return -1;
          if (b.actionRequired === "urgent" && a.actionRequired !== "urgent") return 1;
        }
        return 0;
      });
  }, [activeTab, searchQuery, conversations, urgencyFilter]);

  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background)">
      {/* Header & Tabs */}
      <div className="sticky top-0 z-20 bg-(--surface-background)/95 backdrop-blur supports-[backdrop-filter]:bg-(--surface-background)/80 border-b border-(--surface-border) pt-6 px-4 pb-0">
        <h1 className="font-display italic text-3xl text-(--text-primary) mb-4">Conversaciones</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
          <Input
            placeholder="Buscar por nombre o número..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-[-1px]">
          {[
            { key: "attention", label: "Atención requerida", badge: attentionCount },
            { key: "handled",   label: "Atendidas hoy",      badge: handledCount },
            { key: "archived",  label: "Archivadas",          badge: null },
          ].map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as FilterTab)}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-(--color-primary-700) text-(--color-primary-700)"
                  : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              {label}
              {badge !== null && (
                <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                  activeTab === key
                    ? "bg-(--color-primary-100) text-(--color-primary-700)"
                    : "bg-(--surface-muted) text-(--text-secondary)"
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "attention" && (
          <div className="flex gap-2 mt-4 pb-4 overflow-x-auto hide-scrollbar">
            {([
              { value: "all",                  label: "Todos",       activeClass: "bg-(--color-primary-700) text-white",   inactiveClass: "bg-(--surface-muted) text-(--text-secondary)" },
              { value: "urgent",               label: "Urgente",     activeClass: "bg-(--color-error-500) text-white",     inactiveClass: "bg-(--color-error-100) text-(--color-error-700)" },
              { value: "escalated_sensitive",  label: "Sensible",    activeClass: "bg-(--color-warning-500) text-white",   inactiveClass: "bg-(--color-warning-100) text-(--color-warning-700)" },
              { value: "escalated_info",       label: "Informativo", activeClass: "bg-(--color-accent-500) text-white",    inactiveClass: "bg-(--color-accent-100) text-(--color-accent-700)" },
              { value: "pending_approval",     label: "Sugerencia",  activeClass: "bg-(--color-success-500) text-white",   inactiveClass: "bg-(--color-success-100) text-(--color-success-700)" },
            ] as const).map(({ value, label, activeClass, inactiveClass }) => (
              <button
                key={value}
                onClick={() => setUrgencyFilter(value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  urgencyFilter === value ? activeClass : inactiveClass
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto w-full bg-(--surface-background) pb-32">
        <div className="flex flex-col">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <ConversationItem key={conv.id} {...conv} onQuickApprove={() => {}} />
            ))
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Filter className="h-10 w-10 text-(--surface-border-strong) mb-3" />
              <h3 className="font-semibold text-(--text-primary)">No hay conversaciones aquí</h3>
              <p className="text-sm text-(--text-secondary) mt-1 max-w-sm">
                Tu bandeja está al día para esta categoría o no hay resultados para tu búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
