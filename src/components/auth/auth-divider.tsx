export function AuthDivider() {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-px flex-1"
        style={{ backgroundColor: "var(--surface-border)" }}
      />
      <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        o
      </span>
      <div
        className="h-px flex-1"
        style={{ backgroundColor: "var(--surface-border)" }}
      />
    </div>
  );
}
