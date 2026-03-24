"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export default function PlanPage() {
  const supabase = createClient();
  const [convCount, setConvCount] = React.useState<number | null>(null);
  const PLAN_LIMIT = 500;

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (!biz) return;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase.from("conversations").select("id", { count: "exact", head: true })
        .eq("business_id", biz.id).gte("created_at", monthStart);
      setConvCount(count ?? 0);
    }
    load();
  }, []);

  const pct = convCount !== null ? Math.min(Math.round((convCount / PLAN_LIMIT) * 100), 100) : 0;
  const remaining = convCount !== null ? PLAN_LIMIT - convCount : null;
  const barColor = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-[#3DC185]";

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" className="text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="solar:arrow-left-linear" size={18} />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Plan y soporte</h1>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 flex flex-col gap-6">
        {/* Current plan */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-slate-900 tracking-tight">Plan Piloto</h2>
              <p className="text-sm text-slate-500 mt-1">Suscripción actual</p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50 text-xs py-1 px-2.5 rounded-full font-medium">Activo</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-900">
                {convCount !== null ? convCount : <Icon name="solar:refresh-linear" size={13} className="animate-spin text-slate-300 inline" />}
                <span className="text-slate-500 font-normal"> / {PLAN_LIMIT} msjs</span>
              </span>
              {remaining !== null && <span className="text-slate-500">Quedan {remaining}</span>}
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-slate-500 pt-1">
              {pct >= 100 ? "Has alcanzado el límite del plan. Habla con nosotros para ampliar." : `Has usado el ${pct}% de tu límite mensual.`}
            </p>
          </div>
        </div>

        {/* Ampliar plan */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 p-6">
          <h3 className="text-base font-medium text-slate-900">Ampliar plan</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Aumenta tu límite de mensajes y accede a funciones avanzadas como múltiples agentes o integraciones extra.</p>
          <button disabled className="px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">Ver opciones de plan</button>
          <p className="text-xs text-slate-400 mt-3 italic">* Las opciones de mejora estarán disponibles al finalizar el piloto.</p>
        </div>

        {/* Support */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="solar:headphones-round-sound-linear" size={20} className="text-slate-400" />
            <h3 className="text-base font-medium text-slate-900">Soporte técnico</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1 mb-4">¿Tienes dudas o algún problema? Durante la fase piloto, puedes escribir directamente a tu contacto asignado en AGENTI.</p>
          <button disabled className="px-5 py-2.5 border border-slate-200 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">Enviar mensaje al equipo</button>
        </div>
      </div>
    </div>
  );
}
