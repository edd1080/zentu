export function InputsSection() {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
        Inputs — h-12 rounded-xl universal
      </h2>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-8 space-y-8">
        {/* Dashboard input */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Dashboard input — bg-white border-slate-200/80</p>
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">Nombre del negocio</label>
              <input
                type="text"
                placeholder="Ej. Pizzería Napoli"
                className="h-12 w-full px-4 bg-white border border-slate-200/80 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3DC185]/20 focus:border-[#3DC185] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Auth input */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Auth input — bg-[#FCFDFD] border-slate-200/80</p>
          <div className="space-y-3 max-w-sm bg-[#FCFDFD] p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                className="h-12 w-full px-4 bg-[#FCFDFD] border border-slate-200/80 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3DC185]/20 focus:border-[#3DC185] transition-all"
              />
            </div>
          </div>
        </div>

        {/* OTP inputs */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">OTP inputs — w-12 h-12 text-center rounded-xl</p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                defaultValue={i <= 3 ? String(i) : ""}
                className="w-12 h-12 text-center text-xl font-semibold bg-[#FCFDFD] border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DC185]/20 focus:border-[#3DC185] transition-all"
              />
            ))}
          </div>
          <div className="flex gap-3 mt-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                defaultValue={String(i)}
                className="w-12 h-12 text-center text-xl font-semibold bg-[#FCFDFD] border border-[#f43f5e] ring-2 ring-rose-500/10 rounded-xl outline-none"
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">↑ estado error (border-[#f43f5e])</p>
        </div>

        {/* Textarea */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Textarea — rounded-xl container + inner</p>
          <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden focus-within:border-[#3DC185]/50 focus-within:ring-2 focus-within:ring-[#3DC185]/10 max-w-sm">
            <textarea
              rows={3}
              placeholder="Escribe los servicios y precios de tu negocio..."
              className="w-full px-4 py-3 text-sm placeholder:text-slate-400 bg-transparent border-none focus:ring-0 resize-none outline-none"
            />
          </div>
        </div>

        {/* Toggle */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Toggle — peer-checked:bg-[#3DC185]</p>
          <div className="flex items-center gap-6">
            <label className="relative flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3DC185]" />
              <span className="ml-2 text-sm text-slate-700">Activo</span>
            </label>
            <label className="relative flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3DC185]" />
              <span className="ml-2 text-sm text-slate-700">Inactivo</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
