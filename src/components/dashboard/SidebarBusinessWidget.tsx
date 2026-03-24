"use client";

import { useQuery } from "@tanstack/react-query";
import { useBusinessId } from "@/hooks/useBusinessId";
import { createClient } from "@/lib/supabase/client";

function getInitials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export function SidebarBusinessWidget() {
  const { data: businessId } = useBusinessId();

  const { data: businessName } = useQuery({
    queryKey: ["business-name", businessId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from("businesses").select("name").eq("id", businessId!).single();
      return data?.name ?? "Mi Negocio";
    },
    enabled: !!businessId,
    staleTime: 10 * 60_000,
  });

  const displayName = businessName ?? "Mi Negocio";

  return (
    <div className="px-3 pb-2 border-t border-slate-200/60 pt-3">
      <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 transition-all cursor-default">
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-xs font-semibold text-slate-600 shadow-sm shrink-0">
          {getInitials(displayName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">Plan Piloto</p>
        </div>
      </div>
    </div>
  );
}
