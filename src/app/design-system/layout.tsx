export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/60 px-8 h-12 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900 tracking-tight">
          AGENTI — Design System
        </span>
        <span className="text-xs text-slate-400 font-mono">v2 · #3DC185</span>
      </header>
      <div className="max-w-5xl mx-auto px-8 py-12">{children}</div>
    </div>
  );
}
