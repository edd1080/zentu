"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { useNavCounts } from "./NavCountsContext";
import { LogoutButton } from "./LogoutButton";
import { SidebarBusinessWidget } from "./SidebarBusinessWidget";

const navItems = [
  { name: "Inicio",       href: "/dashboard",                    icon: "solar:home-smile-linear",       countKey: null },
  { name: "Chats",        href: "/dashboard/conversations",      icon: "solar:inbox-in-linear",         countKey: "conversations" as const },
  { name: "Agente",       href: "/dashboard/agent",              icon: "solar:cpu-linear",              countKey: "agent" as const },
  { name: "Entrenar",     href: "/dashboard/train",              icon: "solar:magic-stick-3-linear",    countKey: null },
];

const settingsItem = { name: "Ajustes", href: "/dashboard/settings", icon: "solar:settings-linear" };

function isActive(href: string, pathname: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const counts = useNavCounts();

  return (
    <aside className="hidden md:flex w-[240px] flex-col bg-[#F8F9FA] border-r border-slate-200/60 shrink-0 h-full">
      {/* Logo + Beta pill */}
      <div className="flex h-14 items-center gap-2 px-6">
        <span className="text-lg font-semibold tracking-tight text-slate-900">Agenti</span>
        <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200/60 text-xs text-slate-500 shadow-sm leading-none">Beta</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, pathname);
          const badge = item.countKey ? counts[item.countKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white shadow-sm ring-1 ring-slate-200/50 text-slate-900"
                  : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
              )}
            >
              <Icon
                name={item.icon}
                size={20}
                className={active ? "text-[#3DC185]" : "text-slate-400 group-hover:text-slate-600"}
              />
              {item.name}
              {badge > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] py-0.5 px-1.5 rounded-full font-bold leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Business widget */}
      <SidebarBusinessWidget />

      {/* Bottom: Settings + Logout */}
      <div className="px-3 pb-4 pt-2 space-y-0.5 border-t border-slate-200/60">
        <Link
          href={settingsItem.href}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            isActive(settingsItem.href, pathname)
              ? "bg-white shadow-sm ring-1 ring-slate-200/50 text-slate-900"
              : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
          )}
        >
          <Icon
            name={settingsItem.icon}
            size={20}
            className={isActive(settingsItem.href, pathname) ? "text-[#3DC185]" : "text-slate-400 group-hover:text-slate-600"}
          />
          {settingsItem.name}
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const counts = useNavCounts();

  const isSettingsSub = pathname.startsWith("/dashboard/settings/") && pathname !== "/dashboard/settings";
  if (pathname.includes("/conversations/") || isSettingsSub) return null;

  const allItems = [...navItems, { ...settingsItem, countKey: null }];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {allItems.map((item) => {
          const active = isActive(item.href, pathname);
          const badge = "countKey" in item && item.countKey ? counts[item.countKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-16 h-full transition-colors gap-0.5",
                active ? "text-[#3DC185]" : "text-slate-400"
              )}
            >
              <div className="relative">
                <Icon name={item.icon} size={24} />
                {badge > 0 && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500 ring-1 ring-white" />
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
