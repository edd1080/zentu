"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

interface KnowledgeItem {
  id: string;
  content: string;
  layer: string;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  status: "strong" | "weak" | "partial";
  coverage_percentage: number;
  description?: string | null;
  is_default: boolean;
  knowledge_count: number;
  items?: KnowledgeItem[];
}

const LAYER_LABELS: Record<string, { label: string; cls: string }> = {
  structured:  { label: "Dato fijo",   cls: "text-blue-700 bg-blue-50 border border-blue-100"       },
  operational: { label: "Política",    cls: "text-amber-700 bg-amber-50 border border-amber-100"    },
  narrative:   { label: "Descriptivo", cls: "text-violet-700 bg-violet-50 border border-violet-100" },
  learned:     { label: "Aprendido",   cls: "text-emerald-700 bg-emerald-50 border border-emerald-100" },
};

interface TopicCardProps {
  topic: Topic;
  isExpanded: boolean;
  onClick: () => void;
}

export function TopicCard({ topic, isExpanded, onClick }: TopicCardProps) {
  const covered = topic.knowledge_count > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col bg-white border rounded-2xl text-left transition-all w-full p-4",
        isExpanded
          ? "border-[#3DC185]/40 ring-1 ring-[#3DC185]/10 shadow-sm"
          : covered
            ? "border-slate-200/80 hover:border-emerald-200 hover:shadow-sm"
            : "border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {covered ? (
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Icon name="solar:check-circle-bold" size={14} className="text-emerald-600" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
          )}
          <span className="text-sm font-medium text-slate-800 truncate">{topic.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {covered ? (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">
              {topic.knowledge_count} instr.
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">Sin cubrir</span>
          )}
          <Icon
            name={isExpanded ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
            size={14}
            className={cn("transition-colors", isExpanded ? "text-[#3DC185]" : "text-slate-400")}
          />
        </div>
      </div>

      {!isExpanded && topic.description && (
        <p className="text-xs text-slate-400 mt-1.5 ml-7.5 leading-relaxed line-clamp-1">{topic.description}</p>
      )}

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2 animate-in fade-in duration-150">
          {topic.items === undefined ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Icon name="solar:refresh-linear" size={12} className="animate-spin" />
              <span>Cargando...</span>
            </div>
          ) : topic.items.length === 0 ? (
            <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
              <Icon name="solar:info-circle-linear" size={14} className="shrink-0 mt-0.5" />
              <span>Sin instrucciones. Usa "Enseñar algo nuevo" para cubrir "{topic.name}".</span>
            </div>
          ) : (
            topic.items.map((item) => {
              const meta = LAYER_LABELS[item.layer] || { label: item.layer, cls: "text-slate-600 bg-slate-50" };
              return (
                <div key={item.id} className="flex flex-col gap-1.5 bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded w-fit", meta.cls)}>
                    {meta.label}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </button>
  );
}
