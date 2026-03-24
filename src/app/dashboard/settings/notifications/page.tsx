"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

interface NotifPrefs { id: string; notification_hour: number; quiet_hours_start: number; quiet_hours_end: number; notify_training_alerts: boolean; }

function toTime(h: number) { return `${String(h).padStart(2, "0")}:00`; }
function fromTime(t: string) { return parseInt(t.split(":")[0], 10); }

const TIME_INPUT = "bg-white border border-slate-200 rounded-xl px-4 py-2 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DC185]/20 focus:border-[#3DC185] transition-all";

export default function NotificationsPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [prefs, setPrefs] = React.useState<NotifPrefs | null>(null);
  const [saving, setSaving] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("businesses")
        .select("id, notification_hour, quiet_hours_start, quiet_hours_end, notify_training_alerts")
        .eq("owner_id", user.id).single();
      if (data) setPrefs(data as unknown as NotifPrefs);
    }
    load();
  }, []);

  function update(patch: Partial<NotifPrefs>) {
    setPrefs(prev => prev ? { ...prev, ...patch } : prev);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-business-profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error();
        toast({ message: "Ajustes guardados.", type: "success" });
      } catch { toast({ message: "Algo salió mal. Intenta de nuevo.", type: "error" }); }
      finally { setSaving(false); }
    }, 800);
  }

  if (!prefs) return (
    <div className="flex items-center justify-center h-full">
      <Icon name="solar:refresh-linear" size={24} className="text-slate-300 animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" className="text-slate-400 hover:text-slate-900 transition-colors">
              <Icon name="solar:arrow-left-linear" size={18} />
            </Link>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Notificaciones</h1>
          </div>
          {saving && <Icon name="solar:refresh-linear" size={14} className="text-slate-300 animate-spin" />}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 p-6 space-y-8">
          {/* Daily summary */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Icon name="solar:document-text-linear" size={18} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-900">Resumen diario</h3>
                <p className="text-sm text-slate-500">A qué hora quieres recibir el reporte de actividad.</p>
              </div>
            </div>
            <div className="ml-11">
              <input type="time" className={TIME_INPUT} value={toTime(prefs.notification_hour)}
                onChange={e => update({ notification_hour: fromTime(e.target.value) })} />
            </div>
          </div>

          <div className="w-full border-t border-slate-100" />

          {/* Quiet hours */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Icon name="solar:moon-linear" size={18} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-900">Horas de silencio</h3>
                <p className="text-sm text-slate-500">No recibirás notificaciones no urgentes en este horario.</p>
              </div>
            </div>
            <div className="ml-11 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500 px-1">Desde</span>
                <input type="time" className={TIME_INPUT} value={toTime(prefs.quiet_hours_start)}
                  onChange={e => update({ quiet_hours_start: fromTime(e.target.value) })} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500 px-1">Hasta</span>
                <input type="time" className={TIME_INPUT} value={toTime(prefs.quiet_hours_end)}
                  onChange={e => update({ quiet_hours_end: fromTime(e.target.value) })} />
              </div>
            </div>
          </div>

          <div className="w-full border-t border-slate-100" />

          {/* Training alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Icon name="solar:magic-stick-3-linear" size={18} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-900">Alertas de entrenamiento</h3>
                <p className="text-sm text-slate-500">Aviso cuando el agente detecte áreas a mejorar.</p>
              </div>
            </div>
            <label className="relative flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={prefs.notify_training_alerts}
                onChange={() => update({ notify_training_alerts: !prefs.notify_training_alerts })} />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#3DC185] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:border-white" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
