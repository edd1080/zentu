"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

export type Period = "week" | "month" | "all";

export const PERIOD_LABELS: Record<Period, string> = {
  week: "Esta semana",
  month: "Este mes",
  all: "Todo el tiempo",
};

export interface Metrics {
  totalConversations: number;
  resolvedAutonomous: number;
  resolvedOwnerApproved: number;
  escalated: number;
  estimatedMinutesSaved: number;
}

export interface Opportunity {
  topicId: string;
  topicName: string;
  escalationCount: number;
}

export function useIntelligenceData() {
  const supabase = createClient();
  const [period, setPeriod] = React.useState<Period>("week");
  const [metrics, setMetrics] = React.useState<Metrics | null>(null);
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sendingTest, setSendingTest] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ ok: boolean; msg: string } | null>(null);

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (biz) setBusinessId(biz.id);
    })();
  }, []);

  React.useEffect(() => {
    if (!businessId) return;
    fetchMetrics(businessId, period);
    fetchOpportunities(businessId);
  }, [businessId, period]);

  async function fetchMetrics(bizId: string, p: Period) {
    setLoading(true);
    const now = new Date();
    const offset = p === "week" ? 7 : p === "month" ? 30 : null;
    const since = offset ? new Date(now.getTime() - offset * 86400000).toISOString() : "2000-01-01T00:00:00Z";
    const { data: convos } = await supabase.from("conversations").select("status, resolved_by").eq("business_id", bizId).gte("last_message_at", since);
    const list = convos || [];
    setMetrics({
      totalConversations: list.length,
      resolvedAutonomous: list.filter(c => c.resolved_by === "agent_autonomous").length,
      resolvedOwnerApproved: list.filter(c => c.resolved_by === "owner_approved" || c.resolved_by === "owner_manual").length,
      escalated: list.filter(c => ["escalated_informative", "escalated_sensitive", "escalated_urgent"].includes(c.status)).length,
      estimatedMinutesSaved: list.filter(c => c.resolved_by?.startsWith("owner") || c.resolved_by === "agent_autonomous").length * 3,
    });
    setLoading(false);
  }

  async function fetchOpportunities(bizId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const [{ data: escalations }, { data: weakTopics }] = await Promise.all([
      supabase.from("escalations").select("conversation_id, conversations!inner(business_id)").eq("conversations.business_id", bizId).gte("created_at", sevenDaysAgo),
      supabase.from("competency_topics").select("id, name").eq("business_id", bizId).eq("knowledge_count", 0).limit(5),
    ]);
    setOpportunities((weakTopics || []).map((t: any) => ({ topicId: t.id, topicName: t.name, escalationCount: (escalations || []).length > 0 ? 1 : 0 })));
  }

  async function sendTestSummary() {
    if (!businessId) return;
    setSendingTest(true); setTestResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-daily-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ business_id: businessId, date: new Date().toISOString().split("T")[0], type: "daily" }),
      });
      const json = await res.json();
      if (json.skipped) setTestResult({ ok: true, msg: "Sin actividad hoy — no se genera resumen." });
      else if (json.success) setTestResult({ ok: true, msg: json.whatsapp_sent ? "Resumen generado y enviado por WhatsApp." : `Resumen generado, WhatsApp no enviado: ${json.whatsapp_error}` });
      else setTestResult({ ok: false, msg: json.error || "Error desconocido" });
    } catch (e) { setTestResult({ ok: false, msg: String(e) }); }
    finally { setSendingTest(false); }
  }

  const formatTime = (mins: number) => mins >= 60 ? `${Math.round((mins / 60) * 10) / 10}h` : `${mins} min`;

  return { period, setPeriod, metrics, opportunities, loading, sendingTest, testResult, sendTestSummary, formatTime };
}
