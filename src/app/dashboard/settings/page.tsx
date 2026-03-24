"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { label: "General", items: [
    { href: "/dashboard/settings/profile",   icon: "solar:shop-linear",        label: "Perfil del negocio",   desc: "Nombre, horario, contacto" },
    { href: "/dashboard/settings/autonomy",  icon: "solar:bolt-linear",        label: "Autonomía del agente", desc: "Cuándo responde solo" },
    { href: "/dashboard/settings/plan",      icon: "solar:pie-chart-2-linear", label: "Plan y soporte",       desc: "Gestión de suscripción" },
  ]},
  { label: "Conexiones", items: [
    { href: "/dashboard/settings/whatsapp",      icon: "solar:chat-round-linear", label: "Canal de WhatsApp",  desc: "Conectado y activo" },
    { href: "/dashboard/settings/notifications", icon: "solar:bell-linear",       label: "Notificaciones",     desc: "Resúmenes y alertas" },
  ]},
];

function initials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function SettingItem({ href, icon, label, desc, last }: { href: string; icon: string; label: string; desc: string; last?: boolean }) {
  return (
    <Link href={href} className={cn("w-full flex items-center justify-between p-4 gap-4 hover:bg-slate-50/50 transition-colors group text-left", !last && "border-b border-slate-100/80")}>
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 shrink-0 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all shadow-sm">
          <Icon name={icon} size={20} />
        </div>
        <div>
          <p className="text-base font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <Icon name="solar:alt-arrow-right-linear" size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
    </Link>
  );
}

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [biz, setBiz] = React.useState<{ name: string; email: string } | null>(null);
  const [convCount, setConvCount] = React.useState<number | null>(null);
  const PLAN_LIMIT = 500;

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("businesses").select("id, name").eq("owner_id", user.id).single();
      if (!data) return;
      setBiz({ name: data.name || "Mi Negocio", email: user.email || "" });
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase.from("conversations").select("id", { count: "exact", head: true })
        .eq("business_id", data.id).gte("created_at", monthStart);
      setConvCount(count ?? 0);
    })();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const pct = convCount !== null ? Math.min(Math.round((convCount / PLAN_LIMIT) * 100), 100) : 0;

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto">
      {/* Gradient Banner */}
      <div className="bg-gradient-to-b from-[#3DC185] to-[#2d9e6c] pt-8 pb-24 px-5 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none"><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg></div>
        <div className="max-w-2xl mx-auto flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 p-1 backdrop-blur-sm shrink-0">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#3DC185] text-xl font-semibold tracking-tight">
                {initials(biz?.name || "MB")}
              </div>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-medium tracking-tight">{biz?.name || "Mi Negocio"}</h2>
              <p className="text-sm text-white/80 mt-0.5">{biz?.email || ""}</p>
            </div>
          </div>
          <Link href="/dashboard/settings/profile" className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-colors mt-1">
            <Icon name="solar:pen-linear" size={18} className="opacity-90" />
          </Link>
        </div>
      </div>

      {/* Overlapping content */}
      <div className="max-w-2xl mx-auto w-full px-4 -mt-16 relative z-20 pb-24 flex flex-col gap-6">
        {/* Plan card */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Icon name="solar:medal-star-linear" size={20} />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-900 tracking-tight">Plan Piloto</h3>
                <p className="text-sm text-slate-500">Período de piloto</p>
              </div>
            </div>
            <Link href="/dashboard/settings/plan" className="text-sm font-medium text-[#3DC185] hover:text-[#2a9465] transition-colors">Ver detalles</Link>
          </div>
          <div className="w-full border-t border-dashed border-slate-200 mb-5" />
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div>
              <p className="text-[28px] font-medium text-slate-900 tracking-tight leading-none">{convCount !== null ? convCount.toLocaleString() : "—"}</p>
              <p className="text-sm text-slate-500 mt-2">Mensajes este mes</p>
            </div>
            <div>
              <p className="text-[28px] font-medium text-slate-900 tracking-tight leading-none">{PLAN_LIMIT}</p>
              <p className="text-sm text-slate-500 mt-2">Límite del plan</p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#3DC185] to-[#2d9e6c] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2 italic">{pct >= 80 ? "Estás cerca del límite del mes." : `${PLAN_LIMIT - (convCount ?? 0)} mensajes disponibles este mes.`}</p>
        </div>

        {/* Settings sections */}
        {SECTIONS.map(sec => (
          <div key={sec.label} className="space-y-2">
            <h4 className="text-sm font-medium text-slate-500 px-2 tracking-wide">{sec.label}</h4>
            <div className="bg-white rounded-[24px] ring-1 ring-slate-200/50 overflow-hidden shadow-sm">
              {sec.items.map((item, i) => <SettingItem key={item.href} {...item} last={i === sec.items.length - 1} />)}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 bg-white rounded-[24px] ring-1 ring-slate-200/50 shadow-sm hover:bg-red-50/50 transition-colors group text-left">
          <div className="w-11 h-11 shrink-0 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100/50">
            <Icon name="solar:logout-linear" size={20} />
          </div>
          <p className="text-base font-medium text-red-500">Cerrar sesión</p>
        </button>
      </div>
    </div>
  );
}
