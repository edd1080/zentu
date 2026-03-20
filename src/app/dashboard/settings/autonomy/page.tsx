"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { TopicAutonomyCard, Topic, Indicator, getIndicators, canActivate } from "@/components/dashboard/TopicAutonomyCard";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";

interface AutonomyRule { id: string; topic_id: string; level: string; active: boolean; }
type ConfirmModal = { topicId: string; topicName: string; indicators: Indicator[] } | null;

export default function AutonomyPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [topics, setTopics] = React.useState<Topic[]>([]);
  const [rules, setRules] = React.useState<AutonomyRule[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<ConfirmModal>(null);
  const [toggling, setToggling] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (!biz) return;
      setBusinessId(biz.id);
      const [{ data: topicsData }, { data: rulesData }] = await Promise.all([
        supabase.from("competency_topics")
          .select("id, name, coverage_percentage, approval_rate_7d, incident_count_7d")
          .eq("business_id", biz.id).eq("is_default" as string, true).order("name"),
        supabase.from("autonomy_rules").select("id, topic_id, level, active").eq("business_id", biz.id),
      ]);
      setTopics((topicsData as unknown as Topic[]) || []);
      setRules((rulesData as unknown as AutonomyRule[]) || []);
      setLoading(false);
    }
    load();
  }, []);

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
      setRules(prev => [...prev.filter(r => r.topic_id !== topicId), { id: "tmp", topic_id: topicId, level: "autonomous_with_guardrails", active: true }]);
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
      setRules(prev => prev.filter(r => r.topic_id !== topicId));
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
    <div className="flex flex-col min-h-screen bg-(--surface-base) pb-24">
      <div className="sticky top-0 z-10 bg-(--surface-base) border-b border-(--surface-border) px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" className="text-(--text-secondary) hover:text-(--text-primary)"><ChevronLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-semibold text-(--text-primary)">Autonomía del agente</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4">
        <p className="text-sm text-(--text-secondary) mb-4">Cuando activas la autonomía en un tema, tu agente responde directamente a tus clientes cuando está seguro. Puedes desactivarlo en cualquier momento.</p>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-(--text-tertiary)" /></div>
        ) : (
          <div className="space-y-2">
            {topics.map(topic => (
              <TopicAutonomyCard key={topic.id} topic={topic} autonomous={isAutonomous(topic.id)}
                expanded={expanded === topic.id} toggling={toggling === topic.id}
                onExpand={() => setExpanded(expanded === topic.id ? null : topic.id)}
                onToggle={() => handleToggle(topic)} />
            ))}
            {topics.length === 0 && <p className="text-sm text-(--text-secondary) text-center py-12">No hay áreas configuradas en tu negocio aún.</p>}
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-(--text-primary)">Activar autonomía en "{confirmModal.topicName}"</h3>
              <p className="text-sm text-(--text-secondary) mt-1">Tu agente responderá solo cuando tenga alta confianza. Puedes desactivarlo cuando quieras.</p>
            </div>
            <div className="space-y-2">
              {confirmModal.indicators.map(ind => (
                <div key={ind.label} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-xs text-(--text-primary)">{ind.label}: <span className="text-(--text-secondary)">{ind.value}</span></p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmModal(null)}>Cancelar</Button>
              <Button variant="primary" className="flex-1" onClick={() => activateAutonomy(confirmModal.topicId)}>Activar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
