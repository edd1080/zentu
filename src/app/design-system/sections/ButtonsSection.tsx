export function ButtonsSection() {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
        Botones — rounded-xl h-12 universal
      </h2>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-8 space-y-6">
        {/* Primary */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Primary — bg-brand h-12 rounded-xl</p>
          <div className="flex gap-4 flex-wrap">
            <button className="h-12 px-8 bg-[#3DC185] hover:bg-[#32a873] text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]">
              Verificar código
            </button>
            <button className="h-12 px-8 bg-[#3DC185] hover:bg-[#32a873] text-white rounded-xl text-sm font-medium transition-all w-64">
              Ingresar
            </button>
          </div>
        </div>

        {/* Primary dark */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Primary dark (onboarding) — bg-zinc-900 h-12 rounded-xl</p>
          <div className="flex gap-4 flex-wrap">
            <button className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-medium tracking-wide transition-all active:scale-[0.98]">
              Aceptar y continuar
            </button>
            <button className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-medium tracking-wide transition-all opacity-30 cursor-not-allowed">
              Disabled
            </button>
          </div>
        </div>

        {/* Secondary outlined */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Secondary outlined — border border-zinc-200 bg-white h-12 rounded-xl</p>
          <div className="flex gap-4 flex-wrap">
            <button className="h-12 px-8 border border-zinc-200 bg-white text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-all">
              Conectar Después
            </button>
          </div>
        </div>

        {/* Ghost icon */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Ghost icon — p-2 rounded-xl</p>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Pill filters */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Pills de filtro (excepción — rounded-full) — NO son botones de acción</p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-full">Todas</button>
            <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-50">Activas</button>
            <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-50">Resueltas</button>
          </div>
        </div>

        {/* Logout */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Logout — hover:bg-rose-50 hover:text-rose-500</p>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </section>
  );
}
