import { CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-3">
        <CheckCircle
          className="h-8 w-8"
          style={{ color: "var(--color-primary-700)" }}
        />
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          AGENTI
        </h1>
      </div>

      <p
        className="text-center text-lg"
        style={{
          color: "var(--text-secondary)",
          fontFamily: "var(--font-ui)",
        }}
      >
        Tu negocio responde solo. Tú solo supervisas.
      </p>

      <p
        className="text-center italic"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-primary-700)",
          fontSize: "var(--text-xl)",
        }}
      >
        Setup completo
      </p>

      <div className="mt-4 flex flex-col gap-2 text-sm z-10 relative">
        <VerifyItem label="Next.js + App Router" />
        <VerifyItem label="TypeScript" />
        <VerifyItem label="Tailwind CSS" />
        <VerifyItem label="Geist (UI font)" />
        <VerifyItem label="Instrument Serif (display)" />
        <VerifyItem label="Lucide Icons" />
        <VerifyItem label="Design tokens cargados" />
      </div>

      <div className="mt-8 flex gap-4 z-10 relative">
        <a
          href="/login"
          className="rounded-md bg-white/5 px-6 py-2.5 text-sm font-medium border border-[var(--border-subtle)] hover:bg-white/10 transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          Iniciar Sesión
        </a>
        <a
          href="/register"
          className="rounded-md px-6 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: "var(--color-primary-600)",
            color: "white",
          }}
        >
          Registrarse
        </a>
      </div>
    </div>
  );
}

function VerifyItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle
        className="h-4 w-4"
        style={{ color: "var(--color-success-500)" }}
      />
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
    </div>
  );
}
