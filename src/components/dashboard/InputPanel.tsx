"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Mic, Paperclip, ArrowUp, Square, X, Loader2 } from "lucide-react";
import { useVoiceRecorder } from "./useVoiceRecorder";

const PLACEHOLDERS = [
  "Ej. Mañana cerramos a las 3 PM...",
  "Ej. El combo trae papas grandes...",
  "Ej. No hay reservaciones para hoy...",
];

export interface FileAttachment {
  file: File;
  base64: string;
  mimeType: string;
}

export type QuickInstructPayload =
  | { type: "text"; content: string; files?: FileAttachment[] }
  | { type: "voice_note"; audioBase64: string; mimeType: string }
  | { type: "image_ocr"; fileBase64: string; mimeType: string; content?: string }
  | { type: "pdf"; fileBase64: string; mimeType: string; content?: string };

interface InputPanelProps {
  isProcessing: boolean;
  onSubmit: (payload: QuickInstructPayload) => void;
}

export function InputPanel({ isProcessing, onSubmit }: InputPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [placeholderIdx, setPlaceholderIdx] = React.useState(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [attachedFiles, setAttachedFiles] = React.useState<FileAttachment[]>([]);
  const [loadingFileNames, setLoadingFileNames] = React.useState<string[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const wasProcessingRef = React.useRef(false);

  const { startRecording, stopRecording } = useVoiceRecorder({
    onSubmit,
    onStart: () => { setIsRecording(true); setIsExpanded(true); },
    onStop: () => { setIsRecording(false); setIsExpanded(false); },
  });

  React.useEffect(() => {
    if (isExpanded) return;
    const id = setInterval(() => setPlaceholderIdx(p => (p + 1) % PLACEHOLDERS.length), 4000);
    return () => clearInterval(id);
  }, [isExpanded]);
  React.useEffect(() => {
    if (!isRecording) { setRecordingTime(0); return; }
    const id = setInterval(() => setRecordingTime(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // Collapse and reset only after processing finishes (not immediately on submit)
  React.useEffect(() => {
    if (isProcessing) { wasProcessingRef.current = true; return; }
    if (wasProcessingRef.current) {
      wasProcessingRef.current = false;
      setContent("");
      setAttachedFiles([]);
      setLoadingFileNames([]);
      setIsExpanded(false);
    }
  }, [isProcessing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      setLoadingFileNames(prev => [...prev, file.name]);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        setAttachedFiles(prev => [...prev, { file, base64, mimeType: file.type }]);
        setLoadingFileNames(prev => prev.filter(n => n !== file.name));
      };
      reader.readAsDataURL(file);
    });
    setIsExpanded(true);
  };
  const handleFocus = () => { setIsExpanded(true); setTimeout(() => textareaRef.current?.focus(), 50); };
  const handleBlur = (e: React.FocusEvent) => {
    if (!content && attachedFiles.length === 0 && loadingFileNames.length === 0 && !isProcessing && !e.currentTarget.contains(e.relatedTarget)) { setIsExpanded(false); setIsRecording(false); }
  };
  const handleSubmit = () => {
    if (!content.trim() && attachedFiles.length === 0) return;
    if (attachedFiles.length > 0) {
      const first = attachedFiles[0];
      const type = first.mimeType === "application/pdf" ? "pdf" : "image_ocr";
      onSubmit({ type, fileBase64: first.base64, mimeType: first.mimeType, content: content.trim() || undefined });
    } else {
      onSubmit({ type: "text", content: content.trim() });
    }
    // content, attachedFiles y collapse se limpian cuando isProcessing vuelve a false
  };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></span>
              <span className="text-sm font-medium">Escuchando... {formatTime(recordingTime)}</span>
            </div>
            <button onClick={stopRecording} className="ml-4 h-10 w-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"><Square className="h-4 w-4 fill-current" /></button>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            <textarea
              ref={textareaRef}
              placeholder={isExpanded ? "Escribe lo que quieres enseñarle a tu agente..." : PLACEHOLDERS[placeholderIdx]}
              className={cn(
                "w-full resize-none bg-transparent px-3 py-3 text-base text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none",
                isExpanded ? "min-h-[70px]" : "h-[42px] overflow-hidden whitespace-nowrap"
              )}
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={handleFocus}
              disabled={isProcessing}
            />
            {(attachedFiles.length > 0 || loadingFileNames.length > 0) && (
              <div className="flex flex-wrap gap-2 px-3 pb-2">
                {loadingFileNames.map(name => (
                  <div key={`loading-${name}`} className="flex items-center gap-1.5 bg-(--surface-muted) px-2 py-1 rounded-md border border-(--surface-border) opacity-60">
                    <Loader2 className="h-3 w-3 animate-spin text-(--text-tertiary)" />
                    <span className="text-xs font-medium text-(--text-secondary) truncate max-w-[150px]">{name}</span>
                  </div>
                ))}
                {attachedFiles.map((fa, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-(--surface-muted) px-2 py-1 rounded-md border border-(--surface-border)">
                    <span className="text-xs font-medium text-(--text-secondary) truncate max-w-[150px]">{fa.file.name}</span>
                    <button onClick={() => setAttachedFiles(p => p.filter((_, idx) => idx !== i))} className="text-(--text-tertiary) hover:text-(--text-primary)"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!isRecording && (
        <div className={cn("flex items-center justify-between px-2 pb-2 pt-0", isExpanded ? "opacity-100" : "opacity-100 absolute right-1 top-[5px]")}>
          <div className={cn("flex items-center gap-1", !isExpanded && "hidden")}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,application/pdf" />
            <button className="p-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-muted) rounded-lg transition-colors" type="button" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}><Paperclip className="h-5 w-5" /></button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {!isExpanded && <button className="p-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-muted) rounded-lg transition-colors" onClick={e => { e.preventDefault(); startRecording(); }} type="button" disabled={isProcessing}><Mic className="h-5 w-5" /></button>}
            {isExpanded && !isProcessing && <span className="text-xs text-(--text-tertiary) mr-2">{content.length}/500</span>}
            <button onClick={handleSubmit} disabled={(!content.trim() && attachedFiles.length === 0) || isProcessing || loadingFileNames.length > 0} className={cn("flex h-9 w-9 items-center justify-center rounded-full transition-all", (content.trim() || attachedFiles.length > 0) ? "bg-(--color-primary-700) text-white hover:bg-(--color-primary-800)" : "bg-(--surface-muted) text-(--text-disabled)", !isExpanded && "hidden")}>
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
