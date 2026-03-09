export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--surface-background)" }}
    >
      <div className="w-full max-w-[390px]">{children}</div>
    </div>
  );
}
