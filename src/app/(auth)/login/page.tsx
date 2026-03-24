"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/google-button";
import { Icon } from "@/components/ui/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError("Correo o contraseña incorrectos"); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
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
      <div className="absolute top-8 right-6 sm:right-10 w-10 h-10 rounded-xl bg-[#3DC185] flex items-center justify-center text-white shadow-sm">
        <Icon name="solar:sparkles-bold-duotone" size={20} />
      </div>

      <div className="mt-8 mb-8">
        <h1 className="text-4xl font-semibold text-[#3DC185] tracking-tight mb-3">Bienvenido,</h1>
        <p className="text-sm text-slate-800 leading-relaxed pr-12">Inicia sesión para manejar el Agente IA del WhatsApp de tu empresa.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 flex items-center gap-2">
          <Icon name="solar:close-circle-linear" size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
          <input type="email" placeholder="stanley.cohen@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-5 h-12 bg-[#FCFDFD] border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#3DC185] focus:border-[#3DC185] transition-all placeholder:text-slate-400 text-slate-800" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Contraseña</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full pl-5 pr-14 h-12 bg-[#FCFDFD] border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#3DC185] focus:border-[#3DC185] transition-all placeholder:text-slate-400 text-slate-800" />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              <Icon name={showPw ? "solar:eye-closed-linear" : "solar:eye-linear"} size={18} />
            </button>
          </div>
        </div>
        <div className="text-center pt-1 pb-1">
          <button type="button" className="text-sm font-medium text-[#3DC185] hover:text-[#2a9465] transition-colors">¿Olvidaste tu contraseña?</button>
        </div>
        <button type="submit" disabled={loading}
          className="w-full h-12 bg-[#3DC185] hover:bg-[#32a873] text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-sm uppercase tracking-wider flex items-center justify-center disabled:opacity-60">
          {loading ? "Ingresando..." : "Log In"}
        </button>
      </form>

      <div className="mt-8 mb-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-500">or sign in with</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      <div className="flex items-center justify-center gap-4 pb-4">
        <button type="button" onClick={handleGoogleLogin} className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-95">
          <Icon name="logos:google-icon" size={20} />
        </button>
      </div>

      <p className="text-center text-sm text-slate-800 mt-4">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-[#3DC185] hover:text-[#2a9465] transition-colors">Regístrate</Link>
      </p>
    </>
  );
}
