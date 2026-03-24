"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";
import { HistoryCard, type HistoryItem } from "@/components/dashboard/HistoryCard";
import { DeactivateModal } from "@/components/dashboard/DeactivateModal";
import { useBusinessId } from "@/hooks/useBusinessId";

type FilterType = "all" | "quick_instruct" | "voice_note" | "image_ocr";
const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all",            label: "Todos"  },
  { value: "quick_instruct", label: "Texto"  },
  { value: "voice_note",     label: "Voz"    },
  { value: "image_ocr",      label: "Imagen" },
];
const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

async function fetchHistory(bizId: string): Promise<HistoryItem[]> {
  const supabase = createClient();
  const { data: items } = await supabase.from("knowledge_items")
    .select("id, content, layer, active, created_at, topic:competency_topics(name), source:knowledge_sources(type)")
    .eq("business_id", bizId)
    .order("created_at", { ascending: false });
  return (items || []).map((item: any) => ({
    id: item.id, content: item.content,
    topic_name: item.topic?.name || "General",
    layer: item.layer, source_type: item.source?.type || "quick_instruct",
    created_at: item.created_at, active: item.active,
  }));
}

export default function TrainingHistoryPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: businessId } = useBusinessId();
  const [toggling, setToggling] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filter, setFilter] = React.useState<FilterType>("all");
  const [confirmItem, setConfirmItem] = React.useState<HistoryItem | null>(null);
  const { toast } = useToast();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["history", businessId],
    queryFn: () => fetchHistory(businessId!),
    enabled: !!businessId,
    staleTime: 2 * 60_000,
  });

  const executeToggle = async (item: HistoryItem, newActive: boolean) => {
    setConfirmItem(null); setToggling(item.id);
    try {
      const { error } = await supabase.from("knowledge_items").update({ active: newActive }).eq("id", item.id);
      if (error) throw error;
      if (businessId) {
        await (supabase.rpc as any)("refresh_competency_coverage", { p_business_id: businessId });
        await (supabase as any).from("agent_context_cache").delete().eq("business_id", businessId);
      }
      queryClient.invalidateQueries({ queryKey: ["history", businessId] });
      queryClient.invalidateQueries({ queryKey: ["topics", businessId] });
      toast({ type: newActive ? "success" : "info", message: newActive ? "Instrucción reactivada." : "Instrucción desactivada." });
    } catch (err: any) {
      toast({ type: "error", message: "Error: " + err.message });
    } finally { setToggling(null); }
  };

  const requestToggle = (item: HistoryItem) => item.active ? setConfirmItem(item) : executeToggle(item, true);

  const filtered = history.filter(h => {
    const q = searchQuery.trim().toLowerCase();
    return (!q || h.content.toLowerCase().includes(q) || (h.topic_name || "").toLowerCase().includes(q))
      && (filter === "all" || h.source_type === filter);
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFDFD] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agent" className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Icon name="solar:arrow-left-linear" size={20} />
          </Link>
          <h1 className="text-base font-semibold tracking-tight text-slate-900">Historial de aprendizaje</h1>
        </div>
      </div>
      <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5 pb-20">
        <div className="relative group">
          <Icon name="solar:magnifer-linear" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3DC185] transition-colors" />
          <input type="text" placeholder="Buscar instrucciones o temas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-12 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#3DC185]/10 focus:border-[#3DC185]/60 shadow-sm transition-all" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors", filter === f.value ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {f.label}
            </button>
          ))}
        </div>
        {isLoading && <div className="flex items-center justify-center py-16 gap-2"><Icon name="solar:refresh-linear" size={20} className="text-slate-300 animate-spin" /><span className="text-sm text-slate-400">Cargando historial...</span></div>}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-dashed border-slate-200 rounded-2xl">
            <Icon name="solar:brain-linear" size={32} className="text-slate-200" />
            <p className="text-sm text-slate-400 text-center max-w-xs">
              {searchQuery || filter !== "all" ? "No se encontraron resultados para este filtro." : "Tu agente aún no ha aprendido nada. ¡Enséñale algo nuevo!"}
            </p>
          </div>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map(item => <HistoryCard key={item.id} item={item} toggling={toggling === item.id} onToggle={requestToggle} formatDate={fmtDate} />)}
          </div>
        )}
      </div>
      {confirmItem && <DeactivateModal item={confirmItem} onConfirm={() => executeToggle(confirmItem, false)} onCancel={() => setConfirmItem(null)} />}
    </div>
  );
}
