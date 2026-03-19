"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Search,
  Brain,
  FileText,
  Volume2,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  Ban,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

interface HistoryItem {
  id: string;
  content: string;
  topic_name: string | null;
  layer: string;
  source_type: string | null;
  created_at: string;
  active: boolean;
}

const LAYER_LABELS: Record<string, string> = {
  structured:  'Dato fijo',
  operational: 'Política',
  narrative:   'Descriptivo',
  learned:     'Aprendido',
};

type FilterType = 'all' | 'quick_instruct' | 'voice_note' | 'image_ocr';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all',            label: 'Todos'  },
  { value: 'quick_instruct', label: 'Texto'  },
  { value: 'voice_note',     label: 'Voz'    },
  { value: 'image_ocr',      label: 'Imagen' },
];

export default function TrainingHistoryPage() {
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [confirmItem, setConfirmItem] = React.useState<HistoryItem | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  React.useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!biz) return;
      setBusinessId(biz.id);

      const { data: items, error } = await supabase
        .from('knowledge_items')
        .select(`
          id,
          content,
          layer,
          active,
          created_at,
          topic:competency_topics(name),
          source:knowledge_sources(type)
        `)
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading history:", error);
        setLoading(false);
        return;
      }

      const mapped: HistoryItem[] = (items || []).map((item: any) => ({
        id: item.id,
        content: item.content,
        topic_name: item.topic?.name || 'General',
        layer: item.layer,
        source_type: item.source?.type || 'quick_instruct',
        created_at: item.created_at,
        active: item.active,
      }));

      setHistory(mapped);
      setLoading(false);
    }
    loadHistory();
  }, []);

  const requestToggle = (item: HistoryItem) => {
    if (item.active) {
      setConfirmItem(item);
    } else {
      executeToggle(item, true);
    }
  };

  const executeToggle = async (item: HistoryItem, newActive: boolean) => {
    setConfirmItem(null);
    setToggling(item.id);

    try {
      const { error } = await supabase
        .from('knowledge_items')
        .update({ active: newActive })
        .eq('id', item.id);

      if (error) throw error;

      // Recalculate coverage so the agent map reflects the change in real time
      if (businessId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.rpc as any)('refresh_competency_coverage', { p_business_id: businessId });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('agent_context_cache').delete().eq('business_id', businessId);
      }

      setHistory(prev => prev.map(h => h.id === item.id ? { ...h, active: newActive } : h));

      toast({
        type: newActive ? "success" : "info",
        message: newActive
          ? "Instrucción reactivada. El agente vuelve a usarla."
          : "Instrucción desactivada. El agente ya no usará esta información.",
      });
    } catch (err: any) {
      toast({ type: "error", message: "No se pudo actualizar: " + err.message });
    } finally {
      setToggling(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filtered = history.filter(h => {
    const matchesSearch = !searchQuery.trim() ||
      h.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.topic_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filter === 'all' || h.source_type === filter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background) overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 pb-32">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/agent" className="text-sm font-medium text-(--color-primary-700) flex items-center hover:underline w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Tu Agente
          </Link>
          <div>
            <h1 className="font-display italic text-3xl text-(--text-primary)">Historial de aprendizaje</h1>
            <p className="text-(--text-secondary) text-sm mt-1">
              Todo lo que le has enseñado a tu agente. Desactiva cualquier instrucción que ya no sea válida.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
          <input
            type="text"
            placeholder="Buscar instrucciones o temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-(--surface-border-strong) rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary-700) shadow-sm"
          />
        </div>

        {/* Type filter — segmented control */}
        <div className="flex bg-(--surface-muted) rounded-xl p-1 gap-0.5">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === opt.value
                  ? "bg-white text-(--text-primary) shadow-sm"
                  : "text-(--text-tertiary) hover:text-(--text-secondary)"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-(--color-primary-600)" />
            <p className="text-sm text-(--text-tertiary)">Cargando historial...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-dashed border-(--surface-border) rounded-2xl">
            <Brain className="h-8 w-8 text-(--text-disabled)" />
            <p className="text-sm text-(--text-tertiary) text-center px-4">
              {searchQuery || filter !== 'all'
                ? "No se encontraron resultados para este filtro."
                : "Tu agente aún no ha aprendido nada. ¡Enséñale algo desde Instrucción rápida!"}
            </p>
          </div>
        )}

        {/* History list */}
        {!loading && (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "bg-white border rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-all",
                  item.active
                    ? "border-(--surface-border-strong)"
                    : "border-dashed border-(--surface-border) opacity-55"
                )}
              >
                {/* Meta row */}
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

                {/* Content */}
                <p className="text-sm text-(--text-primary) leading-relaxed">{item.content}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-(--surface-border)">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-(--text-disabled)">
                    {LAYER_LABELS[item.layer] || item.layer}
                  </span>
                  <button
                    onClick={() => requestToggle(item)}
                    disabled={toggling === item.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50",
                      item.active
                        ? "text-red-500 hover:bg-red-50"
                        : "text-(--color-primary-700) hover:bg-(--color-primary-50)"
                    )}
                  >
                    {toggling === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : item.active ? (
                      <><Ban className="h-3.5 w-3.5" /> Desactivar</>
                    ) : (
                      <><RotateCcw className="h-3.5 w-3.5" /> Reactivar</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <button onClick={() => setConfirmItem(null)} className="text-(--text-tertiary) hover:text-(--text-primary) p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h3 className="font-semibold text-(--text-primary) text-base">¿Desactivar esta instrucción?</h3>
              <p className="text-sm text-(--text-secondary) mt-1">
                Tu agente dejará de usar esta información. Puedes reactivarla cuando quieras.
              </p>
            </div>

            <div className="bg-(--surface-muted) rounded-xl p-3 border border-(--surface-border)">
              <p className="text-xs text-(--text-secondary) italic line-clamp-3">"{confirmItem.content}"</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmItem(null)}
                className="flex-1 h-11 rounded-xl border border-(--surface-border-strong) text-sm font-medium text-(--text-secondary) hover:bg-(--surface-muted) transition-colors"
              >
                Cancelar
              </button>
              <Button
                onClick={() => executeToggle(confirmItem, false)}
                className="flex-1 h-11 rounded-xl !bg-red-500 hover:!bg-red-600 text-white text-sm font-medium"
              >
                Sí, desactivar
              </Button>
            </div>
          </div>
        </div>
      )}
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
