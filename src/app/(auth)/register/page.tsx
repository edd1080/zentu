"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthError } from "@/components/auth/auth-error";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({
          email, password, fullName,
          phonePersonal: phonePersonal || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear la cuenta");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email, password,
      });

      if (signInError) {
        router.push("/login?registered=true");
        return;
      }

      router.push(phonePersonal ? "/verify-phone" : "/onboarding");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary-700)" }}>
          AGENTI
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>Crea tu cuenta y configura tu agente</p>
      </div>

      <AuthError message={error} />

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <AuthInput id="fullName" label="Nombre completo" value={fullName}
          onChange={setFullName} placeholder="Tu nombre" required />
        <AuthInput id="email" label="Correo electrónico" type="email" value={email}
          onChange={setEmail} placeholder="tu@correo.com" required />
        <AuthInput id="password" label="Contraseña" value={password} onChange={setPassword}>
          <PasswordInput id="password" value={password} onChange={setPassword}
            placeholder="Mínimo 8 caracteres" />
        </AuthInput>
        <AuthInput id="phone" label="WhatsApp personal" labelSuffix="(opcional)"
          type="tel" value={phonePersonal} onChange={setPhonePersonal}
          placeholder="+502 1234 5678"
          hint="Para recibir notificaciones urgentes y resúmenes diarios" />

        <button type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary-700)", color: "var(--text-inverse)" }}>
          {loading ? "Creando cuenta..." : <><UserPlus className="h-5 w-5" /> Crear cuenta</>}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton onClick={handleGoogleRegister} />

      <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold" style={{ color: "var(--color-primary-700)" }}>
          Ingresar
        </Link>
      </p>
    </div>
  );
}
