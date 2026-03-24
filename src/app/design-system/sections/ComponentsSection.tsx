export function ComponentsSection() {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Componentes</h2>

      <div className="space-y-8">
        {/* Chat bubbles */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Chat bubbles</p>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-3">
            <div className="flex gap-3 max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-[#3DC185]/10 flex items-center justify-center shrink-0 text-[#3DC185] text-xs font-bold">A</div>
              <div className="bg-white border border-slate-200/60 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm text-sm">
                ¡Hola! ¿En qué te puedo ayudar hoy?
              </div>
            </div>
            <div className="flex gap-3 max-w-[70%] ml-auto flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 text-xs font-bold">U</div>
              <div className="bg-emerald-700 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm text-sm">
                ¿Cuáles son sus horarios?
              </div>
            </div>
            <div className="flex gap-3 max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">C</div>
              <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-3 py-2 text-sm">
                Hola, quisiera una cita para mañana
              </div>
            </div>
          </div>
        </div>

        {/* Auth card shell */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Auth card shell — con decoraciones blur</p>
          <div className="relative bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-8 max-w-sm overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#3DC185]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl" />
            <div className="absolute top-6 right-6 w-8 h-8 bg-[#3DC185] rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">✦</span>
            </div>
            <p className="text-4xl font-semibold text-[#3DC185] tracking-tight relative">Bienvenido,</p>
            <p className="text-sm text-slate-500 mt-1 relative">Ingresa para continuar</p>
          </div>
        </div>

        {/* Onboarding progress header */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Onboarding progress header — sticky</p>
          <div className="bg-[#FAFAFA]/90 backdrop-blur-md border border-zinc-200/50 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 rounded-lg text-zinc-400">←</div>
              <span className="text-3xl font-medium text-zinc-800 tracking-tight">Paso 2 de 5</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#3DC185] h-1.5 rounded-full w-[40%] transition-all duration-500" />
            </div>
          </div>
          {/* Completeness bar */}
          <div className="bg-white border-b border-zinc-200/60 px-6 py-2.5 flex items-center justify-between rounded-b-xl">
            <div className="flex-1 bg-zinc-200 rounded-full h-1 overflow-hidden mr-3">
              <div className="bg-zinc-600 h-1 rounded-full w-[67%] transition-all duration-500" />
            </div>
            <span className="text-xs font-semibold text-zinc-500">67%</span>
          </div>
        </div>

        {/* Error / success banners */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Banners de estado</p>
          <div className="space-y-3 max-w-sm">
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
              <span>⚠</span> Código incorrecto. 3 intentos restantes.
            </div>
            <div className="bg-[#3DC185]/10 border border-[#3DC185]/20 rounded-xl px-4 py-3 text-sm text-[#3DC185] flex items-center gap-2">
              <span>✓</span> ¡Número verificado exitosamente!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
