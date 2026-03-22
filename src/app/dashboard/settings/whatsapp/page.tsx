"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Loader2, Wifi, WifiOff, AlertTriangle } from "lucide-react";

type WStatus = "disconnected" | "connecting" | "connected" | "expired" | "error";
interface WhatsAppInfo { id: string; whatsapp_status: WStatus; whatsapp_phone_number_id: string | null; whatsapp_token_expires_at: string | null; activated_at: string | null; }

const STATUS_CFG: Record<WStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  connected:     { label: "Conectado",        color: "text-emerald-700",           bg: "bg-emerald-100",       Icon: Wifi },
  disconnected:  { label: "Desconectado",     color: "text-(--text-tertiary)",     bg: "bg-(--surface-muted)", Icon: WifiOff },
  connecting:    { label: "Conectando…",      color: "text-amber-600",             bg: "bg-amber-100",         Icon: Loader2 },
  expired:       { label: "Token expirado",   color: "text-(--color-error-700)",   bg: "bg-red-100",           Icon: AlertTriangle },
  error:         { label: "Error de conexión",color: "text-(--color-error-700)",   bg: "bg-red-100",           Icon: AlertTriangle },
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

  if (loading || !info) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin text-(--text-tertiary)" /></div>;

  const cfg = STATUS_CFG[info.whatsapp_status];
  const { Icon } = cfg;
  const isConnected = info.whatsapp_status === "connected";
  const needsAction = info.whatsapp_status === "expired" || info.whatsapp_status === "error";

  return (
    <div className="flex flex-col min-h-screen bg-(--surface-base) pb-24">
      <div className="sticky top-0 z-10 bg-(--surface-base) border-b border-(--surface-border) px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" className="text-(--text-secondary) hover:text-(--text-primary)"><ChevronLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-semibold text-(--text-primary)">Canal de WhatsApp</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-4">
        <div className="bg-white border border-(--surface-border) rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-10 w-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${cfg.color} ${info.whatsapp_status === "connecting" ? "animate-spin" : ""}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
              {info.whatsapp_phone_number_id && <p className="text-xs text-(--text-tertiary)">ID: {info.whatsapp_phone_number_id}</p>}
            </div>
          </div>
          {info.whatsapp_token_expires_at && <p className="text-xs text-(--text-secondary) border-t border-(--surface-border) pt-2">Token expira: {new Date(info.whatsapp_token_expires_at).toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })}</p>}
          {info.activated_at && <p className="text-xs text-(--text-secondary) mt-1">Conectado desde: {new Date(info.activated_at).toLocaleDateString("es-GT", { year: "numeric", month: "long", day: "numeric" })}</p>}
        </div>

        {needsAction && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{info.whatsapp_status === "expired" ? "Tu token expiró. Reconecta para seguir recibiendo mensajes." : "Hay un error con tu conexión. Reconecta para restaurar el servicio."}</p>
          </div>
        )}

        {!isConnected && <Button variant="primary" className="w-full" disabled>Reconectar WhatsApp</Button>}
        {isConnected && <Button variant="secondary" className="w-full" onClick={() => setConfirming(true)}>Desconectar canal</Button>}
        <p className="text-xs text-(--text-tertiary) px-1">Desconectar el canal no elimina tu historial de conversaciones ni el conocimiento de tu agente.</p>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-(--text-primary)">¿Desconectar el canal?</h3>
              <p className="text-sm text-(--text-secondary) mt-1">Tu agente dejará de recibir y responder mensajes. Tu historial y conocimiento quedan intactos.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)} disabled={acting}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDisconnect} disabled={acting}>
                {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Desconectar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
