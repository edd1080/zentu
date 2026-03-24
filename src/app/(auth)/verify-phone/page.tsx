"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setCode(pasted.split("")); inputRefs.current[5]?.focus(); }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) { setError("Ingresa los 6 dígitos"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        if (data.blocked) setBlocked(true);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch { setError("Error de conexión. Intenta de nuevo."); setLoading(false); }
  }

  return (
    <>
      <div className="flex justify-center mb-6 mt-4 md:mt-0">
        <div className="w-16 h-16 rounded-full bg-[#3DC185]/10 flex items-center justify-center text-[#3DC185] shadow-sm">
          <Icon name="solar:shield-check-linear" size={28} />
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">Verifica tu número</h1>
        <p className="text-sm text-slate-500 leading-relaxed px-4">Ingresa el código de 6 dígitos que enviamos a tu WhatsApp personal</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 flex items-center gap-2">
          <Icon name="solar:close-circle-linear" size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input key={i} ref={el => { inputRefs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={blocked}
              className={cn("w-12 h-12 text-center text-xl font-semibold bg-[#FCFDFD] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DC185] focus:border-[#3DC185] transition-all text-slate-800 disabled:opacity-50",
                error ? "border-rose-400 text-rose-600" : "border-slate-200/80")}
              aria-label={`Dígito ${i + 1}`} />
          ))}
        </div>

        <button type="submit" disabled={loading || blocked || code.join("").length < 6}
          className="w-full h-12 bg-[#3DC185] hover:bg-[#32a873] text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center uppercase tracking-wider disabled:opacity-50">
          {loading ? <Icon name="solar:refresh-linear" size={16} className="animate-spin" /> : "Verificar"}
        </button>
      </form>

      <div className="text-center mt-6 flex flex-col items-center gap-3">
        {resendSeconds > 0
          ? <p className="text-sm font-medium text-slate-400">Reenviar código en <span>{resendSeconds}</span>s</p>
          : <button onClick={() => setResendSeconds(60)} className="text-sm font-medium text-[#3DC185] hover:text-[#2a9465] transition-colors">Reenviar código</button>}
        <button onClick={() => { router.push("/onboarding"); router.refresh(); }} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          Verificar después
        </button>
      </div>
    </>
  );
}
