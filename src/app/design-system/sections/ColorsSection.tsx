function Swatch({ bg, label, hex }: { bg: string; label: string; hex: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-14 rounded-xl ${bg} border border-black/5`} />
      <p className="text-[11px] font-semibold text-slate-700">{label}</p>
      <p className="text-[10px] text-slate-400 font-mono">{hex}</p>
    </div>
  );
}

export function ColorsSection() {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Colores</h2>

      <h3 className="text-sm font-semibold text-slate-700 mb-4">Brand Primary (toda la app)</h3>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Swatch bg="bg-[#3DC185]" label="brand" hex="#3DC185" />
        <Swatch bg="bg-[#32a873]" label="brand-hover" hex="#32a873" />
        <Swatch bg="bg-[#3DC185]/10" label="brand-light" hex="rgba(61,193,133,0.1)" />
        <Swatch bg="bg-[#3DC185]/20" label="brand-ring / selection" hex="rgba(61,193,133,0.2)" />
      </div>

      <h3 className="text-sm font-semibold text-slate-700 mb-4">Superficies</h3>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Swatch bg="bg-[#F8F9FA]" label="surface-background" hex="#F8F9FA" />
        <Swatch bg="bg-[#FCFDFD]" label="auth bg" hex="#FCFDFD" />
        <Swatch bg="bg-[#FAFAFA]" label="onboarding bg" hex="#FAFAFA" />
        <Swatch bg="bg-white" label="surface-card" hex="#FFFFFF" />
      </div>

      <h3 className="text-sm font-semibold text-slate-700 mb-4">Semánticos</h3>
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Swatch bg="bg-amber-500" label="alerta" hex="#F59E0B" />
        <Swatch bg="bg-rose-500" label="error" hex="#F43F5E" />
        <Swatch bg="bg-blue-500" label="info" hex="#3B82F6" />
        <Swatch bg="bg-emerald-700" label="chat-dueño" hex="#047857" />
        <Swatch bg="bg-emerald-950" label="health-card" hex="#022c22" />
      </div>

      <h3 className="text-sm font-semibold text-slate-700 mb-4">Texto</h3>
      <div className="grid grid-cols-4 gap-4">
        <Swatch bg="bg-slate-900" label="text-primary" hex="#0F172A" />
        <Swatch bg="bg-slate-700" label="text-secondary" hex="#334155" />
        <Swatch bg="bg-slate-500" label="text-apagado" hex="#64748B" />
        <Swatch bg="bg-slate-400" label="text-muted" hex="#94A3B8" />
      </div>
    </section>
  );
}
