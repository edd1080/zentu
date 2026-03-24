import { Icon } from "@/components/ui/Icon";

export function NavSection() {
  return (
    <section className="mb-16">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Navegación</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Desktop Sidebar */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Sidebar desktop — w-[240px] bg-[#F8F9FA]</p>
          <div className="w-60 bg-[#F8F9FA] border border-slate-200/60 rounded-2xl p-3 space-y-1">
            <div className="px-3 py-2 mb-2">
              <span className="text-lg font-semibold text-slate-900 tracking-tight">Agenti</span>
            </div>
            {/* Active */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50 text-slate-900 font-medium">
              <Icon name="solar:home-smile-linear" size={20} className="text-[#3DC185]" />
              <span className="text-sm">Inicio</span>
            </div>
            {/* Inactive */}
            {[
              { name: "Chats", icon: "solar:inbox-in-linear" },
              { name: "Agente", icon: "solar:cpu-linear" },
              { name: "Entrenar", icon: "solar:magic-stick-3-linear" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100/50 text-sm font-medium">
                <Icon name={item.icon} size={20} />
                <span>{item.name}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200/60 mt-2">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 text-sm font-medium">
                <Icon name="solar:settings-linear" size={20} />
                <span>Ajustes</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 text-sm font-medium transition-all">
                <Icon name="solar:logout-linear" size={20} />
                <span>Cerrar sesión</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div>
          <p className="text-[10px] font-mono text-slate-400 mb-3">Mobile nav — bg-white/95 backdrop-blur-xl</p>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-2">
            <div className="flex justify-around items-center h-14">
              {[
                { name: "Inicio", icon: "solar:home-smile-linear", active: true },
                { name: "Chats", icon: "solar:inbox-in-linear", active: false },
                { name: "Agente", icon: "solar:cpu-linear", active: false },
                { name: "Entrenar", icon: "solar:magic-stick-3-linear", active: false },
                { name: "Ajustes", icon: "solar:settings-linear", active: false },
              ].map((item) => (
                <div key={item.name} className={`flex flex-col items-center gap-1 w-16 ${item.active ? "text-[#3DC185]" : "text-slate-400"}`}>
                  <Icon name={item.icon} size={24} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <p className="text-[10px] font-mono text-slate-400 mt-4 mb-2">Badges de nav</p>
          <div className="flex gap-3 flex-wrap">
            <span className="bg-rose-500 text-white text-[10px] py-0.5 px-2 rounded-full font-bold">3</span>
            <span className="bg-slate-100 text-slate-500 ring-1 ring-slate-200/50 text-xs py-0.5 px-2 rounded-full font-semibold">12</span>
            <span className="px-2 py-0.5 rounded bg-slate-100/80 border border-slate-200/60 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Instrucción</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100/60 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Política</span>
          </div>
        </div>
      </div>
    </section>
  );
}
