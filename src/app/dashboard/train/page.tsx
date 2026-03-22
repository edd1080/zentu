"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { QuickInstruct } from "@/components/dashboard/QuickInstruct";
import { HistoryCard, HistoryItem, LAYER_LABELS } from "@/components/dashboard/HistoryCard";
import { DeactivateModal } from "@/components/dashboard/DeactivateModal";
import { useToast } from "@/components/ui/Toast";
import { Brain, Sparkles, ArrowRight, Loader2, X, Lightbulb } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TrainTopic { id: string; name: string; knowledge_count: number; }
interface TrainData { businessId: string; items: HistoryItem[]; opportunities: TrainTopic[]; }

async function fetchTrainData(): Promise<TrainData> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { businessId: "", items: [], opportunities: [] };
  const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
  if (!biz) return { businessId: "", items: [], opportunities: [] };

  const [{ data: rawItems }, { data: topics }] = await Promise.all([
    supabase
      .from("knowledge_items")
      .select("id, content, layer, active, created_at, topic:competency_topics(name), source:knowledge_sources(type)")
      .eq("business_id", biz.id)
      .order("created_at", { ascending: false })
      .limit(5),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("competency_topics")
      .select("id, name, knowledge_count")
      .eq("business_id", biz.id)
      .eq("knowledge_count", 0)
      .order("name", { ascending: true }),
  ]);

  return {
    businessId: biz.id,
    items: (rawItems || []).map((item: any) => ({
      id: item.id,
      content: item.content,
      topic_name: item.topic?.name || "General",
      layer: item.layer,
      source_type: item.source?.type || "quick_instruct",
      created_at: item.created_at,
      active: item.active,
    })),
    opportunities: topics || [],
  };
}

export default function TrainPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["train-data"],
    queryFn: fetchTrainData,
    staleTime: 20_000,
  });

  const businessId = data?.businessId ?? null;
  const recentItems = data?.items ?? [];
  const opportunities = data?.opportunities ?? [];
  const loading = isLoading;

  const [toggling, setToggling] = React.useState<string | null>(null);
  const [confirmItem, setConfirmItem] = React.useState<HistoryItem | null>(null);
  const [prefillTopic, setPrefillTopic] = React.useState<string | null>(null);
  const instructRef = React.useRef<HTMLDivElement>(null);

  const requestToggle = (item: HistoryItem) => {
    item.active ? setConfirmItem(item) : executeToggle(item, true);
  };

  const executeToggle = async (item: HistoryItem, newActive: boolean) => {
    setConfirmItem(null);
    setToggling(item.id);
    try {
      const { error } = await supabase.from("knowledge_items").update({ active: newActive }).eq("id", item.id);
      if (error) throw error;
      if (businessId) {
        await (supabase.rpc as any)("refresh_competency_coverage", { p_business_id: businessId });
        await (supabase as any).from("agent_context_cache").delete().eq("business_id", businessId);
      }
      queryClient.invalidateQueries({ queryKey: ["train-data"] });
      queryClient.invalidateQueries({ queryKey: ["nav-counts"] });
      toast({ type: newActive ? "success" : "info", message: newActive ? "Instrucción reactivada." : "Instrucción desactivada." });
    } catch (err: any) {
      toast({ type: "error", message: "No se pudo actualizar: " + err.message });
    } finally {
      setToggling(null);
    }
  };

  const handleOpportunityClick = (topicName: string) => {
    setPrefillTopic(topicName);
    instructRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background) overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-8 pb-32">

        {/* Header */}
        <div>
          <h1 className="font-display italic text-3xl text-(--text-primary)">Entrena a tu agente</h1>
          <p className="text-(--text-secondary) text-sm mt-1 max-w-md">
            Enséñale qué responder, revisa lo que ha aprendido y cubre los temas que aún no conoce.
          </p>
        </div>

        {/* Historial de instrucciones recientes (chat bubbles) */}
        {!loading && recentItems.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-tertiary)">Instrucciones recientes</h2>
              <Link href="/dashboard/agent/history" className="text-xs text-(--color-primary-700) font-medium flex items-center hover:underline">
                Ver todo <ArrowRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex flex-col gap-1 items-end">
                  {/* Owner instruction bubble */}
                  <div className="max-w-[85%] bg-(--color-primary-700) text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                    <p className="text-sm leading-relaxed">{item.content}</p>
                    <span className="text-[10px] text-white/60 mt-1 block text-right">{formatDate(item.created_at)}</span>
                  </div>
                  {/* Agent confirmation bubble */}
                  <div className="max-w-[75%] self-start bg-white border border-(--surface-border) rounded-2xl rounded-tl-sm px-4 py-2.5">
                    <p className="text-sm text-(--text-secondary) leading-relaxed">
                      Entendido. Lo usaré para responder preguntas sobre <span className="font-medium text-(--text-primary)">{item.topic_name}</span>.
                    </p>
                    <span className="text-[10px] text-(--text-disabled) mt-1 block">{LAYER_LABELS[item.layer] || item.layer}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Instrucción rápida */}
        <section ref={instructRef} className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-tertiary)">Nueva instrucción</h2>

          {prefillTopic && (
            <div className="flex items-center gap-2 px-3 py-2 bg-(--color-primary-50) border border-(--color-primary-100) rounded-xl text-sm text-(--color-primary-700)">
              <Lightbulb className="h-4 w-4 shrink-0" />
              <span className="flex-1">Entrenando sobre: <strong>{prefillTopic}</strong></span>
              <button onClick={() => setPrefillTopic(null)} className="p-0.5 rounded hover:bg-(--color-primary-100) transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <QuickInstruct businessId={businessId ?? undefined} onSuccess={() => {
            setPrefillTopic(null);
            queryClient.invalidateQueries({ queryKey: ["train-data"] });
            queryClient.invalidateQueries({ queryKey: ["nav-counts"] });
          }} />
        </section>

        {/* Oportunidades de entrenamiento */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-tertiary)">Temas sin cubrir</h2>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-(--text-tertiary)" />
            </div>
          )}

          {!loading && opportunities.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 bg-white border border-dashed border-(--surface-border) rounded-2xl text-center">
              <Sparkles className="h-6 w-6 text-(--color-success-500)" />
              <p className="text-sm font-semibold text-(--text-primary)">Tu agente está bien entrenado</p>
              <p className="text-xs text-(--text-tertiary) max-w-xs">Aparecerán sugerencias cuando tus clientes pregunten sobre algo que tu agente aún no sepa.</p>
            </div>
          )}

          {!loading && opportunities.length > 0 && (
            <div className="flex flex-col gap-2">
              {opportunities.map(topic => (
                <div key={topic.id} className="flex items-center justify-between gap-3 bg-white border border-(--surface-border) rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <Brain className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-(--text-primary) truncate">{topic.name}</p>
                      <p className="text-xs text-(--text-tertiary)">Sin instrucciones aún</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpportunityClick(topic.name)}
                    className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-(--color-primary-50) text-(--color-primary-700) hover:bg-(--color-primary-100) transition-colors"
                  >
                    Entrenar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Historial completo — acceso rápido */}
        {!loading && recentItems.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-(--text-tertiary)">Historial de aprendizaje</h2>
              <Link href="/dashboard/agent/history" className="text-xs text-(--color-primary-700) font-medium flex items-center hover:underline">
                Ver todo <ArrowRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentItems.map(item => (
                <HistoryCard key={item.id} item={item} toggling={toggling === item.id} onToggle={requestToggle} formatDate={formatDate} />
              ))}
            </div>
          </section>
        )}
      </div>

      {confirmItem && (
        <DeactivateModal item={confirmItem} onConfirm={() => executeToggle(confirmItem, false)} onCancel={() => setConfirmItem(null)} />
      )}
    </div>
  );
}
