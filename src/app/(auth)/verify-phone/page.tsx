"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AuthError } from "@/components/auth/auth-error";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
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
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-primary-100)" }}
        >
          <ShieldCheck className="h-8 w-8" style={{ color: "var(--color-primary-700)" }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Verifica tu número
        </h1>
        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Ingresa el código de 6 dígitos que enviamos a tu WhatsApp personal
        </p>
      </div>

      <AuthError message={error} variant={blocked ? "warning" : "error"} />

      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={blocked}
              className="h-14 w-12 rounded-lg border text-center text-2xl font-bold outline-none transition-colors disabled:opacity-50"
              style={{
                borderColor: error ? "var(--color-error-500)" : "var(--surface-border-strong)",
                backgroundColor: "var(--surface-card)",
                color: "var(--text-primary)",
              }}
              aria-label={`Dígito ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || blocked}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary-700)", color: "var(--text-inverse)" }}
        >
          {loading ? "Verificando..." : "Verificar"}
        </button>
      </form>

      <button
        onClick={() => { router.push("/onboarding"); router.refresh(); }}
        className="text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Verificar después
      </button>
    </div>
  );
}
