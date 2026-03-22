"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquare,
  Bot,
  BrainCircuit,
  Settings,
} from "lucide-react";
import { Divider } from "@/components/ui/Divider";
import { useNavCounts } from "./NavCountsContext";

const navItemDefs = [
  { name: "Inicio", href: "/dashboard", icon: Home, countKey: null },
  { name: "Conversaciones", href: "/dashboard/conversations", icon: MessageSquare, countKey: "conversations" as const },
  { name: "Agente", href: "/dashboard/agent", icon: Bot, countKey: "agent" as const },
  { name: "Entrenar", href: "/dashboard/train", icon: BrainCircuit, countKey: null },
];

const bottomItemDef = { name: "Ajustes", href: "/dashboard/settings", icon: Settings };

export function AppSidebar() {
  const pathname = usePathname();
  const counts = useNavCounts();

  return (
    <aside className="hidden md:flex w-[240px] flex-col bg-(--surface-card) border-r border-(--surface-border) shrink-0 h-full">
      <div className="flex h-14 items-center px-6">
        <span className="font-display italic text-2xl text-(--color-primary-700)">Agenti</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItemDefs.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge = item.countKey ? counts[item.countKey] : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center relative gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-(--color-primary-50) text-(--color-primary-700)"
                  : "text-(--text-secondary) hover:bg-(--surface-muted) hover:text-(--text-primary)"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "fill-(--color-primary-100)" : "")} />
              {item.name}
              {badge > 0 && (
                <div className="absolute left-[22px] top-[8px] h-2 w-2 rounded-full bg-(--color-error-500) outline-2 outline-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Divider />
        <Link
          href={bottomItemDef.href}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mt-2",
            pathname === bottomItemDef.href || pathname.startsWith(`${bottomItemDef.href}/`)
              ? "bg-(--color-primary-50) text-(--color-primary-700)"
              : "text-(--text-secondary) hover:bg-(--surface-muted) hover:text-(--text-primary)"
          )}
        >
          <bottomItemDef.icon className="h-5 w-5" />
          {bottomItemDef.name}
        </Link>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const counts = useNavCounts();

  // Hide on conversation thread view to give more space
  if (pathname.includes("/conversations/")) {
    return null;
  }

  const allItemDefs = [...navItemDefs, { ...bottomItemDef, countKey: null }];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--surface-card) border-t border-(--surface-border) pb-safe">
      <div className="flex h-14 items-center justify-around px-2">
        {allItemDefs.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge = item.countKey ? counts[item.countKey] : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-16 h-full transition-colors",
                isActive ? "text-(--color-primary-700)" : "text-(--text-tertiary)"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-6 w-6 mb-1", isActive ? "fill-(--color-primary-100)" : "")} />
                {badge > 0 && (
                  <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-(--color-error-500) outline-[1.5px] outline-solid outline-white" />
                )}
              </div>
              <span className={cn("text-[10px] font-medium leading-none", isActive ? "text-(--color-primary-700)" : "text-(--text-tertiary)")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
