"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QuickInstruct } from "@/components/dashboard/QuickInstruct";
import { CompetencyMap } from "@/components/dashboard/CompetencyMap";
import { HealthCard } from "@/components/dashboard/HealthCard";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import type { Topic } from "@/components/dashboard/TopicCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useBusinessId } from "@/hooks/useBusinessId";

async function fetchTopics(bizId: string): Promise<Topic[]> {
  const supabase = createClient();
  const { data } = await supabase.from("competency_topics")
    .select("id, name, status, coverage_percentage, description, is_default")
    .eq("business_id", bizId)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });
  if (!data) return [];
  const { data: knowledgeRows } = await supabase.from("knowledge_items")
    .select("topic_id")
    .in("topic_id", data.map((t) => t.id))
    .eq("active", true);
  const countMap = (knowledgeRows || []).reduce((acc: Record<string, number>, row: any) => {
    acc[row.topic_id] = (acc[row.topic_id] || 0) + 1;
    return acc;
  }, {});
  return data.map((t: any) => ({ ...t, knowledge_count: countMap[t.id] || 0 }));
}

export default function AgentPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: businessId } = useBusinessId();
  const [expandedItems, setExpandedItems] = React.useState<Record<string, any[]>>({});

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["topics", businessId],
    queryFn: () => fetchTopics(businessId!),
    enabled: !!businessId,
    staleTime: 2 * 60_000,
  });

  // Realtime: invalidate topics query on competency_topic changes
  React.useEffect(() => {
    if (!businessId) return;
    const ch = supabase.channel("competency-realtime")
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "competency_topics",
        filter: `business_id=eq.${businessId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["topics", businessId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [businessId]);

  const handleTopicClick = async (topicId: string) => {
    const { data } = await supabase.from("knowledge_items")
      .select("id, content, layer, created_at")
      .eq("topic_id", topicId).eq("active", true)
      .order("created_at", { ascending: false });
    setExpandedItems(prev => ({ ...prev, [topicId]: data || [] }));
  };

  const topicsWithItems = topics.map(t => ({ ...t, items: expandedItems[t.id] }));
  const coreTopics = topics.filter(t => t.is_default);
  const coveredCore = coreTopics.filter(t => t.knowledge_count > 0).length;
  const healthScore = coreTopics.length > 0 ? Math.round((coveredCore / coreTopics.length) * 100) : 0;
  const healthLevel = healthScore >= 80 ? "Excelente" : healthScore >= 50 ? "Óptimo" : "En Desarrollo";

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto">
      <PageHeader title="Mi Agente" action={
        <Link href="/dashboard/agent/history" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl px-3 h-9 transition-colors shadow-sm">
          <Icon name="solar:history-linear" size={15} />
          Historial
        </Link>
      } />
      <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 pb-20">

        <HealthCard healthScore={healthScore} healthLevel={healthLevel} coveredCore={coveredCore} totalCore={coreTopics.length} />

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Icon name="solar:pen-new-round-linear" size={16} className="text-[#3DC185]" />
            <h2 className="text-sm font-semibold text-slate-900">Enseñar algo nuevo</h2>
          </div>
          <QuickInstruct businessId={businessId || undefined} onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["topics", businessId] });
            queryClient.invalidateQueries({ queryKey: ["train-data"] });
          }} />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Icon name="solar:map-linear" size={16} className="text-[#3DC185]" />
            <h2 className="text-sm font-semibold text-slate-900">Mapa de conocimiento</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="solar:refresh-linear" size={24} className="text-slate-300 animate-spin" />
            </div>
          ) : (
            <CompetencyMap topics={topicsWithItems} onTopicClick={handleTopicClick} />
          )}
        </section>

        <Link href="/dashboard/agent/intelligence" className="flex items-center justify-between px-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl hover:border-[#3DC185]/40 hover:bg-emerald-50/30 transition-colors group shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Icon name="solar:chart-2-linear" size={17} className="text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Métricas e Inteligencia</p>
              <p className="text-xs text-slate-500">Actividad del agente y oportunidades de mejora</p>
            </div>
          </div>
          <Icon name="solar:alt-arrow-right-linear" size={16} className="text-slate-400 group-hover:text-[#3DC185] transition-colors shrink-0" />
        </Link>

      </div>
    </div>
  );
}
