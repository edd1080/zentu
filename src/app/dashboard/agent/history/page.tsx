"use client";

import * as React from "react";
import { ArrowLeft, Search, Brain, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { HistoryCard, type HistoryItem } from "@/components/dashboard/HistoryCard";
import { DeactivateModal } from "@/components/dashboard/DeactivateModal";

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
      const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
      if (!biz) return;
      setBusinessId(biz.id);

      const { data: items, error } = await supabase
        .from('knowledge_items')
        .select('id, content, layer, active, created_at, topic:competency_topics(name), source:knowledge_sources(type)')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      if (error) { console.error("Error loading history:", error); setLoading(false); return; }

      setHistory((items || []).map((item: any) => ({
        id: item.id, content: item.content, topic_name: item.topic?.name || 'General',
        layer: item.layer, source_type: item.source?.type || 'quick_instruct',
        created_at: item.created_at, active: item.active,
      })));
      setLoading(false);
    }
    loadHistory();
  }, []);

  const requestToggle = (item: HistoryItem) => {
    item.active ? setConfirmItem(item) : executeToggle(item, true);
  };

  const executeToggle = async (item: HistoryItem, newActive: boolean) => {
    setConfirmItem(null);
    setToggling(item.id);
    try {
      const { error } = await supabase.from('knowledge_items').update({ active: newActive }).eq('id', item.id);
      if (error) throw error;
      if (businessId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.rpc as any)('refresh_competency_coverage', { p_business_id: businessId });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('agent_context_cache').delete().eq('business_id', businessId);
      }
      setHistory(prev => prev.map(h => h.id === item.id ? { ...h, active: newActive } : h));
      toast({ type: newActive ? "success" : "info", message: newActive ? "Instrucción reactivada." : "Instrucción desactivada. El agente ya no usará esta información." });
    } catch (err: any) {
      toast({ type: "error", message: "No se pudo actualizar: " + err.message });
    } finally {
      setToggling(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filtered = history.filter(h => {
    const matchesSearch = !searchQuery.trim() ||
      h.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.topic_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (filter === 'all' || h.source_type === filter);
  });

  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background) overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 pb-32">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/agent" className="text-sm font-medium text-(--color-primary-700) flex items-center hover:underline w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Tu Agente
          </Link>
          <div>
            <h1 className="font-display italic text-3xl text-(--text-primary)">Historial de aprendizaje</h1>
            <p className="text-(--text-secondary) text-sm mt-1">Todo lo que le has enseñado a tu agente. Desactiva cualquier instrucción que ya no sea válida.</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
          <input type="text" placeholder="Buscar instrucciones o temas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-(--surface-border-strong) rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary-700) shadow-sm" />
        </div>

        <div className="flex bg-(--surface-muted) rounded-xl p-1 gap-0.5">
          {FILTER_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => setFilter(opt.value)}
              className={cn("flex-1 py-1.5 rounded-lg text-xs font-medium transition-all", filter === opt.value ? "bg-white text-(--text-primary) shadow-sm" : "text-(--text-tertiary) hover:text-(--text-secondary)")}>
              {opt.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-(--color-primary-600)" />
            <p className="text-sm text-(--text-tertiary)">Cargando historial...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-dashed border-(--surface-border) rounded-2xl">
            <Brain className="h-8 w-8 text-(--text-disabled)" />
            <p className="text-sm text-(--text-tertiary) text-center px-4">
              {searchQuery || filter !== 'all' ? "No se encontraron resultados para este filtro." : "Tu agente aún no ha aprendido nada. ¡Enséñale algo desde Instrucción rápida!"}
            </p>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3">
            {filtered.map(item => (
              <HistoryCard key={item.id} item={item} toggling={toggling === item.id} onToggle={requestToggle} formatDate={formatDate} />
            ))}
          </div>
        )}
      </div>

      {confirmItem && (
        <DeactivateModal item={confirmItem} onConfirm={() => executeToggle(confirmItem, false)} onCancel={() => setConfirmItem(null)} />
      )}
    </div>
  );
}
