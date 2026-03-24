"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { ScheduleEditor } from "@/components/dashboard/ScheduleEditor";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type Schedule = Record<string, { open: string; close: string; closed?: boolean }>;
interface BusinessProfile { id: string; name: string; description: string | null; address: string | null; phone_business: string | null; schedule: Schedule | null; }

function initials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const FIELDS = [
  { key: "name", label: "Nombre del negocio" },
  { key: "description", label: "Descripción corta" },
  { key: "phone_business", label: "Teléfono principal" },
  { key: "address", label: "Dirección" },
] as const;

const INPUT_EDIT = "w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3DC185]/20 focus:border-[#3DC185] transition-all";

export default function ProfilePage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<BusinessProfile | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<BusinessProfile | null>(null);

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("businesses").select("id, name, description, address, phone_business, schedule").eq("owner_id", user.id).single();
      if (data) { const p = data as unknown as BusinessProfile; setProfile(p); setForm(p); }
    })();
  }, []);

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-business-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ name: form.name, description: form.description, address: form.address, phone_business: form.phone_business, schedule: form.schedule }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      setProfile(form); setEditing(false);
      toast({ message: json.schedule_updated ? "Tu agente ya conoce el nuevo horario." : "Perfil actualizado.", type: "success" });
    } catch (e) {
      toast({ message: `Error al guardar. ${e instanceof Error ? e.message : ""}`, type: "error" });
    } finally { setSaving(false); }
  }

  if (!profile || !form) return (
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
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Perfil del negocio</h1>
          </div>
          {!editing ? (
            <button onClick={() => { setForm(profile); setEditing(true); }} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <Icon name="solar:pen-linear" size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { setForm(profile); setEditing(false); }} className="text-sm text-slate-500 hover:text-slate-700 px-2 py-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="h-8 px-4 rounded-lg bg-[#3DC185] hover:bg-[#32a873] text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors">
                {saving && <Icon name="solar:refresh-linear" size={13} className="animate-spin" />}
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 flex flex-col gap-6">
        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 p-6 space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3DC185] text-xl font-medium tracking-tight shrink-0">
              {initials(profile.name || "MB")}
            </div>
            <div>
              <button disabled className="text-sm font-medium text-[#3DC185] opacity-50 cursor-not-allowed">Cambiar logo</button>
              <p className="text-xs text-slate-500 mt-0.5">Recomendado: 512x512px</p>
            </div>
          </div>
          <div className="space-y-4">
            {FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 px-1">{label}</label>
                {editing ? (
                  <input className={INPUT_EDIT} value={(form[key] as string) || ""}
                    onChange={e => setForm(prev => prev ? { ...prev, [key]: e.target.value } : prev)} />
                ) : (
                  <p className={cn("text-base text-slate-900 px-1", !(profile[key] as string) && "text-slate-400 italic text-sm")}>
                    {(profile[key] as string) || "Sin información"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 p-6">
          <div className="mb-5">
            <h3 className="text-base font-medium text-slate-900">Horario de atención</h3>
            <p className="text-sm text-slate-500 mt-1">Tu agente usará este horario para informar a los clientes.</p>
          </div>
          <ScheduleEditor schedule={form.schedule} editing={editing} onChange={s => setForm(prev => prev ? { ...prev, schedule: s } : prev)} />
          {editing && <p className="text-xs text-slate-400 mt-3 px-1">Al guardar, tu agente aprenderá el nuevo horario automáticamente.</p>}
        </div>
      </div>
    </div>
  );
}
