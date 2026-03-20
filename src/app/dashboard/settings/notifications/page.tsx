"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { ChevronLeft, Loader2 } from "lucide-react";

interface NotifPrefs { id: string; notification_hour: number; quiet_hours_start: number; quiet_hours_end: number; notify_training_alerts: boolean; }

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? "PM" : "AM";
  const h = i > 12 ? i - 12 : i === 0 ? 12 : i;
  return { value: i, label: `${h}:00 ${ampm}` };
});

function HourSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <select className="w-full text-sm border border-(--surface-border) rounded-lg px-3 py-2 text-(--text-primary) bg-white"
      value={value} onChange={e => onChange(Number(e.target.value))}>
      {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
    </select>
  );
}

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
        toast({ message: "Listo.", type: "success" });
      } catch { toast({ message: "Algo salió mal. Intenta de nuevo.", type: "error" }); }
      finally { setSaving(false); }
    }, 800);
  }

  if (!prefs) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin text-(--text-tertiary)" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-(--surface-base) pb-24">
      <div className="sticky top-0 z-10 bg-(--surface-base) border-b border-(--surface-border) px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" className="text-(--text-secondary) hover:text-(--text-primary)"><ChevronLeft className="h-5 w-5" /></Link>
            <h1 className="text-lg font-semibold text-(--text-primary)">Notificaciones</h1>
          </div>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-(--text-tertiary)" />}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        <div className="bg-white border border-(--surface-border) rounded-xl p-4">
          <p className="text-sm font-medium text-(--text-primary) mb-1">¿A qué hora quieres recibir tu resumen diario por WhatsApp?</p>
          <p className="text-xs text-(--text-secondary) mb-3">Recibirás un resumen de la actividad del día a esta hora.</p>
          <HourSelect value={prefs.notification_hour} onChange={v => update({ notification_hour: v })} />
        </div>

        <div className="bg-white border border-(--surface-border) rounded-xl p-4">
          <p className="text-sm font-medium text-(--text-primary) mb-1">¿Cuándo prefieres no recibir avisos?</p>
          <p className="text-xs text-(--text-secondary) mb-3">Las situaciones urgentes siempre te llegarán.</p>
          <div className="flex items-center gap-3">
            <div className="flex-1"><p className="text-xs text-(--text-tertiary) mb-1">Desde</p><HourSelect value={prefs.quiet_hours_start} onChange={v => update({ quiet_hours_start: v })} /></div>
            <span className="text-sm text-(--text-tertiary) mt-4">hasta</span>
            <div className="flex-1"><p className="text-xs text-(--text-tertiary) mb-1">Hasta</p><HourSelect value={prefs.quiet_hours_end} onChange={v => update({ quiet_hours_end: v })} /></div>
          </div>
        </div>

        <div className="bg-white border border-(--surface-border) rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-(--text-primary)">Avisarme cuando mi agente necesite aprender algo nuevo</p>
              <p className="text-xs text-(--text-secondary) mt-0.5">Recibirás una notificación cuando haya oportunidades de entrenamiento.</p>
            </div>
            <button role="switch" aria-checked={prefs.notify_training_alerts}
              onClick={() => update({ notify_training_alerts: !prefs.notify_training_alerts })}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${prefs.notify_training_alerts ? "bg-(--color-primary-700)" : "bg-(--surface-border)"}`}>
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${prefs.notify_training_alerts ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
