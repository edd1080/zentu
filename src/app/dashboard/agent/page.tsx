"use client";

import * as React from "react";
import { QuickInstruct } from "@/components/dashboard/QuickInstruct";
import { CompetencyMap } from "@/components/dashboard/CompetencyMap";
import { Button } from "@/components/ui/Button";
import {
  Brain,
  History,
  Sparkles,
  Target,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface KnowledgeItem {
  id: string;
  content: string;
  layer: string;
  created_at: string;
}

interface Topic {
  id: string;
  name: string;
  status: 'strong' | 'weak' | 'partial';
  coverage_percentage: number;
  description: string | null;
  is_default: boolean;
  knowledge_count: number;
  items?: KnowledgeItem[];
}

export default function AgentPage() {
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!biz) return;
      setBusinessId(biz.id);
      await loadTopics(biz.id);
      setLoading(false);
    }
    init();
  }, []);

  // Realtime: UPDATE on coverage/status
  React.useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      .channel('competency-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'competency_topics', filter: `business_id=eq.${businessId}` },
        async (payload: any) => {
          // Fetch fresh knowledge_count for the changed topic so binary card state is correct
          const { count } = await supabase
            .from('knowledge_items')
            .select('id', { count: 'exact', head: true })
            .eq('topic_id', payload.new.id)
            .eq('active', true);
          setTopics(prev => prev.map(t =>
            t.id === payload.new.id
              ? { ...t, coverage_percentage: payload.new.coverage_percentage, status: payload.new.status, knowledge_count: count ?? t.knowledge_count }
              : t
          ));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [businessId]);

  async function loadTopics(bizId: string) {
    const { data: topicsData } = await supabase
      .from('competency_topics')
      .select('id, name, status, coverage_percentage, description, is_default')
      .eq('business_id', bizId)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (!topicsData) return;

    const topicsWithCounts: Topic[] = await Promise.all(
      topicsData.map(async (t: any) => {
        const { count } = await supabase
          .from('knowledge_items')
          .select('id', { count: 'exact', head: true })
          .eq('topic_id', t.id)
          .eq('active', true);
        return { ...t, knowledge_count: count || 0 };
      })
    );
    // Preserve cached items for already-expanded topics to avoid spinner flash
    setTopics(prev => topicsWithCounts.map(t => ({
      ...t,
      items: prev.find(p => p.id === t.id)?.items,
    })));
  }

  async function handleTopicClick(topicId: string) {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    const { data } = await supabase
      .from('knowledge_items')
      .select('id, content, layer, created_at')
      .eq('topic_id', topicId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    setTopics(prev => prev.map(t =>
      t.id === topicId ? { ...t, items: data || [] } : t
    ));
  }

  // Health score: binary — how many CORE topics have ≥1 instruction
  const coreTopics = topics.filter(t => t.is_default);
  const coveredCore = coreTopics.filter(t => t.knowledge_count > 0).length;
  const healthScore = coreTopics.length > 0
    ? Math.round((coveredCore / coreTopics.length) * 100)
    : 0;
  const healthLevel = healthScore >= 80 ? 'Excelente' : healthScore >= 50 ? 'Óptimo' : 'En Desarrollo';

  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background) overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8 pb-32">

        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="font-display italic text-3xl text-(--text-primary)">Tu Agente</h1>
            <Link href="/dashboard/agent/history">
              <Button variant="secondary" className="h-10 min-h-0 text-sm">
                <History className="h-4 w-4 mr-2" />
                Historial
              </Button>
            </Link>
          </div>
          <p className="text-(--text-secondary) text-sm max-w-md">
            Gestiona el conocimiento y comportamiento de tu agente de inteligencia artificial.
          </p>
        </header>

        {/* Health Card */}
        <section className="bg-(--color-primary-900) text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-emerald-300" />
              </div>
              <span className="text-sm font-medium text-emerald-100 italic">Salud Operativa</span>
            </div>

            <div className="flex items-end gap-4 mb-6">
              <span className="text-5xl font-display italic">{healthScore}%</span>
              <div className="flex flex-col pb-1">
                <span className="text-xs text-emerald-200 uppercase tracking-widest font-bold">Nivel: {healthLevel}</span>
                <div className="h-1.5 w-24 bg-white/20 rounded-full mt-1">
                  <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" style={{ width: `${healthScore}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <span className="text-[10px] uppercase text-emerald-200 font-bold block mb-1">Áreas Cubiertas</span>
                <span className="text-xl font-semibold">{coveredCore} / {coreTopics.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <span className="text-[10px] uppercase text-emerald-200 font-bold block mb-1">Sin Cubrir</span>
                <span className="text-xl font-semibold">{coreTopics.length - coveredCore}</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 -top-10 h-40 w-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
        </section>

        {/* Quick Instruct */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-(--color-primary-700)" />
            <h2 className="font-semibold text-(--text-primary)">Instrucción rápida</h2>
          </div>
          <QuickInstruct
            businessId={businessId || undefined}
            onSuccess={() => businessId && loadTopics(businessId)}
          />
          <p className="text-[11px] text-(--text-tertiary) px-1 italic">
            Tip: Puedes enviar imágenes del menú o PDFs de servicios para que AGENTI los aprenda.
          </p>
        </section>

        {/* Areas del negocio */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-(--color-primary-700)" />
            <h2 className="font-semibold text-(--text-primary)">Áreas del negocio</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-(--color-primary-600)" />
            </div>
          ) : (
            <CompetencyMap
              topics={topics}
              onTopicClick={handleTopicClick}
            />
          )}
        </section>

      </div>
    </div>
  );
}
