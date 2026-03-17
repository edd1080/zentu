"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Mic, Paperclip, ArrowUp, Square, X, Loader2, Check, Brain, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const placeholders = [
  "Ej. Mañana cerramos a las 3 PM...",
  "Ej. El combo trae papas grandes...",
  "Ej. No hay reservaciones para hoy...",
];

interface Proposal {
  content: string;
  layer: 'structured' | 'operational' | 'learned' | 'narrative';
  topic: string;
  justification: string;
}

interface QuickInstructProps {
  className?: string;
  businessId?: string;
  onSuccess?: () => void;
}

export function QuickInstruct({ className, businessId, onSuccess }: QuickInstructProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [placeholderIdx, setPlaceholderIdx] = React.useState(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [proposal, setProposal] = React.useState<Proposal | null>(null);
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  React.useEffect(() => {
    if (isExpanded || proposal) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isExpanded, proposal]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleFocus = () => {
    setIsExpanded(true);
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 50);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!content && attachedFiles.length === 0 && !proposal && !e.currentTarget.contains(e.relatedTarget)) {
      setIsExpanded(false);
      setIsRecording(false);
    }
  };

  const startRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRecording(true);
    setIsExpanded(true);
  };

  const stopRecording = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsRecording(false);
    // In a real app, logic to get transcription would go here
    setContent("Esta es una transcripción simulada de lo que dictaste.");
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      setIsExpanded(true);
    }
  };

  const removeFile = (idx: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const processInstruction = async () => {
    if (!content.trim() && attachedFiles.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // 1. Verify we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("AGENTI: No hay sesión activa:", sessionError?.message);
        throw new Error("No hay sesión activa. Cierra sesión y vuelve a entrar.");
      }
      
      console.log("AGENTI: Sesión activa, token length:", session.access_token.length);
      
      // 2. Resolve businessId
      let targetBusinessId = businessId;
      if (!targetBusinessId) {
        const { data: business } = await supabase.from('businesses').select('id').single();
        targetBusinessId = business?.id;
      }

      if (!targetBusinessId) throw new Error("No se encontró un negocio activo (businessId missing)");
      
      console.log("AGENTI: invocando process-quick-instruct con business_id:", targetBusinessId);

      const payload = {
        content: content + (attachedFiles.length > 0 ? ` [Archivos adjuntos: ${attachedFiles.map(f => f.name).join(', ')}]` : ''),
        type: attachedFiles.length > 0 ? (attachedFiles[0].type.includes('pdf') ? 'pdf' : 'image') : 'text',
        business_id: targetBusinessId
      };

      const { data, error } = await supabase.functions.invoke('process-quick-instruct', {
        body: payload
      });

      console.log("AGENTI: Respuesta de Edge Function - data:", JSON.stringify(data), "error:", error);

      if (error) {
        console.error("AGENTI: Error al invocar Edge Function:", error);
        // Try to extract body from FunctionsHttpError
        let errorMsg = error.message || 'Error desconocido';
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            console.error("AGENTI: Error body:", body);
            errorMsg = body?.message || body?.error || errorMsg;
          }
        } catch (_) { /* ignore parse error */ }
        throw new Error(errorMsg);
      }
      
      // Check if the response data contains an error field
      if (data && data.error) {
        console.error("AGENTI: Edge Function returned error in payload:", data);
        throw new Error(data.message || data.error);
      }

      if (!data || !data.proposal) {
        console.error("AGENTI: Respuesta inesperada, sin proposal:", data);
        throw new Error("La IA no generó una propuesta válida");
      }

      setProposal(data.proposal);
      
    } catch (err: any) {
      console.error("AGENTI: Error final:", err);
      toast({
        type: "error",
        message: "Error al procesar la instrucción: " + err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmInstruction = async () => {
    if (!proposal) return;
    setIsProcessing(true);

    try {
      
      const { error } = await supabase.functions.invoke('confirm-instruction', {
        body: {
          proposed_item: proposal,
          business_id: businessId || (await supabase.from('businesses').select('id').single()).data?.id
        }
      });

      if (error) throw error;

      toast({
        type: "success",
        message: "¡Entendido! He aprendido algo nuevo.",
      });

      reset();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast({
        type: "error",
        message: "No pude guardar la instrucción: " + err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setContent("");
    setAttachedFiles([]);
    setProposal(null);
    setIsExpanded(false);
    setIsProcessing(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 1. Initial State
  if (!proposal) {
    return (
      <div 
        className={cn(
          "relative flex flex-col w-full bg-white border border-(--surface-border-strong) rounded-2xl transition-all duration-200 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-(--color-primary-700) focus-within:border-transparent",
          isExpanded ? "min-h-[120px]" : "h-[52px]"
        )}
        onBlur={handleBlur}
        tabIndex={-1}
      >
        <div className="flex flex-1 p-1">
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between pl-4 pr-1 text-(--text-primary)">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-medium">Escuchando... {formatTime(recordingTime)}</span>
              </div>
              <button 
                onClick={stopRecording}
                className="ml-4 h-10 w-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <textarea
                ref={textareaRef}
                placeholder={isExpanded ? "Escribe lo que quieres enseñarle a tu agente..." : placeholders[placeholderIdx]}
                className={cn(
                  "w-full resize-none bg-transparent px-3 py-3 text-base text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none",
                  isExpanded ? "min-h-[70px]" : "h-[42px] overflow-hidden whitespace-nowrap"
                )}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={handleFocus}
                disabled={isProcessing}
              />
              
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-(--surface-muted) px-2 py-1 rounded-md border border-(--surface-border)">
                      <span className="text-xs font-medium text-(--text-secondary) truncate max-w-[150px]">{file.name}</span>
                      <button onClick={() => removeFile(i)} className="text-(--text-tertiary) hover:text-(--text-primary)">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!isRecording && (
          <div className={cn(
            "flex items-center justify-between px-2 pb-2 pt-0 transition-opacity duration-200",
            isExpanded ? "opacity-100" : "opacity-100 absolute right-1 top-[5px]"
          )}>
            <div className={cn("flex items-center gap-1", !isExpanded && "hidden")}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept="image/*,application/pdf"
              />
              <button 
                className="p-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-muted) rounded-lg transition-colors"
                title="Adjuntar archivo o enlace"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              {!isExpanded && (
                <button 
                  className="p-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-muted) rounded-lg transition-colors"
                  onClick={startRecording}
                  type="button"
                  disabled={isProcessing}
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}
              {isExpanded && !isProcessing && (
                <span className="text-xs text-(--text-tertiary) mr-2">
                  {content.length}/500
                </span>
              )}
              <button
                onClick={processInstruction}
                disabled={(!content.trim() && attachedFiles.length === 0) || isProcessing}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                  (content.trim() || attachedFiles.length > 0)
                    ? "bg-(--color-primary-700) text-white hover:bg-(--color-primary-800)" 
                    : "bg-(--surface-muted) text-(--text-disabled)",
                  !isExpanded && "hidden"
                )}
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Proposal State (Confirmation)
  return (
    <div className="w-full bg-white border border-(--color-primary-200) rounded-2xl shadow-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2 mb-3 text-(--color-primary-700)">
        <Brain className="h-5 w-5" />
        <h3 className="font-semibold text-lg italic font-display">¿Entendí bien?</h3>
      </div>
      
      <div className="bg-(--color-primary-50) rounded-xl p-4 border border-(--color-primary-100) mb-4">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-(--color-primary-700) bg-white px-2 py-0.5 rounded border border-(--color-primary-200)">
                {proposal.topic}
            </span>
            <span className="text-xs text-(--text-tertiary)">{proposal.layer}</span>
        </div>
        <p className="text-(--text-primary) text-base leading-relaxed">
            {proposal.content}
        </p>
        <div className="mt-3 pt-3 border-t border-(--color-primary-200)/30 flex items-start gap-2">
            <Info className="h-4 w-4 text-(--color-primary-600) shrink-0 mt-0.5" />
            <p className="text-xs text-(--text-secondary) italic">
                {proposal.justification}
            </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button 
            className="flex-1 h-12 rounded-xl text-base font-semibold"
            onClick={confirmInstruction}
            disabled={isProcessing}
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
          Sí, guárdalo
        </Button>
        <button 
            className="h-12 px-4 rounded-xl text-(--text-secondary) hover:bg-(--surface-muted) transition-colors font-medium text-sm"
            onClick={() => setProposal(null)}
            disabled={isProcessing}
        >
          Corregir
        </button>
      </div>
    </div>
  );
}
