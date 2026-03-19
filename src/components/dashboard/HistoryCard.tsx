"use client";

import { cn } from "@/lib/utils";
import { FileText, Volume2, Image as ImageIcon, Brain, Loader2, RotateCcw, Ban } from "lucide-react";

export interface HistoryItem {
  id: string;
  content: string;
  topic_name: string | null;
  layer: string;
  source_type: string | null;
  created_at: string;
  active: boolean;
}

export const LAYER_LABELS: Record<string, string> = {
  structured:  'Dato fijo',
  operational: 'Política',
  narrative:   'Descriptivo',
  learned:     'Aprendido',
};

interface HistoryCardProps {
  item: HistoryItem;
  toggling: boolean;
  onToggle: (item: HistoryItem) => void;
  formatDate: (dateStr: string) => string;
}

export function HistoryCard({ item, toggling, onToggle, formatDate }: HistoryCardProps) {
  return (
    <div className={cn(
      "bg-white border rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-all",
      item.active ? "border-(--surface-border-strong)" : "border-dashed border-(--surface-border) opacity-55"
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TypeIcon type={item.source_type || 'quick_instruct'} />
          <span className="text-xs font-semibold text-(--text-secondary) truncate">{item.topic_name}</span>
          <span className="text-[10px] text-(--text-disabled) shrink-0">·</span>
          <span className="text-xs text-(--text-tertiary) shrink-0">{formatDate(item.created_at)}</span>
        </div>
        {!item.active && (
          <span className="shrink-0 bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wide">
            Inactiva
          </span>
        )}
      </div>

      <p className="text-sm text-(--text-primary) leading-relaxed">{item.content}</p>

      <div className="flex items-center justify-between pt-2 border-t border-(--surface-border)">
        <span className="text-[10px] font-bold uppercase tracking-widest text-(--text-disabled)">
          {LAYER_LABELS[item.layer] || item.layer}
        </span>
        <button
          onClick={() => onToggle(item)}
          disabled={toggling}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50",
            item.active ? "text-red-500 hover:bg-red-50" : "text-(--color-primary-700) hover:bg-(--color-primary-50)"
          )}
        >
          {toggling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : item.active ? (
            <><Ban className="h-3.5 w-3.5" /> Desactivar</>
          ) : (
            <><RotateCcw className="h-3.5 w-3.5" /> Reactivar</>
          )}
        </button>
      </div>
    </div>
  );
}

function TypeIcon({ type }: { type: string }) {
  const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    quick_instruct: { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: <FileText  className="h-3 w-3" /> },
    text:           { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: <FileText  className="h-3 w-3" /> },
    voice_note:     { bg: 'bg-purple-50', text: 'text-purple-600', icon: <Volume2   className="h-3 w-3" /> },
    voice:          { bg: 'bg-purple-50', text: 'text-purple-600', icon: <Volume2   className="h-3 w-3" /> },
    image_ocr:      { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: <ImageIcon className="h-3 w-3" /> },
    image:          { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: <ImageIcon className="h-3 w-3" /> },
  };
  const s = map[type] ?? { bg: 'bg-gray-50', text: 'text-gray-500', icon: <Brain className="h-3 w-3" /> };
  return (
    <div className={cn("h-5 w-5 rounded flex items-center justify-center shrink-0", s.bg, s.text)}>
      {s.icon}
    </div>
  );
}
