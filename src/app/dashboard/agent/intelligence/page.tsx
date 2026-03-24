"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { useIntelligenceData, PERIOD_LABELS, type Period } from "./useIntelligenceData";

const METRIC_CFG = [
  { label: "Conversaciones",    icon: "solar:chat-round-line-linear", iconBg: "bg-slate-50",   iconColor: "text-slate-400"   },
  { label: "Resueltas solas",   icon: "solar:bolt-linear",            iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
  { label: "Con tu aprobación", icon: "solar:check-read-linear",      iconBg: "bg-blue-50",    iconColor: "text-blue-500"    },
  { label: "Escaladas",         icon: "solar:danger-circle-linear",   iconBg: "bg-amber-50",   iconColor: "text-amber-500"   },
];
const OPP_COLORS = [
  { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100/50", icon: "solar:box-minimalistic-linear" },
  { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100/50", icon: "solar:shield-warning-linear"  },
  { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100/50",   icon: "solar:info-circle-linear"     },
  { bg: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-100/50",   icon: "solar:stars-linear"           },
];

export default function IntelligencePage() {
  const { period, setPeriod, metrics, opportunities, loading, sendingTest, testResult, sendTestSummary, formatTime } = useIntelligenceData();

  const vals = metrics ? [metrics.totalConversations, metrics.resolvedAutonomous, metrics.resolvedOwnerApproved, metrics.escalated] : [0,0,0,0];
  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agent" className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Icon name="solar:arrow-left-linear" size={20} />
          </Link>
          <h1 className="text-base font-semibold tracking-tight text-slate-900">Inteligencia</h1>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto p-4 pb-24 space-y-8">
        {/* Period selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                period === p
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Metrics grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="solar:refresh-linear" size={24} className="text-slate-300 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {METRIC_CFG.map((m, i) => (
              <div key={m.label} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-500">{m.label}</span>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-3xl font-semibold tracking-tight text-slate-900">{vals[i]}</span>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-0.5", m.iconBg)}>
                    <Icon name={m.icon} size={18} className={m.iconColor} />
                  </div>
                </div>
              </div>
            ))}
            <div className="col-span-2 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border border-emerald-200/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Icon name="solar:clock-circle-linear" size={18} className="text-emerald-600" />
                  Tiempo estimado ahorrado
                </h3>
                <p className="text-[11px] text-slate-500">Basado en 3 min por conversación (resueltas + aprobadas)</p>
              </div>
              <span className="text-3xl font-semibold tracking-tight text-emerald-700">{metrics ? formatTime(metrics.estimatedMinutesSaved) : "0 min"}</span>
            </div>
          </div>
        )}

        {/* Training opportunities */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight px-1 flex items-center justify-between">
            Oportunidades de entrenamiento
            {opportunities.length > 0 && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{opportunities.length} pendientes</span>
            )}
          </h2>
          {opportunities.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200/60 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
              <Icon name="solar:stars-linear" size={24} className="text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Tu agente está bien entrenado por ahora</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto">Aparecerán sugerencias cuando tus clientes pregunten algo que tu agente no sepa.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              {opportunities.map((opp, i) => {
                const c = OPP_COLORS[i % OPP_COLORS.length];
                return (
                  <div key={opp.topicId} className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50/50 transition-colors group", i < opportunities.length - 1 && "border-b border-slate-100/80")}>
                    <div className="flex items-center gap-3.5">
                      <div className={cn("w-10 h-10 shrink-0 rounded-full flex items-center justify-center border", c.bg, c.text, c.border)}>
                        <Icon name={c.icon} size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{opp.topicName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{opp.escalationCount > 0 ? "El agente no sabe cómo manejar esto aún." : "Área de negocio sin cubrir."}</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/train?topic=${encodeURIComponent(opp.topicName)}`}
                      className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 shadow-sm text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shrink-0 group-hover:border-slate-300">
                      <Icon name="solar:magic-stick-3-linear" size={14} />
                      Entrenar
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WhatsApp summary */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div className="max-w-sm">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icon name="solar:smartphone-update-linear" size={18} className="text-emerald-400" />
                Resumen en WhatsApp
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Recibe ahora mismo un mensaje en tu WhatsApp con el resumen de actividad y las métricas clave del día.</p>
            </div>
            <div className="w-full md:w-auto flex flex-col items-center gap-2 shrink-0">
              <button onClick={sendTestSummary} disabled={sendingTest}
                className="w-full md:w-auto px-5 py-2.5 bg-white text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50">
                {sendingTest ? <Icon name="solar:refresh-linear" size={15} className="animate-spin" /> : <Icon name="solar:plain-2-linear" size={15} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />}
                Enviar resumen de prueba
              </button>
              {testResult && <p className={cn("text-[11px] font-medium", testResult.ok ? "text-emerald-400" : "text-red-400")}>{testResult.msg}</p>}
            </div>
          </div>
        </div>
      </div></div>
  );
}
