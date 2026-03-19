"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Brain,
  Loader2,
  BookOpen,
} from "lucide-react";

interface KnowledgeItem {
  id: string;
  content: string;
  layer: string;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  status: 'strong' | 'weak' | 'partial';
  coverage_percentage: number;
  description?: string | null;
  is_default: boolean;
  knowledge_count: number;
  items?: KnowledgeItem[];
}

const LAYER_LABELS: Record<string, { label: string; color: string }> = {
  structured:  { label: 'Dato fijo',   color: 'text-blue-600 bg-blue-50'    },
  operational: { label: 'Política',    color: 'text-violet-600 bg-violet-50' },
  narrative:   { label: 'Descriptivo', color: 'text-amber-600 bg-amber-50'   },
  learned:     { label: 'Aprendido',   color: 'text-emerald-600 bg-emerald-50' },
};

interface TopicCardProps {
  topic: Topic;
  isExpanded: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function TopicCard({ topic, isExpanded, onClick, compact = false }: TopicCardProps) {
  const covered = topic.knowledge_count > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col bg-white border rounded-2xl text-left transition-all group w-full",
        compact ? "p-3" : "p-4",
        isExpanded
          ? "border-(--color-primary-400) shadow-md ring-1 ring-(--color-primary-200)"
          : covered
            ? "border-(--color-success-200) hover:border-(--color-success-300) hover:shadow-sm"
            : "border-(--surface-border-strong) hover:border-(--color-primary-300) hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {covered ? (
            <CheckCircle2 className={cn("shrink-0 text-(--color-success-500)", compact ? "h-4 w-4" : "h-5 w-5")} />
          ) : (
            <Circle className={cn("shrink-0 text-(--text-disabled)", compact ? "h-4 w-4" : "h-5 w-5")} />
          )}
          <span className={cn(
            "font-medium truncate",
            compact ? "text-sm text-(--text-secondary)" : "text-base text-(--text-primary)"
          )}>
            {topic.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-xs font-medium", covered ? "text-(--color-success-600)" : "text-(--text-disabled)")}>
            {covered ? `${topic.knowledge_count} instrucción${topic.knowledge_count !== 1 ? 'es' : ''}` : "Sin cubrir"}
          </span>
          {isExpanded
            ? <ChevronDown className="h-4 w-4 text-(--color-primary-600)" />
            : <ChevronRight className="h-4 w-4 text-(--text-tertiary) group-hover:text-(--color-primary-600) transition-colors" />
          }
        </div>
      </div>

      {!compact && !isExpanded && topic.description && (
        <p className="text-xs text-(--text-tertiary) mt-1.5 ml-7">{topic.description}</p>
      )}

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-(--surface-border) flex flex-col gap-3 animate-in fade-in duration-200">
          {topic.items === undefined ? (
            <div className="flex items-center gap-1.5 text-xs text-(--text-tertiary)">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Cargando...</span>
            </div>
          ) : topic.items.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-(--text-tertiary)">
              <Brain className="h-3.5 w-3.5" />
              <span>Sin instrucciones registradas. Usa Instrucción rápida para enseñarle sobre "{topic.name}".</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs text-(--text-tertiary) font-medium">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Lo que sabe sobre este tema</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {topic.items.map((item) => {
                  const meta = LAYER_LABELS[item.layer] || { label: item.layer, color: 'text-gray-600 bg-gray-50' };
                  return (
                    <div key={item.id} className="flex flex-col gap-1 bg-(--surface-muted) rounded-xl px-3 py-2">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded w-fit", meta.color)}>
                        {meta.label}
                      </span>
                      <p className="text-xs text-(--text-secondary) leading-relaxed">{item.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </button>
  );
}
