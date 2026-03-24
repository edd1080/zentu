export function TypographySection() {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Tipografía — DM Sans</h2>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-8 space-y-6">
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-4xl · font-semibold · text-[#3DC185] — Auth heading</p>
          <p className="text-4xl font-semibold text-[#3DC185] tracking-tight">Bienvenido,</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-3xl · font-medium · text-zinc-800 · tracking-tight — Onboarding step</p>
          <p className="text-3xl font-medium text-zinc-800 tracking-tight">Paso 1 de 5</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-2xl · font-semibold · text-zinc-900 · tracking-tight — Section heading</p>
          <p className="text-2xl font-semibold text-zinc-900 tracking-tight">¿Cuál es el giro de tu negocio?</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-xl · font-semibold · text-zinc-900</p>
          <p className="text-xl font-semibold text-zinc-900 tracking-tight">Reglas de Escalamiento</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-base · font-medium · text-slate-900 · tracking-tight</p>
          <p className="text-base font-medium text-slate-900 tracking-tight">Heading de sección dashboard</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-sm · text-slate-700 · leading-relaxed — Body</p>
          <p className="text-sm text-slate-700 leading-relaxed">Este es el texto de cuerpo estándar de la app. DM Sans es limpia, moderna y altamente legible en pantallas pequeñas.</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-xs · text-slate-500 — Caption / Label</p>
          <p className="text-xs text-slate-500">Texto de caption, hints y metadata secundaria</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-xs · font-semibold · uppercase · tracking-wide · text-slate-600 — Label de input</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Correo Electrónico</p>
        </div>
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-1">text-[10px] / text-[11px] — Tiny</p>
          <p className="text-[11px] text-slate-400">Badge, nota legal, timestamp</p>
        </div>
      </div>
    </section>
  );
}
