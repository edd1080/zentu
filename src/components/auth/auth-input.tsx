interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  labelSuffix?: string;
  children?: React.ReactNode;
}

export function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  hint,
  labelSuffix,
  children,
}: AuthInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
        {labelSuffix && (
          <span style={{ color: "var(--text-tertiary)" }}>
            {" "}
            {labelSuffix}
          </span>
        )}
      </label>
      {children ?? (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="rounded-lg border px-4 py-3 text-base outline-none transition-colors"
          style={{
            borderColor: "var(--surface-border)",
            backgroundColor: "var(--surface-card)",
            color: "var(--text-primary)",
          }}
        />
      )}
      {hint && (
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
