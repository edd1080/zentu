"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthError } from "@/components/auth/auth-error";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) setError("Error al conectar con Google");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary-700)" }}>
          AGENTI
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>Ingresa a tu cuenta</p>
      </div>

      <AuthError message={error} />

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <AuthInput
          id="email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="tu@correo.com"
          required
        />
        <AuthInput id="password" label="Contraseña" value={password} onChange={setPassword}>
          <PasswordInput id="password" value={password} onChange={setPassword} />
        </AuthInput>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary-700)", color: "var(--text-inverse)" }}
        >
          {loading ? "Ingresando..." : <><LogIn className="h-5 w-5" /> Ingresar</>}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton onClick={handleGoogleLogin} />

      <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold" style={{ color: "var(--color-primary-700)" }}>
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
