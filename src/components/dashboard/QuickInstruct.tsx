"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Mic, Paperclip, ArrowUp, Square } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

const placeholders = [
  "Ej. Mañana cerramos a las 3 PM...",
  "Ej. El combo trae papas grandes...",
  "Ej. No hay reservaciones para hoy...",
];

export function QuickInstruct() {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [placeholderIdx, setPlaceholderIdx] = React.useState(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isExpanded) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isExpanded]);

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
    // Timeout needed for the transition to finish before focusing cursor properly
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 50);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only collapse if empty and not interacting with controls
    if (!content && !e.currentTarget.contains(e.relatedTarget)) {
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
    setContent("Esta es una transcripción simulada de lo que dictaste.");
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleSend = () => {
    if (!content.trim()) return;
    
    // Simulate sending to backend
    toast({
      type: "success",
      message: "Listo. Tu agente usará esta información desde ahora.",
    });
    
    setContent("");
    setIsExpanded(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
            {/* Visualizer simulation */}
            <div className="flex items-center gap-1 h-6">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="w-1 bg-(--color-primary-500) rounded-full animate-pulse" style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDelay: `${i * 100}ms` }}></div>
               ))}
            </div>
            <button 
              onClick={stopRecording}
              className="ml-4 h-10 w-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            placeholder={isExpanded ? "Escribe lo que quieres enseñarle a tu agente..." : placeholders[placeholderIdx]}
            className={cn(
              "w-full resize-none bg-transparent px-3 py-3 text-base text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none",
              isExpanded ? "h-[70px]" : "h-[42px] overflow-hidden whitespace-nowrap"
            )}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
          />
        )}
      </div>

      {!isRecording && (
        <div className={cn(
          "flex items-center justify-between px-2 pb-2 pt-0 transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-100 absolute right-1 top-[5px]"
        )}>
          {/* Left tools - hidden when collapsed */}
          <div className={cn("flex items-center gap-1", !isExpanded && "hidden")}>
            <button 
              className="p-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-muted) rounded-lg transition-colors"
              title="Adjuntar archivo o enlace"
              type="button"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>
          
          {/* Right tools */}
          <div className="flex items-center gap-2 ml-auto">
            {!isExpanded && (
              <button 
                className="p-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-muted) rounded-lg transition-colors"
                onClick={startRecording}
                type="button"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
            {isExpanded && (
              <span className="text-xs text-(--text-tertiary) mr-2">
                {content.length}/500
              </span>
            )}
            <button
              onClick={handleSend}
              disabled={!content.trim()}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                content.trim() 
                  ? "bg-(--color-primary-700) text-white hover:bg-(--color-primary-800)" 
                  : "bg-(--surface-muted) text-(--text-disabled)",
                !isExpanded && "hidden" // Hide send button when collapsed, rely on click to expand
              )}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
