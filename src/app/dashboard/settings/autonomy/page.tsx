"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { TopicAutonomyCard, Topic, Indicator, getIndicators, canActivate } from "@/components/dashboard/TopicAutonomyCard";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useBusinessId } from "@/hooks/useBusinessId";

interface AutonomyRule { id: string; topic_id: string; level: string; active: boolean; }
type ConfirmModal = { topicId: string; topicName: string; indicators: Indicator[] } | null;

async function fetchAutonomyData(bizId: string) {
  const supabase = createClient();
  const [{ data: topicsData }, { data: rulesData }] = await Promise.all([
    supabase.from("competency_topics")
      .select("id, name, coverage_percentage, approval_rate_7d, incident_count_7d")
      .eq("business_id", bizId).eq("is_default" as string, true).order("name"),
    supabase.from("autonomy_rules").select("id, topic_id, level, active").eq("business_id", bizId),
  ]);
  return {
    topics: (topicsData as unknown as Topic[]) || [],
    rules: (rulesData as unknown as AutonomyRule[]) || [],
  };
}

export default function AutonomyPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: businessId } = useBusinessId();
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<ConfirmModal>(null);
  const [toggling, setToggling] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["autonomy", businessId],
    queryFn: () => fetchAutonomyData(businessId!),
    enabled: !!businessId,
    staleTime: 5 * 60_000,
  });

  const topics = data?.topics ?? [];
  const rules = data?.rules ?? [];

  const isAutonomous = (id: string) => rules.some(r => r.topic_id === id && r.active && r.level === "autonomous_with_guardrails");

  async function activateAutonomy(topicId: string) {
    setConfirmModal(null);
    setToggling(topicId);
    if (!businessId) return;
    try {
      const { error } = await supabase.from("autonomy_rules").upsert(
        { business_id: businessId, topic_id: topicId, level: "autonomous_with_guardrails", active: true, activated_at: new Date().toISOString(), activated_by: "owner_manual" },
        { onConflict: "business_id,topic_id" }
      );
      if (error) throw error;
      queryClient.setQueryData(["autonomy", businessId], (old: any) => old ? {
        ...old,
        rules: [...old.rules.filter((r: AutonomyRule) => r.topic_id !== topicId), { id: "tmp", topic_id: topicId, level: "autonomous_with_guardrails", active: true }],
      } : old);
      toast({ message: "Listo. Tu agente responderá solo en este tema cuando esté seguro.", type: "success" });
    } catch { toast({ message: "Algo salió mal al activar. Intenta de nuevo.", type: "error" }); }
    finally { setToggling(null); }
  }

  async function deactivateAutonomy(topicId: string) {
    setToggling(topicId);
    if (!businessId) return;
    try {
      const { error } = await supabase.from("autonomy_rules").update({ active: false }).eq("business_id", businessId).eq("topic_id", topicId);
      if (error) throw error;
      queryClient.setQueryData(["autonomy", businessId], (old: any) => old ? {
        ...old,
        rules: old.rules.filter((r: AutonomyRule) => r.topic_id !== topicId),
      } : old);
      toast({ message: "Tu agente volverá a pedirte aprobación en este tema.", type: "success" });
    } catch { toast({ message: "Algo salió mal. Intenta de nuevo.", type: "error" }); }
    finally { setToggling(null); }
  }

  function handleToggle(topic: Topic) {
    if (isAutonomous(topic.id)) { deactivateAutonomy(topic.id); }
    else if (canActivate(topic)) { setConfirmModal({ topicId: topic.id, topicName: topic.name, indicators: getIndicators(topic) }); }
    else { toast({ message: "Este tema aún no cumple los requisitos para operar de forma autónoma.", type: "info" }); }
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" className="text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="solar:arrow-left-linear" size={18} />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Autonomía del agente</h1>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 flex flex-col gap-4">
        <p className="text-base text-slate-600">Permite que tu agente responda automáticamente a los clientes sin pedir tu aprobación, basándose en la confianza de su conocimiento.</p>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="solar:refresh-linear" size={24} className="text-slate-300 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {topics.map(topic => (
              <TopicAutonomyCard key={topic.id} topic={topic} autonomous={isAutonomous(topic.id)}
                expanded={expanded === topic.id} toggling={toggling === topic.id}
                onExpand={() => setExpanded(expanded === topic.id ? null : topic.id)}
                onToggle={() => handleToggle(topic)} />
            ))}
            {topics.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-12">No hay áreas configuradas en tu negocio aún.</p>
            )}
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/20 backdrop-blur-sm px-4 pb-6">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Activar autonomía en &quot;{confirmModal.topicName}&quot;</h3>
              <p className="text-sm text-slate-500 mt-1">Tu agente responderá solo cuando tenga alta confianza. Puedes desactivarlo cuando quieras.</p>
            </div>
            <div className="space-y-2">
              {confirmModal.indicators.map(ind => (
                <div key={ind.label} className="flex items-center gap-2">
                  <Icon name="solar:check-circle-bold" size={15} className="text-emerald-500 shrink-0" />
                  <p className="text-xs text-slate-800">{ind.label}: <span className="text-slate-500">{ind.value}</span></p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirmModal(null)} className="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={() => activateAutonomy(confirmModal.topicId)} className="flex-1 h-12 rounded-xl bg-[#3DC185] hover:bg-[#32a873] text-white text-sm font-semibold transition-colors">Activar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
