"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type WStatus = "disconnected" | "connecting" | "connected" | "expired" | "error";
interface WhatsAppInfo { id: string; whatsapp_status: WStatus; whatsapp_phone_number_id: string | null; whatsapp_token_expires_at: string | null; activated_at: string | null; }
function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between items-center text-sm"><span className="text-slate-500">{label}</span><span className="font-medium text-slate-900 text-xs">{value}</span></div>;
}

type CFG = { sub: string; iconBg: string; iconColor: string; icon: string; dot?: string; spin?: boolean };
const STATUS_CFG: Record<WStatus, CFG> = {
  connected:    { sub: "Conectado correctamente", iconBg: "bg-emerald-50", iconColor: "text-emerald-500", icon: "solar:wi-fi-linear", dot: "bg-emerald-500" },
  disconnected: { sub: "Desconectado",            iconBg: "bg-slate-100",  iconColor: "text-slate-400",   icon: "solar:wi-fi-linear" },
  connecting:   { sub: "Conectando…",             iconBg: "bg-amber-50",   iconColor: "text-amber-500",   icon: "solar:refresh-linear", spin: true },
  expired:      { sub: "Token expirado",          iconBg: "bg-red-50",     iconColor: "text-red-500",     icon: "solar:danger-triangle-linear" },
  error:        { sub: "Error de conexión",       iconBg: "bg-red-50",     iconColor: "text-red-500",     icon: "solar:danger-triangle-linear" },
};

export default function WhatsAppPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [info, setInfo] = React.useState<WhatsAppInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [confirming, setConfirming] = React.useState(false);
  const [acting, setActing] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("businesses")
        .select("id, whatsapp_status, whatsapp_phone_number_id, whatsapp_token_expires_at, activated_at")
        .eq("owner_id", user.id).single();
      if (data) setInfo(data as unknown as WhatsAppInfo);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDisconnect() {
    if (!info) return;
    setActing(true);
    try {
      const { error } = await supabase.from("businesses").update({
        whatsapp_status: "disconnected", whatsapp_phone_number_id: null,
        whatsapp_waba_id: null, whatsapp_access_token: null, whatsapp_token_expires_at: null,
      }).eq("id", info.id);
      if (error) throw error;
      setInfo(prev => prev ? { ...prev, whatsapp_status: "disconnected", whatsapp_phone_number_id: null } : prev);
      setConfirming(false);
      toast({ message: "Canal desconectado. Tu historial de conversaciones está intacto.", type: "success" });
    } catch { toast({ message: "Algo salió mal al desconectar. Intenta de nuevo.", type: "error" }); }
    finally { setActing(false); }
  }

  if (loading || !info) return (
    <div className="flex items-center justify-center h-full">
      <Icon name="solar:refresh-linear" size={24} className="text-slate-300 animate-spin" />
    </div>
  );

  const cfg = STATUS_CFG[info.whatsapp_status];
  const isConnected = info.whatsapp_status === "connected";
  const needsAction = info.whatsapp_status === "expired" || info.whatsapp_status === "error";

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" className="text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="solar:arrow-left-linear" size={18} />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Canal de WhatsApp</h1>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", cfg.iconBg)}>
              <Icon name={cfg.icon} size={24} className={cn(cfg.iconColor, cfg.spin && "animate-spin")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-slate-900 tracking-tight">Estado de conexión</h2>
                {cfg.dot && <span className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]", cfg.dot)} />}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{cfg.sub}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
            {info.whatsapp_phone_number_id && <InfoRow label="Número conectado" value={info.whatsapp_phone_number_id} />}
            {info.whatsapp_token_expires_at && <InfoRow label="Token expira" value={new Date(info.whatsapp_token_expires_at).toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })} />}
            {info.activated_at && <InfoRow label="Conectado desde" value={new Date(info.activated_at).toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })} />}
          </div>

          {needsAction && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-4">
              <Icon name="solar:danger-triangle-linear" size={15} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                {info.whatsapp_status === "expired" ? "Tu token expiró. Reconecta para seguir recibiendo mensajes." : "Hay un error con tu conexión. Reconecta para restaurar el servicio."}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button disabled className="px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">
              Reconectar WhatsApp
            </button>
            {isConnected && (
              <button onClick={() => setConfirming(true)} className="px-5 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium transition-colors">
                Desconectar canal
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-3">Desconectar el canal no elimina tu historial de conversaciones ni el conocimiento de tu agente.</p>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirming(false)} />
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4 text-rose-500">
              <Icon name="solar:danger-triangle-linear" size={24} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">¿Desconectar canal?</h3>
            <p className="text-sm text-slate-500 mb-6">El agente dejará de recibir y responder mensajes inmediatamente. Tu historial y el conocimiento del agente permanecerán guardados.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(false)} disabled={acting} className="flex-1 py-2.5 px-4 bg-slate-50 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors text-sm disabled:opacity-50">Cancelar</button>
              <button onClick={handleDisconnect} disabled={acting} className="flex-1 py-2.5 px-4 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {acting && <Icon name="solar:refresh-linear" size={14} className="animate-spin" />}
                Desconectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
