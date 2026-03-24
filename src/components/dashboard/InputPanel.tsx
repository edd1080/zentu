"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "./useVoiceRecorder";
import { Icon } from "@/components/ui/Icon";

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
  const [content, setContent] = React.useState("");
  const [placeholderIdx, setPlaceholderIdx] = React.useState(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [attachedFiles, setAttachedFiles] = React.useState<FileAttachment[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const wasProcessingRef = React.useRef(false);

  const { startRecording, stopRecording } = useVoiceRecorder({ onSubmit, onStart: () => setIsRecording(true), onStop: () => { setIsRecording(false); setRecordingTime(0); } });

  React.useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx(p => (p + 1) % PLACEHOLDERS.length), 4000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!isRecording) { setRecordingTime(0); return; }
    const id = setInterval(() => setRecordingTime(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  React.useEffect(() => {
    if (isProcessing) { wasProcessingRef.current = true; return; }
    if (wasProcessingRef.current) {
      wasProcessingRef.current = false;
      setContent("");
      setAttachedFiles([]);
    }
  }, [isProcessing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => { const b64 = (reader.result as string).split(",")[1]; setAttachedFiles(prev => [...prev, { file, base64: b64, mimeType: file.type }]); };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    if (!content.trim() && attachedFiles.length === 0) return;
    if (attachedFiles.length > 0) {
      const f = attachedFiles[0];
      onSubmit({ type: f.mimeType === "application/pdf" ? "pdf" : "image_ocr", fileBase64: f.base64, mimeType: f.mimeType, content: content.trim() || undefined });
    } else { onSubmit({ type: "text", content: content.trim() }); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const canSend = (content.trim().length > 0 || attachedFiles.length > 0) && !isProcessing;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col gap-2 focus-within:ring-4 focus-within:ring-[#3DC185]/10 focus-within:border-[#3DC185] transition-all shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
      {isRecording ? (
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-medium text-slate-700">Grabando... {fmt(recordingTime)}</span>
          </div>
          <button onClick={stopRecording} className="h-9 w-9 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
            <Icon name="solar:stop-linear" size={16} />
          </button>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={2}
          placeholder={PLACEHOLDERS[placeholderIdx]}
          className="w-full bg-transparent border-none focus:ring-0 px-2 pt-2 text-sm resize-none placeholder:text-slate-400 leading-relaxed outline-none"
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isProcessing}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />
      )}

      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2">
          {attachedFiles.map((fa, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
              <span className="text-xs font-medium text-slate-600 truncate max-w-[150px]">{fa.file.name}</span>
              <button onClick={() => setAttachedFiles(p => p.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-slate-700">
                <Icon name="solar:close-circle-linear" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-1">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,application/pdf" />
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors active:scale-95" onClick={() => fileInputRef.current?.click()} disabled={isProcessing} title="Adjuntar archivo">
            <Icon name="solar:paperclip-linear" size={18} />
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors active:scale-95" onClick={startRecording} disabled={isProcessing} title="Grabar nota de voz">
            <Icon name="solar:microphone-2-linear" size={18} />
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!canSend}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95",
            canSend ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          Enviar
          <Icon name="solar:arrow-up-linear" size={16} />
        </button>
      </div>
    </div>
  );
}
