"use client";

import * as React from "react";
import { ConversationItem, ConversationStatus, ActionRequired } from "@/components/dashboard/ConversationItem";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type MockConv = {
  id: string;
  clientName: string;
  lastMessageSnippet: string;
  timeAgo: string;
  status: ConversationStatus;
  actionRequired: ActionRequired;
  confidence?: "high" | "medium" | "low";
};

// Simulated Data for UI construction (will be replaced by Supabase Realtime)
// We keep the type for the UI component

type FilterTab = "attention" | "handled" | "archived";

export default function InboxPage() {
  const [activeTab, setActiveTab] = React.useState<FilterTab>("attention");
  const [urgencyFilter, setUrgencyFilter] = React.useState<ActionRequired | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const [conversations, setConversations] = React.useState<MockConv[]>([]);
  const supabase = createClient();

  React.useEffect(() => {
    let channel: any;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (data) {
        const mapped: MockConv[] = data.map((conv: any) => {
          let actionRequired: ActionRequired = "none";
          let uiStatus: ConversationStatus = "active";

          if (conv.status === "pending_approval") actionRequired = "pending_approval";
          if (conv.status === "escalated_informative") actionRequired = "escalated_info";
          if (conv.status === "escalated_sensitive") actionRequired = "escalated_sensitive";
          if (conv.status === "escalated_urgent") actionRequired = "urgent";

          if (conv.status === "archived") uiStatus = "archived";
          if (conv.status === "resolved") uiStatus = "bot_handled";

          return {
            id: conv.id,
            clientName: conv.client_name || conv.client_phone || "Desconocido",
            lastMessageSnippet: conv.last_message_preview || "",
            timeAgo: conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
            status: uiStatus,
            actionRequired: actionRequired,
            confidence: undefined // Would need join with suggestions, omitted for MVP simplicity
          };
        });
        setConversations(mapped);
      }
    };

    fetchConversations();

    // Subscribe to any conversation changes
    channel = supabase.channel(`public_conversations_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations(); // Re-fetch on any change to keep sorting and data fresh
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Compute counts for the tabs
  const attentionCount = React.useMemo(() => {
    return conversations.filter(conv => conv.actionRequired !== "none" || conv.status === "active").length;
  }, [conversations]);

  const handledCount = React.useMemo(() => {
    return conversations.filter(conv => conv.actionRequired === "none" && conv.status === "bot_handled").length;
  }, [conversations]);

  // Logic to filter the mock data
  const filteredConversations = React.useMemo(() => {
    return conversations.filter((conv: MockConv) => {
      // 1. Text search
      if (searchQuery && !conv.clientName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // 2. Tab Filter
      if (activeTab === "attention") {
        const matchesAttention = conv.actionRequired !== "none" || conv.status === "active";
        if (!matchesAttention) return false;
        
        if (urgencyFilter !== "all") {
          return conv.actionRequired === urgencyFilter;
        }
        return true;
      }
      if (activeTab === "handled") {
        return conv.actionRequired === "none" && conv.status === "bot_handled";
      }
      if (activeTab === "archived") {
        return conv.status === "archived" || conv.status === "resolved";
      }
      
      return true;
    }).sort((a: MockConv, b: MockConv) => {
      // Prioritize urgent in "attention" tab
      if (activeTab === "attention") {
        if (a.actionRequired === "urgent" && b.actionRequired !== "urgent") return -1;
        if (b.actionRequired === "urgent" && a.actionRequired !== "urgent") return 1;
      }
      return 0; // Simplified sort
    });
  }, [activeTab, searchQuery, conversations, urgencyFilter]);

  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background)">
      {/* Header & Tabs */}
      <div className="sticky top-0 z-20 bg-(--surface-background)/95 backdrop-blur supports-[backdrop-filter]:bg-(--surface-background)/80 border-b border-(--surface-border) pt-6 px-4 pb-0">
        <h1 className="font-display italic text-3xl text-(--text-primary) mb-4">
          Conversaciones
        </h1>
        
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
          <button
            onClick={() => setActiveTab("attention")}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === "attention" 
                ? "border-(--color-primary-700) text-(--color-primary-700)" 
                : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            Atención requerida
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-(--color-primary-100) px-2 py-0.5 text-xs text-(--color-primary-700)">
              {attentionCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("handled")}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === "handled" 
                ? "border-(--color-primary-700) text-(--color-primary-700)" 
                : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            Atendidas hoy
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-(--surface-muted) px-2 py-0.5 text-xs text-(--text-secondary)">
              {handledCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === "archived" 
                ? "border-(--color-primary-700) text-(--color-primary-700)" 
                : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            Archivadas
          </button>
        </div>

        {activeTab === "attention" && (
          <div className="flex gap-2 mt-4 pb-4 border-b border-transparent overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setUrgencyFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                urgencyFilter === "all" 
                  ? "bg-(--color-primary-700) text-white" 
                  : "bg-(--surface-muted) text-(--text-secondary) hover:bg-(--surface-border)"
              )}
            >
              Todos
            </button>
            <button 
              onClick={() => setUrgencyFilter("urgent")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                urgencyFilter === "urgent" 
                  ? "bg-(--color-error-500) text-white whitespace-nowrap" 
                  : "bg-(--color-error-100) text-(--color-error-700) hover:bg-(--color-error-100) whitespace-nowrap"
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full bg-current", urgencyFilter === "urgent" ? "animate-pulse" : "blink")} />
              Urgente
            </button>
            <button 
              onClick={() => setUrgencyFilter("escalated_sensitive")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                urgencyFilter === "escalated_sensitive" 
                  ? "bg-(--color-warning-500) text-white" 
                  : "bg-(--color-warning-100) text-(--color-warning-700) hover:bg-(--color-warning-100)"
              )}
            >
              Sensible
            </button>
            <button 
              onClick={() => setUrgencyFilter("escalated_info")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                urgencyFilter === "escalated_info" 
                  ? "bg-(--color-accent-500) text-white" 
                  : "bg-(--color-accent-100) text-(--color-accent-700) hover:bg-(--color-accent-100)"
              )}
            >
              Informativo
            </button>
            <button 
              onClick={() => setUrgencyFilter("pending_approval")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                urgencyFilter === "pending_approval" 
                  ? "bg-(--color-success-500) text-white" 
                  : "bg-(--color-success-100) text-(--color-success-700) hover:bg-(--color-success-100)"
              )}
            >
              Sugerencia
            </button>
          </div>
        )}
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto w-full bg-(--surface-background) pb-32">
        <div className="flex flex-col">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                {...conv}
                onQuickApprove={(id) => {
                  console.log("Quick approve trigger on UI for", id);
                }}
              />
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
