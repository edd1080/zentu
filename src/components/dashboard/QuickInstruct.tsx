"use client";

import * as React from "react";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { InputPanel } from "./InputPanel";
import { ProposalCard, type Proposal, type ConflictingItem } from "./ProposalCard";

interface QuickInstructProps {
  className?: string;
  businessId?: string;
  onSuccess?: () => void;
}

export function QuickInstruct({ businessId, onSuccess }: QuickInstructProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [proposal, setProposal] = React.useState<Proposal | null>(null);
  const [conflictingItems, setConflictingItems] = React.useState<ConflictingItem[]>([]);
  const [replaceMode, setReplaceMode] = React.useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const resolveBusinessId = async (): Promise<string | null> => {
    if (businessId) return businessId;
    const { data } = await supabase.from('businesses').select('id').single();
    return data?.id ?? null;
  };

  const processInstruction = async (content: string, files: File[]) => {
    setIsProcessing(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("No hay sesión activa. Cierra sesión y vuelve a entrar.");

      const targetBusinessId = await resolveBusinessId();
      if (!targetBusinessId) throw new Error("No se encontró un negocio activo.");

      const payload = {
        content: content + (files.length > 0 ? ` [Archivos adjuntos: ${files.map(f => f.name).join(', ')}]` : ''),
        type: files.length > 0 ? (files[0].type.includes('pdf') ? 'pdf' : 'image') : 'text',
        business_id: targetBusinessId,
      };

      const { data, error } = await supabase.functions.invoke('process-quick-instruct', { body: payload });

      if (error) {
        let errorMsg = error.message || 'Error desconocido';
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            errorMsg = body?.message || body?.error || errorMsg;
          }
        } catch (_) { /* ignore */ }
        throw new Error(errorMsg);
      }
      if (data?.error) throw new Error(data.message || data.error);
      if (!data?.proposal) throw new Error("La IA no generó una propuesta válida");

      setProposal(data.proposal);

      // Check for conflicting items in same topic+layer (non-critical)
      try {
        const { data: topic } = await supabase
          .from('competency_topics').select('id')
          .eq('business_id', targetBusinessId).eq('name', data.proposal.topic).single();
        if (topic) {
          const { data: existing } = await supabase
            .from('knowledge_items').select('id, content, layer')
            .eq('business_id', targetBusinessId).eq('topic_id', topic.id)
            .eq('layer', data.proposal.layer).eq('active', true);
          setConflictingItems(existing || []);
        }
      } catch (_) { /* ignore */ }

    } catch (err: any) {
      toast({ type: "error", message: "Error al procesar la instrucción: " + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmInstruction = async () => {
    if (!proposal) return;
    setIsProcessing(true);
    try {
      const targetBusinessId = await resolveBusinessId();
      const { error } = await supabase.functions.invoke('confirm-instruction', {
        body: { proposed_item: proposal, business_id: targetBusinessId, replace_previous: replaceMode },
      });
      if (error) throw error;
      toast({ type: "success", message: "¡Entendido! He aprendido algo nuevo." });
      reset();
      onSuccess?.();
    } catch (err: any) {
      toast({ type: "error", message: "No pude guardar la instrucción: " + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setProposal(null);
    setConflictingItems([]);
    setReplaceMode(false);
    setIsProcessing(false);
  };

  if (proposal) {
    return (
      <ProposalCard
        proposal={proposal}
        conflictingItems={conflictingItems}
        replaceMode={replaceMode}
        isProcessing={isProcessing}
        onReplaceMode={setReplaceMode}
        onConfirm={confirmInstruction}
        onCorrect={reset}
      />
    );
  }

  return <InputPanel isProcessing={isProcessing} onSubmit={processInstruction} />;
}
