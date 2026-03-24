"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { MessageSenderType } from "@/components/dashboard/MessageBubble";

export type Msg = { id: string; sender: MessageSenderType; content: string; time: string };
export type SuggestionState = "active" | "escalated" | "handled";

function toMsg(m: any): Msg {
  return {
    id: m.id,
    sender: (m.sender_type === "system" ? "agent" : m.sender_type) as MessageSenderType,
    content: m.content || "",
    time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export function useThreadData(id: string) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [suggestionState, setSuggestionState] = React.useState<SuggestionState>("handled");
  const [activeSuggestion, setActiveSuggestion] = React.useState<any>(null);
  const [dismissedSuggestion, setDismissedSuggestion] = React.useState<any>(null);
  const [activeEscalation, setActiveEscalation] = React.useState<any>(null);
  const [clientData, setClientData] = React.useState({ name: "Cargando...", phone: "" });
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    let channel: any;
    const loadData = async () => {
      const { data: conv } = await supabase.from("conversations").select("client_name, client_phone, status").eq("id", id).single();
      if (conv) setClientData({ name: conv.client_name || "Cliente", phone: conv.client_phone || "" });
      const { data: msgs } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true });
      if (msgs) setMessages(msgs.map(toMsg));
      if (conv?.status === "pending_approval") {
        const { data: sugg } = await supabase.from("suggestions").select("*").eq("conversation_id", id).eq("status", "pending").order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (sugg) { setActiveSuggestion(sugg); setSuggestionState("active"); }
      } else if (conv?.status?.startsWith("escalated")) {
        const { data: esc } = await supabase.from("escalations").select("*").eq("conversation_id", id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (esc) { setActiveEscalation(esc); setSuggestionState("escalated"); }
      } else { setSuggestionState("handled"); }
    };
    loadData();
    channel = supabase.channel(`thread_${id}_${Date.now()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` }, (p: any) => {
        setMessages(prev => prev.find(x => x.id === p.new.id) ? prev : [...prev, toMsg(p.new)]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations", filter: `id=eq.${id}` }, async (p: any) => {
        // Only update conversation status without refetching messages
        const conv = p.new;
        if (conv.client_name || conv.client_phone) {
          setClientData({ name: conv.client_name || "Cliente", phone: conv.client_phone || "" });
        }
        if (conv.status === "pending_approval") {
          const { data: sugg } = await supabase.from("suggestions").select("*").eq("conversation_id", id).eq("status", "pending").order("created_at", { ascending: false }).limit(1).maybeSingle();
          if (sugg) { setActiveSuggestion(sugg); setSuggestionState("active"); }
        } else if (conv.status?.startsWith("escalated")) {
          const { data: esc } = await supabase.from("escalations").select("*").eq("conversation_id", id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
          if (esc) { setActiveEscalation(esc); setSuggestionState("escalated"); }
        } else {
          setSuggestionState("handled");
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "suggestions", filter: `conversation_id=eq.${id}` }, async (p: any) => {
        if (p.new.status === "pending") {
          setActiveSuggestion(p.new);
          setSuggestionState("active");
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "escalations", filter: `conversation_id=eq.${id}` }, (p: any) => {
        setActiveEscalation(p.new);
        setSuggestionState("escalated");
      })
      .subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [id]);

  const auth = async () => ({ Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` });

  const handleAction = async (action: string, content?: string) => {
    setIsProcessing(true);
    try {
      const headers = await auth();
      if (action === "approve" || action === "edit") {
        if (!activeSuggestion) throw new Error("No hay sugerencia activa");
        setSuggestionState("handled");
        const { error } = await supabase.functions.invoke("suggestion-actions", { body: { suggestion_id: activeSuggestion.id, action, ...(content && { edited_content: content }) }, headers });
        if (error) throw error;
        toast({ type: "success", message: "Respuesta en proceso de envío." });
      } else if (action === "reject") {
        if (!activeSuggestion) return;
        setDismissedSuggestion(activeSuggestion); setSuggestionState("handled");
        const { error } = await supabase.functions.invoke("suggestion-actions", { body: { suggestion_id: activeSuggestion.id, action: "reject" }, headers });
        if (error) throw error;
        toast({ type: "info", message: "Borrador descartado. Puedes escribir directamente." });
      } else if (action === "attend_escalation") {
        if (!activeEscalation) return;
        setSuggestionState("handled");
        const { error } = await supabase.functions.invoke("suggestion-actions", { body: { conversation_id: id, action: "attend_escalation" }, headers });
        if (error) throw error;
        toast({ type: "success", message: "Ahora tienes el control manual de esta conversación." });
      } else if (action === "reply") {
        setSuggestionState("handled");
        const { error } = await supabase.functions.invoke("send-message", { body: { conversation_id: id, content: content || "", sender_type: "owner" }, headers });
        if (error) throw error;
        toast({ type: "success", message: "Respuesta manual enviada correctamente." });
        if (activeEscalation) await supabase.from("escalations").update({ status: "attended" }).eq("id", activeEscalation.id);
      }
    } catch (err: any) {
      toast({ type: "error", message: `Error al procesar: ${err.message || "Desconocido"}` });
      if (activeSuggestion && ["approve", "edit", "reject"].includes(action)) setSuggestionState("active");
      if (activeEscalation && action === "reply") setSuggestionState("escalated");
    } finally { setIsProcessing(false); }
  };

  const handleConversationAction = async (action: "resolve" | "archive") => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from("conversations").update({ status: action === "resolve" ? "resolved" : "archived", ...(action === "resolve" ? { resolved_by: "owner_manual" } : {}) }).eq("id", id);
      if (error) throw error;
      toast({ type: "success", message: action === "resolve" ? "Conversación marcada como resuelta." : "Conversación archivada." });
      router.push("/dashboard/conversations");
    } catch (err: any) {
      toast({ type: "error", message: `Error: ${err.message || "Desconocido"}` });
    } finally { setIsProcessing(false); }
  };

  return { messages, clientData, suggestionState, setSuggestionState, activeSuggestion, setActiveSuggestion, dismissedSuggestion, setDismissedSuggestion, activeEscalation, isProcessing, handleAction, handleConversationAction };
}
