"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";

interface ThreadHeaderProps {
  clientName: string;
  phone: string;
  onBack: () => void;
  onResolve: () => void;
  onArchive: () => void;
}

function getInitials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export function ThreadHeader({ clientName, phone, onBack, onResolve, onArchive }: ThreadHeaderProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const close = () => setShowMenu(false);

  return (
    <header className="px-5 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="md:hidden text-slate-400 hover:text-slate-900 -ml-2 p-1.5 transition-colors">
          <Icon name="solar:arrow-left-linear" size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 shrink-0 border border-slate-200/50">
          {getInitials(clientName)}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight leading-none mb-1">{clientName}</h2>
          <div className="flex items-center gap-1">
            <Icon name="solar:phone-linear" size={10} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">{phone || "Sin teléfono"}</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <button onClick={() => setShowMenu(p => !p)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
          <Icon name="solar:menu-dots-bold" size={18} />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={close} />
            <div className="absolute right-0 top-full mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-lg py-1 min-w-[200px]">
              <button onClick={() => { onResolve(); close(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <Icon name="solar:check-circle-linear" size={16} className="text-emerald-600 shrink-0" />
                Marcar como resuelta
              </button>
              <button onClick={() => { onArchive(); close(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <Icon name="solar:archive-down-linear" size={16} className="text-slate-400 shrink-0" />
                Archivar conversación
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
