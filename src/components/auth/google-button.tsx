"use client";

import { GoogleIcon } from "./google-icon";

interface GoogleButtonProps {
  onClick: () => void;
  label?: string;
}

export function GoogleButton({
  onClick,
  label = "Continuar con Google",
}: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 rounded-lg border px-4 py-3 text-base font-medium transition-colors"
      style={{
        borderColor: "var(--surface-border)",
        backgroundColor: "var(--surface-card)",
        color: "var(--text-primary)",
      }}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}
