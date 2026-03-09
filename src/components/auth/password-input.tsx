"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "Tu contraseña",
  minLength = 8,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        minLength={minLength}
        className="w-full rounded-lg border px-4 py-3 pr-12 text-base outline-none transition-colors"
        style={{
          borderColor: "var(--surface-border)",
          backgroundColor: "var(--surface-card)",
          color: "var(--text-primary)",
        }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--text-tertiary)" }}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
