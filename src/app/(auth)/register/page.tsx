"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";

const INPUT_CLS = "w-full px-5 h-12 bg-[#FCFDFD] border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#3DC185] focus:border-[#3DC185] transition-all placeholder:text-slate-400 text-slate-800";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phonePersonal, setPhonePersonal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, phonePersonal: phonePersonal || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al crear la cuenta"); setLoading(false); return; }
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { router.push("/login?registered=true"); return; }
      router.push(phonePersonal ? "/verify-phone" : "/onboarding");
      router.refresh();
    } catch { setError("Error de conexión. Intenta de nuevo."); setLoading(false); }
  }

  async function handleGoogleRegister() {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError("Error al conectar con Google");
  }

  return (
    <>
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Registro</h1>
        <p className="text-sm text-slate-800 leading-relaxed">Crea tu cuenta y configura tu agente.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 flex items-center gap-2">
          <Icon name="solar:close-circle-linear" size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-500">Nombre completo</label>
          <input type="text" placeholder="Tu nombre" value={fullName} onChange={e => setFullName(e.target.value)} required className={INPUT_CLS} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-500">Correo electrónico</label>
          <input type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} required className={INPUT_CLS} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-500">Contraseña</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full pl-5 pr-14 h-12 bg-[#FCFDFD] border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#3DC185] focus:border-[#3DC185] transition-all placeholder:text-slate-400 text-slate-800" />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              <Icon name={showPw ? "solar:eye-closed-linear" : "solar:eye-linear"} size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-1.5 pb-2">
          <label className="block text-xs font-medium text-slate-500">WhatsApp personal <span className="text-slate-400 font-normal">(Opcional)</span></label>
          <input type="tel" placeholder="+502 1234 5678" value={phonePersonal} onChange={e => setPhonePersonal(e.target.value)} className={INPUT_CLS} />
          <p className="text-[11px] text-slate-400 pl-1">Para recibir notificaciones urgentes y resúmenes diarios</p>
        </div>
        <button type="submit" disabled={loading}
          className="w-full h-12 bg-[#3DC185] hover:bg-[#32a873] text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-sm uppercase tracking-wider flex items-center justify-center disabled:opacity-60">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <div className="mt-8 mb-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-500">o continuar con</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      <div className="pb-4">
        <button type="button" onClick={handleGoogleRegister}
          className="w-full h-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 font-medium text-sm">
          <Icon name="logos:google-icon" size={20} /> Google
        </button>
      </div>

      <p className="mt-2 text-center text-sm text-slate-800">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-[#3DC185] hover:text-[#2a9465] transition-colors">Ingresar</Link>
      </p>
    </>
  );
}
