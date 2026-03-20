"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { ActivitySummaryCard } from "@/components/dashboard/ActivitySummaryCard";
import { TrainingOpportunityCard } from "@/components/dashboard/TrainingOpportunityCard";
import { MessageSquare, CheckCircle2, Clock, Zap, AlertTriangle, ChevronLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Period = "week" | "month" | "all";

interface Metrics {
  totalConversations: number;
  resolvedAutonomous: number;
  resolvedOwnerApproved: number;
  escalated: number;
  estimatedMinutesSaved: number;
}

interface Opportunity {
  topicId: string;
  topicName: string;
  escalationCount: number;
}

const PERIOD_LABELS: Record<Period, string> = {
  week: "Esta semana",
  month: "Este mes",
  all: "Todo el tiempo",
};

export default function IntelligencePage() {
  const [period, setPeriod] = React.useState<Period>("week");
  const [metrics, setMetrics] = React.useState<Metrics | null>(null);
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sendingTest, setSendingTest] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ ok: boolean; msg: string } | null>(null);
  const supabase = createClient();

  React.useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (!biz) return;
      setBusinessId(biz.id);
    }
    init();
  }, []);

  React.useEffect(() => {
    if (!businessId) return;
    fetchMetrics(businessId, period);
    fetchOpportunities(businessId);
  }, [businessId, period]);

  async function fetchMetrics(bizId: string, p: Period) {
    setLoading(true);
    const now = new Date();
    let since: string;
    if (p === "week") {
      const d = new Date(now); d.setDate(d.getDate() - 7); since = d.toISOString();
    } else if (p === "month") {
      const d = new Date(now); d.setDate(d.getDate() - 30); since = d.toISOString();
    } else {
      since = "2000-01-01T00:00:00Z";
    }

    const { data: convos } = await supabase
      .from("conversations")
      .select("status, resolved_by")
      .eq("business_id", bizId)
      .gte("last_message_at", since);

    const list = convos || [];
    const totalConversations = list.length;
    const resolvedAutonomous = list.filter(c => c.resolved_by === "agent_autonomous").length;
    const resolvedOwnerApproved = list.filter(c => c.resolved_by === "owner_approved" || c.resolved_by === "owner_manual").length;
    const escalated = list.filter(c =>
      c.status === "escalated_informative" || c.status === "escalated_sensitive" || c.status === "escalated_urgent"
    ).length;
    const estimatedMinutesSaved = (resolvedAutonomous + resolvedOwnerApproved) * 3;

    setMetrics({ totalConversations, resolvedAutonomous, resolvedOwnerApproved, escalated, estimatedMinutesSaved });
    setLoading(false);
  }

  async function fetchOpportunities(bizId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Topics with escalations in last 7 days
    const { data: escalations } = await supabase
      .from("escalations")
      .select("conversation_id, conversations!inner(business_id)")
      .eq("conversations.business_id", bizId)
      .gte("created_at", sevenDaysAgo);

    // Topics with no knowledge items (uncovered areas)
    const { data: weakTopics } = await supabase
      .from("competency_topics")
      .select("id, name")
      .eq("business_id", bizId)
      .eq("knowledge_count", 0)
      .limit(5);

    // Build opportunities from weak topics
    const opps: Opportunity[] = (weakTopics || []).map(t => ({
      topicId: t.id,
      topicName: t.name,
      escalationCount: (escalations || []).length > 0 ? 1 : 0,
    }));

    setOpportunities(opps);
  }

  async function sendTestSummary() {
    if (!businessId) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-daily-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ business_id: businessId, date: today, type: "daily" }),
      });
      const json = await res.json();
      if (json.skipped) {
        setTestResult({ ok: true, msg: "Sin actividad hoy — no se genera resumen." });
      } else if (json.success) {
        setTestResult({
          ok: true,
          msg: json.whatsapp_sent
            ? "✅ Resumen generado y enviado por WhatsApp."
            : `⚠️ Resumen generado, WhatsApp no enviado: ${json.whatsapp_error}`,
        });
      } else {
        setTestResult({ ok: false, msg: json.error || "Error desconocido" });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: String(e) });
    } finally {
      setSendingTest(false);
    }
  }

  const formatTime = (mins: number) =>
    mins >= 60 ? `${Math.round((mins / 60) * 10) / 10}h` : `${mins} min`;

  return (
    <div className="flex flex-col min-h-screen bg-(--surface-base) pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-(--surface-base) border-b border-(--surface-border) px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/dashboard/agent" className="text-(--text-secondary) hover:text-(--text-primary)">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-(--text-primary)">Inteligencia</h1>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 p-1 bg-(--surface-muted) rounded-xl">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-lg transition-all ${
                period === p
                  ? "bg-white text-(--text-primary) shadow-sm"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-6">
        {/* M5.1 — Métricas de actividad */}
        <section>
          <h2 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">
            Actividad del agente
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-(--text-tertiary)" />
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-2 gap-3">
              <ActivitySummaryCard
                label="Conversaciones"
                value={metrics.totalConversations}
                sublabel={PERIOD_LABELS[period].toLowerCase()}
                icon={<MessageSquare className="h-4 w-4" />}
              />
              <ActivitySummaryCard
                label="Resueltas solas"
                value={metrics.resolvedAutonomous}
                sublabel="sin tu ayuda"
                icon={<Zap className="h-4 w-4" />}
                accent="success"
              />
              <ActivitySummaryCard
                label="Con tu aprobación"
                value={metrics.resolvedOwnerApproved}
                sublabel="revisadas por ti"
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
              <ActivitySummaryCard
                label="Escaladas"
                value={metrics.escalated}
                sublabel="requirieron atención"
                icon={<AlertTriangle className="h-4 w-4" />}
                accent={metrics.escalated > 0 ? "warning" : "default"}
              />
              <div className="col-span-2">
                <ActivitySummaryCard
                  label="Tiempo estimado ahorrado"
                  value={formatTime(metrics.estimatedMinutesSaved)}
                  sublabel="basado en 3 min por conversación resuelta"
                  icon={<Clock className="h-4 w-4" />}
                  accent="info"
                />
              </div>
            </div>
          ) : null}
        </section>

        {/* M5.2 — Oportunidades de entrenamiento */}
        <section>
          <h2 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">
            Oportunidades de entrenamiento
          </h2>
          {opportunities.length === 0 ? (
            <div className="text-center py-8 px-4 bg-white rounded-xl border border-(--surface-border)">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-medium text-(--text-primary)">Tu agente está bien entrenado por ahora</p>
              <p className="text-xs text-(--text-secondary) mt-1">
                Aparecerán sugerencias cuando tus clientes pregunten algo que tu agente no sepa.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {opportunities.map(opp => (
                <TrainingOpportunityCard
                  key={opp.topicId}
                  topicId={opp.topicId}
                  topicName={opp.topicName}
                  escalationCount={opp.escalationCount}
                />
              ))}
            </div>
          )}
        </section>

        {/* Enviar resumen de prueba */}
        <section className="border-t border-(--surface-border) pt-4">
          <p className="text-xs text-(--text-tertiary) mb-3">
            Genera el resumen de hoy y envíalo por WhatsApp a tu número personal.
          </p>
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={sendTestSummary}
            disabled={sendingTest}
          >
            {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar resumen de prueba ahora
          </Button>
          {testResult && (
            <p className={`text-xs mt-2 text-center ${testResult.ok ? "text-emerald-700" : "text-red-600"}`}>
              {testResult.msg}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
