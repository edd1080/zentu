"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, ArrowUp } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { MessageBubble, MessageSenderType } from "@/components/dashboard/MessageBubble";
import { AgentSuggestionWidget } from "@/components/dashboard/AgentSuggestionWidget";
import { EscalationBannerWidget, EscalationType } from "@/components/dashboard/EscalationBannerWidget";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type MockMsg = {
  id: string;
  sender: MessageSenderType;
  content: string;
  time: string;
};

// Simulated Data to layout the thread
const MOCK_MESSAGES: MockMsg[] = [
  { id: "m1", sender: "client", content: "Hola, ¿están abiertos?", time: "10:00 AM" },
  { id: "m2", sender: "agent", content: "¡Hola! Sí, estamos abiertos de 10 AM a 10 PM. ¿En qué te ayudo?", time: "10:01 AM" },
  { id: "m3", sender: "client", content: "¿Puedo llevar a mi perro pequeño? Es muy tranquilo.", time: "10:05 AM" },
];

export default function ConversationThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();
  
  // States
  const [messages, setMessages] = React.useState<MockMsg[]>([]);
  const [suggestionState, setSuggestionState] = React.useState<"active" | "escalated" | "handled">("handled");
  const [activeSuggestion, setActiveSuggestion] = React.useState<any>(null);
  const [activeEscalation, setActiveEscalation] = React.useState<any>(null);
  const [clientData, setClientData] = React.useState({ name: "Cargando...", phone: "" });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const supabase = createClient();

  React.useEffect(() => {
    let channel: any;

    const loadData = async () => {
      // 1. Fetch Conversation Context
      const { data: conv } = await supabase
        .from("conversations")
        .select("client_name, client_phone, status")
        .eq("id", id)
        .single();
        
      if (conv) {
        setClientData({ name: conv.client_name || "Cliente", phone: conv.client_phone || "" });
      }

      // 2. Fetch Messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (msgs) {
        setMessages(msgs.map(m => ({
          id: m.id,
          sender: (m.sender_type === "system" ? "agent" : m.sender_type) as MessageSenderType,
          content: m.content || "",
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }

      // 3. Fetch active Suggestions/Escalations if needed based on status
      if (conv?.status === "pending_approval") {
        const { data: sugg } = await supabase
          .from("suggestions")
          .select("*")
          .eq("conversation_id", id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (sugg) {
          setActiveSuggestion(sugg);
          setSuggestionState("active");
        }
      } else if (conv?.status?.startsWith("escalated")) {
        const { data: esc } = await supabase
          .from("escalations")
          .select("*")
          .eq("conversation_id", id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (esc) {
          setActiveEscalation(esc);
          setSuggestionState("escalated");
        }
      } else {
        setSuggestionState("handled");
      }
    };

    loadData();

    // 4. Set up Realtime Subscriptions
    channel = supabase.channel(`thread_${id}_${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, (payload: any) => {
        const m = payload.new;
        setMessages(prev => {
          // Check for dupes by ID just in case
          if (prev.find(x => x.id === m.id)) return prev;
          return [...prev, {
            id: m.id,
            sender: (m.sender_type === "system" ? "agent" : m.sender_type) as MessageSenderType,
            content: m.content || "",
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${id}` }, () => {
        // Simple reload logic for states if conversation changes
        loadData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'suggestions', filter: `conversation_id=eq.${id}` }, () => {
        // Reload to show the new suggestion widget
        loadData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'escalations', filter: `conversation_id=eq.${id}` }, () => {
        // Reload to show the new escalation banner
        loadData();
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [id]);

  const handleAction = async (action: string, content?: string) => {
    setIsProcessing(true);
    
    try {
      if (action === "approve" || action === "edit") {
        if (!activeSuggestion) throw new Error("No hay sugerencia activa");

        // Optimistic UI Component updates managed globally by the realtime now,
        // but we can hide the suggestion box immediately
        setSuggestionState("handled");
        
        const reqBody = {
          suggestion_id: activeSuggestion.id,
          action: action,
          ...(content && { edited_content: content })
        };

        const { error } = await supabase.functions.invoke('suggestion-actions', {
          body: reqBody
        });

        if (error) throw error;
        toast({ type: "success", message: "Respuesta en proceso de envío." });
      
      } else if (action === "reject") {
        if (!activeSuggestion) return;
        setSuggestionState("handled");
        const { error } = await supabase.functions.invoke('suggestion-actions', {
          body: { suggestion_id: activeSuggestion.id, action: "reject" }
        });
        
        if (error) throw error;
        toast({ type: "info", message: "Borrador descartado. Puedes escribir directamente." });
      
      } else if (action === "reply") {
        setSuggestionState("handled");
        
        // MVP: Insert message manually as owner to trigger Webhook or standard process later
        const { error } = await supabase.from('messages').insert({
          conversation_id: id,
          sender_type: 'owner',
          direction: 'outbound',
          content: content || "",
          status: 'sent'
        });

        if (error) throw error;
        toast({ type: "success", message: "Respuesta manual enviada correctamente." });
        
        // Also close escalation
        if (activeEscalation) {
           await supabase.from('escalations').update({ status: 'attended' }).eq('id', activeEscalation.id);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({ type: "error", message: `Error al procesar: ${err.message || 'Desconocido'}` });
      // Revert if error
      if (activeSuggestion && ["approve", "edit", "reject"].includes(action)) setSuggestionState("active");
      if (activeEscalation && action === "reply") setSuggestionState("escalated");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex w-full h-full flex-col bg-(--surface-background) relative overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-(--surface-border) bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shrink-0 px-2 sm:px-4 z-10 sticky top-0">
        <button
          onClick={() => router.push("/dashboard/conversations")}
          className="mr-2 rounded-full p-2 text-(--text-secondary) hover:bg-(--surface-muted) hover:text-(--text-primary) transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={clientData.name} size="sm" className="mr-3" />
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-(--text-primary)">{clientData.name}</span>
          <span className="text-xs text-(--text-tertiary)">{clientData.phone || "Sin teléfono visible"}</span>
        </div>
        <button className="rounded-full p-2 text-(--text-secondary) hover:bg-(--surface-muted) transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 py-6 pb-[200px] sm:pb-[220px]">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            id={m.id}
            sender={m.sender}
            content={m.content}
            time={m.time}
            clientName={clientData.name}
          />
        ))}
      </div>

      {/* Bottom Fixed Action Area */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-(--surface-background) via-(--surface-background) to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-end w-full h-full pointer-events-auto">
          
          {suggestionState === "active" && activeSuggestion && (
            <AgentSuggestionWidget
              suggestionContent={activeSuggestion.content}
              onApprove={() => handleAction("approve")}
              onEdit={(text) => handleAction("edit", text)}
              onReject={() => handleAction("reject")}
              isProcessing={isProcessing}
            />
          )}

          {suggestionState === "escalated" && activeEscalation && (
            <div className="w-full bg-white rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] p-4 border border-(--surface-border)">
              <EscalationBannerWidget
                type={`escalated_${activeEscalation.level}` as EscalationType}
                reason={activeEscalation.reason}
                onSendDirect={(text) => handleAction("reply", text)}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {suggestionState === "handled" && (
            <div className="w-full bg-white border border-(--surface-border-strong) rounded-full flex items-center p-1 shadow-md focus-within:ring-2 focus-within:ring-(--color-primary-700)">
              <input 
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent border-none px-4 py-3 h-[48px] text-[15px] focus:outline-none"
                onClick={() => toast({type: "info", message: "Integración programada para el siguiente bloque"})}
              />
              <Button className="rounded-full h-10 w-10 p-0 shrink-0 ml-1 bg-(--text-tertiary)">
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
