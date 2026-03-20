"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PlanPage() {
  const supabase = createClient();
  const [convCount, setConvCount] = React.useState<number | null>(null);
  const PLAN_LIMIT = 500;
  const PLAN_NAME = "Piloto";

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (!biz) return;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("business_id", biz.id)
        .gte("created_at", monthStart);
      setConvCount(count ?? 0);
    }
    load();
  }, []);

  const pct = convCount !== null ? Math.min(Math.round((convCount / PLAN_LIMIT) * 100), 100) : 0;
  const barColor = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-(--color-primary-700)";

  return (
    <div className="flex flex-col min-h-screen bg-(--surface-base) pb-24">
      <div className="sticky top-0 z-10 bg-(--surface-base) border-b border-(--surface-border) px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" className="text-(--text-secondary) hover:text-(--text-primary)">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-(--text-primary)">Plan y soporte</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        {/* Plan actual */}
        <div className="bg-white border border-(--surface-border) rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-(--text-primary)">Plan {PLAN_NAME}</p>
              <p className="text-xs text-(--text-secondary)">Período de piloto</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">Activo</span>
          </div>

          {/* Usage bar */}
          <div>
            <div className="flex justify-between text-xs text-(--text-secondary) mb-1.5">
              <span>Conversaciones este mes</span>
              {convCount !== null
                ? <span className={pct >= 100 ? "text-red-600 font-medium" : ""}>{convCount} / {PLAN_LIMIT}</span>
                : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </div>
            <div className="h-2 bg-(--surface-muted) rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            {pct >= 100 && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">Has alcanzado el límite del plan. Habla con nosotros para ampliar.</p>
            )}
            {pct >= 80 && pct < 100 && (
              <p className="text-xs text-amber-600 mt-1.5">Estás cerca del límite del plan para este mes.</p>
            )}
          </div>
        </div>

        {/* Ver opciones */}
        <div className="bg-white border border-(--surface-border) rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-(--text-primary)">¿Quieres más capacidad?</p>
          <p className="text-xs text-(--text-secondary)">
            En el piloto gestionamos los upgrades de forma personalizada. Contáctanos y te ayudamos.
          </p>
          <Button variant="secondary" className="w-full" disabled>
            Ver opciones de plan
          </Button>
        </div>

        {/* Soporte */}
        <div className="bg-white border border-(--surface-border) rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-(--text-primary)">Soporte</p>
          <Button variant="secondary" className="w-full" disabled>
            Enviar mensaje al equipo
          </Button>
          <p className="text-xs text-(--text-tertiary) text-center">
            También puedes escribirnos directamente a tu contacto de AGENTI.
          </p>
        </div>
      </div>
    </div>
  );
}
