"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
    >
      <Icon
        name="solar:logout-linear"
        size={20}
        className="text-slate-400 group-hover:text-rose-500 transition-colors"
      />
      Cerrar sesión
    </button>
  );
}
