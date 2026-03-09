interface AuthErrorProps {
  message: string | null;
  variant?: "error" | "warning";
}

export function AuthError({ message, variant = "error" }: AuthErrorProps) {
  if (!message) return null;

  const colors =
    variant === "warning"
      ? {
          bg: "var(--color-warning-100)",
          text: "var(--color-warning-700)",
        }
      : {
          bg: "var(--color-error-100)",
          text: "var(--color-error-700)",
        };

  return (
    <div
      className="rounded-lg px-4 py-3 text-sm"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {message}
    </div>
  );
}
