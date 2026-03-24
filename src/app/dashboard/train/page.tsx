"use client";

import * as React from "react";
import Link from "next/link";
import { QuickInstruct } from "@/components/dashboard/QuickInstruct";
import { HistoryCard } from "@/components/dashboard/HistoryCard";
import { DeactivateModal } from "@/components/dashboard/DeactivateModal";
import { InstructionBubble } from "@/components/dashboard/InstructionBubble";
import { Icon } from "@/components/ui/Icon";
import { useTrainData } from "./useTrainData";
import { PageHeader } from "@/components/dashboard/PageHeader";

const fmt = (d: string) => new Date(d).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
const fmtFull = (d: string) => new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function TrainPage() {
  const { businessId, recentItems, opportunities, isLoading, toggling, confirmItem, setConfirmItem, requestToggle, executeToggle, invalidate } = useTrainData();
  const [prefillTopic, setPrefillTopic] = React.useState<string | null>(null);
  const instructRef = React.useRef<HTMLDivElement>(null);

  const handleOpportunityClick = (topicName: string) => {
    setPrefillTopic(topicName);
    instructRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto">
      <PageHeader title="Entrenar" />
      <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 pb-20">

        {!isLoading && recentItems.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instrucciones recientes</h2>
              <Link href="/dashboard/agent/history" className="text-xs font-medium text-[#3DC185] flex items-center gap-1 hover:underline">
                Ver todo <Icon name="solar:alt-arrow-right-linear" size={11} />
              </Link>
            </div>
            <div className="flex flex-col gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              {recentItems.slice(0, 3).map(item => (
                <React.Fragment key={item.id}>
                  <InstructionBubble content={item.content} topic={item.topic_name ?? undefined} source={item.source_type ?? undefined} time={fmt(item.created_at)} isOwner={true} />
                  <InstructionBubble content="" topic={item.topic_name ?? undefined} time={fmt(item.created_at)} isOwner={false} />
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        <section ref={instructRef} className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nueva instrucción</h2>
          {prefillTopic && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#3DC185]/10 border border-[#3DC185]/20 rounded-xl text-sm text-[#3DC185]">
              <Icon name="solar:lightbulb-linear" size={14} className="shrink-0" />
              <span className="flex-1">Entrenando sobre: <strong>{prefillTopic}</strong></span>
              <button onClick={() => setPrefillTopic(null)} className="p-0.5 rounded hover:bg-[#3DC185]/20 transition-colors">
                <Icon name="solar:close-circle-linear" size={14} />
              </button>
            </div>
          )}
          <QuickInstruct businessId={businessId ?? undefined} onSuccess={() => { setPrefillTopic(null); invalidate(); }} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Oportunidades de entrenamiento</h2>
          {isLoading && <div className="flex justify-center py-8"><Icon name="solar:refresh-linear" size={20} className="text-slate-300 animate-spin" /></div>}
          {!isLoading && opportunities.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center">
              <Icon name="solar:stars-linear" size={24} className="text-emerald-400" />
              <p className="text-sm font-semibold text-slate-900">Tu agente está bien entrenado</p>
              <p className="text-xs text-slate-500 max-w-xs">Aparecerán sugerencias cuando haya temas sin cubrir.</p>
            </div>
          )}
          {!isLoading && opportunities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {opportunities.map(topic => (
                <button key={topic.id} onClick={() => handleOpportunityClick(topic.name)} className="flex flex-col gap-3 p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl hover:shadow-sm hover:border-amber-300 transition-all text-left group">
                  <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center">
                    <Icon name="solar:brain-linear" size={17} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{topic.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sin instrucciones aún</p>
                  </div>
                  <span className="text-xs font-medium text-[#3DC185] flex items-center gap-1">Entrenar <Icon name="solar:alt-arrow-right-linear" size={11} /></span>
                </button>
              ))}
            </div>
          )}
        </section>

        {!isLoading && recentItems.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historial de aprendizaje</h2>
              <Link href="/dashboard/agent/history" className="text-xs font-medium text-[#3DC185] flex items-center gap-1 hover:underline">
                Ver todo <Icon name="solar:alt-arrow-right-linear" size={11} />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentItems.map(item => (
                <HistoryCard key={item.id} item={item} toggling={toggling === item.id} onToggle={requestToggle} formatDate={fmtFull} />
              ))}
            </div>
          </section>
        )}

      </div>
      {confirmItem && <DeactivateModal item={confirmItem} onConfirm={() => executeToggle(confirmItem, false)} onCancel={() => setConfirmItem(null)} />}
    </div>
  );
}
