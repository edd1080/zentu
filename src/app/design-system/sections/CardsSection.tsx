export function CardsSection() {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Cards</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Standard */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-mono text-slate-400 mb-2">Standard card</p>
          <p className="text-sm font-medium text-slate-900">bg-white · border-slate-200/60 · rounded-2xl · shadow-sm</p>
          <p className="text-xs text-slate-500 mt-1">Uso: conversación, instrucción, setting item</p>
        </div>

        {/* Sutil */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
          <p className="text-[10px] font-mono text-slate-400 mb-2">Sutil / container</p>
          <p className="text-sm font-medium text-slate-900">bg-slate-50/50 · border-slate-100 · rounded-2xl</p>
          <p className="text-xs text-slate-500 mt-1">Uso: sección secundaria, preview area</p>
        </div>

        {/* Amber */}
        <div className="bg-[#FFFAF0] border border-amber-200/60 rounded-2xl p-5">
          <p className="text-[10px] font-mono text-slate-400 mb-2">Amber / alerta</p>
          <p className="text-sm font-medium text-amber-900">bg-[#FFFAF0] · border-amber-200/60</p>
          <p className="text-xs text-amber-700 mt-1">Uso: AgentStatusBar, pendiente de acción</p>
        </div>

        {/* Brand gradient */}
        <div className="bg-gradient-to-br from-[#3DC185]/5 to-[#3DC185]/10 border border-[#3DC185]/20 rounded-2xl p-5">
          <p className="text-[10px] font-mono text-slate-400 mb-2">Brand gradient</p>
          <p className="text-sm font-medium text-slate-900">from-brand/5 to-brand/10 · border-brand/20</p>
          <p className="text-xs text-slate-500 mt-1">Uso: card de métricas destacada</p>
        </div>

        {/* Métrica */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-mono text-slate-400 mb-2">Métrica</p>
          <p className="text-2xl font-semibold text-slate-900">94%</p>
          <p className="text-xs text-slate-500">Resolución autónoma</p>
        </div>

        {/* Health card dark */}
        <div className="bg-emerald-950 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 w-32 h-32 bg-[#3DC185]/20 rounded-full blur-3xl -top-8 -right-8" />
          <p className="text-[10px] font-mono text-[#3DC185]/60 mb-2">Health card (Mi Agente)</p>
          <p className="text-sm font-semibold text-white">bg-emerald-950 · blur decorativo</p>
          <p className="text-xs text-[#3DC185]/80 mt-1">Uso: estado del agente en Mi Agente</p>
        </div>

        {/* Industry card */}
        <div className="border border-[#3DC185] bg-[#3DC185]/5 text-[#3DC185] rounded-xl p-4 flex flex-col items-center gap-2">
          <p className="text-[10px] font-mono mb-1">Industry card — activa</p>
          <p className="text-xs font-medium">Restaurante / Café</p>
        </div>

        <div className="border border-zinc-200 bg-white text-zinc-700 rounded-xl p-4 flex flex-col items-center gap-2">
          <p className="text-[10px] font-mono text-slate-400 mb-1">Industry card — inactiva</p>
          <p className="text-xs font-medium">Gimnasio</p>
        </div>
      </div>
    </section>
  );
}
