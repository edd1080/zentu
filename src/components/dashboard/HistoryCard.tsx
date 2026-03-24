"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export interface HistoryItem {
  id: string;
  content: string;
  topic_name: string | null;
  layer: string;
  source_type: string | null;
  created_at: string;
  active: boolean;
}

export const LAYER_LABELS: Record<string, { label: string; cls: string }> = {
  structured:  { label: "Dato fijo",   cls: "text-blue-700 bg-blue-50 border border-blue-100"         },
  operational: { label: "Política",    cls: "text-amber-700 bg-amber-50 border border-amber-100"      },
  narrative:   { label: "Descriptivo", cls: "text-violet-700 bg-violet-50 border border-violet-100"   },
  learned:     { label: "Aprendido",   cls: "text-emerald-700 bg-emerald-50 border border-emerald-100" },
};

const SOURCE_META: Record<string, { icon: string; label: string; cls: string }> = {
  quick_instruct: { icon: "solar:keyboard-linear",              label: "Texto",     cls: "text-blue-600 bg-blue-50 border-blue-100"   },
  text:           { icon: "solar:keyboard-linear",              label: "Texto",     cls: "text-blue-600 bg-blue-50 border-blue-100"   },
  voice_note:     { icon: "solar:microphone-2-linear",          label: "Voz",       cls: "text-purple-600 bg-purple-50 border-purple-100" },
  voice:          { icon: "solar:microphone-2-linear",          label: "Voz",       cls: "text-purple-600 bg-purple-50 border-purple-100" },
  image_ocr:      { icon: "solar:gallery-minimalistic-linear",  label: "Imagen",    cls: "text-amber-600 bg-amber-50 border-amber-100"  },
  image:          { icon: "solar:gallery-minimalistic-linear",  label: "Imagen",    cls: "text-amber-600 bg-amber-50 border-amber-100"  },
  pdf:            { icon: "solar:document-text-linear",         label: "Documento", cls: "text-slate-600 bg-slate-50 border-slate-200" },
};

interface HistoryCardProps {
  item: HistoryItem;
  toggling: boolean;
  onToggle: (item: HistoryItem) => void;
  formatDate: (dateStr: string) => string;
}

export function HistoryCard({ item, toggling, onToggle, formatDate }: HistoryCardProps) {
  const src = SOURCE_META[item.source_type || "quick_instruct"] ?? SOURCE_META.quick_instruct;
  const layer = LAYER_LABELS[item.layer];

  return (
    <div className={cn(
      "bg-white border rounded-2xl p-4 flex flex-col gap-3 transition-all hover:border-slate-300/80 hover:shadow-md group",
      item.active ? "border-slate-200/80" : "bg-slate-50/50 border-slate-200/60 opacity-70 hover:opacity-100"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {layer && (
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border", layer.cls)}>
                {layer.label}
              </span>
            )}
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border inline-flex items-center gap-1", src.cls)}>
              <Icon name={src.icon} size={9} />
              {src.label}
            </span>
            {!item.active && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border text-red-600 bg-red-50 border-red-100">
                Inactiva
              </span>
            )}
          </div>
          {item.topic_name && (
            <span className="text-xs font-medium text-slate-600 truncate">{item.topic_name}</span>
          )}
        </div>

        {/* Custom toggle switch */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5" title={item.active ? "Desactivar" : "Activar"}>
          <input type="checkbox" className="sr-only peer" checked={item.active} onChange={() => onToggle(item)} disabled={toggling} />
          <div className={cn(
            "w-9 h-5 rounded-full transition-colors peer-focus:outline-none",
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all after:shadow-sm",
            "peer-checked:after:translate-x-4",
            item.active ? "bg-[#3DC185]" : "bg-slate-200"
          )} />
        </label>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{item.content}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">{formatDate(item.created_at)}</span>
        {toggling && <Icon name="solar:refresh-linear" size={13} className="text-slate-400 animate-spin" />}
      </div>
    </div>
  );
}
