"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ScheduleEditor } from "@/components/dashboard/ScheduleEditor";
import { ChevronLeft, Loader2, Pencil } from "lucide-react";

type Schedule = Record<string, { open: string; close: string; closed?: boolean }>;
interface BusinessProfile {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone_business: string | null;
  schedule: Schedule | null;
}

const BASIC_FIELDS = [
  { key: "name", label: "Nombre del negocio" },
  { key: "description", label: "Descripción" },
  { key: "address", label: "Dirección" },
  { key: "phone_business", label: "Teléfono" },
] as const;

export default function ProfilePage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<BusinessProfile | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<BusinessProfile | null>(null);

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("businesses")
        .select("id, name, description, address, phone_business, schedule")
        .eq("owner_id", user.id).single();
      if (data) { const p = data as unknown as BusinessProfile; setProfile(p); setForm(p); }
    }
    load();
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
      setProfile(form);
      setEditing(false);
      toast({ message: json.schedule_updated ? "Listo. Tu agente ya conoce el nuevo horario." : "Listo.", type: "success" });
    } catch (e) {
      toast({ message: `Algo salió mal al guardar. ${e instanceof Error ? e.message : ""}`, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (!profile || !form) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin text-(--text-tertiary)" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-(--surface-base) pb-24">
      <div className="sticky top-0 z-10 bg-(--surface-base) border-b border-(--surface-border) px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" className="text-(--text-secondary) hover:text-(--text-primary)"><ChevronLeft className="h-5 w-5" /></Link>
            <h1 className="text-lg font-semibold text-(--text-primary)">Perfil del negocio</h1>
          </div>
          {!editing ? (
            <button onClick={() => { setForm(profile); setEditing(true); }} className="flex items-center gap-1.5 text-sm text-(--color-primary-700) font-medium">
              <Pencil className="h-4 w-4" /> Editar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { setForm(profile); setEditing(false); }} className="text-sm text-(--text-secondary)">Cancelar</button>
              <Button variant="primary" className="h-8 text-sm min-h-0" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Guardar"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        <section className="bg-white border border-(--surface-border) rounded-xl overflow-hidden">
          {BASIC_FIELDS.map(({ key, label }) => (
            <div key={key} className="px-4 py-3 border-b border-(--surface-border) last:border-0">
              <p className="text-xs text-(--text-tertiary) font-medium mb-1">{label}</p>
              {editing ? (
                <input className="w-full text-sm text-(--text-primary) bg-transparent outline-none border-b border-(--color-primary-300) pb-0.5"
                  value={(form[key] as string) || ""}
                  onChange={e => setForm(prev => prev ? { ...prev, [key]: e.target.value } : prev)} />
              ) : (
                <p className="text-sm text-(--text-primary)">
                  {(profile[key] as string) || <span className="text-(--text-tertiary) italic">Sin información</span>}
                </p>
              )}
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide mb-3">Horario</h2>
          <ScheduleEditor
            schedule={form.schedule}
            editing={editing}
            onChange={schedule => setForm(prev => prev ? { ...prev, schedule } : prev)}
          />
          {editing && <p className="text-xs text-(--text-tertiary) mt-2 px-1">Al guardar, tu agente aprenderá el nuevo horario automáticamente.</p>}
        </section>
      </div>
    </div>
  );
}
