"use client";

import { usePathname } from "next/navigation";
import { AppSidebar, MobileNav } from "./AppNavigation";
import { PersistentTabShell, PERSISTENT_TAB_PATHS } from "./PersistentTabShell";

/**
 * Client-side dashboard shell.
 * Renders persistent tabs (Agent, Train, Settings) alongside the router children.
 * When on a persistent tab path, children (the route's page.tsx) is not rendered
 * to avoid double-mounting the same page.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnPersistentTab = PERSISTENT_TAB_PATHS.includes(pathname as typeof PERSISTENT_TAB_PATHS[number]);

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-(--surface-background) overflow-hidden">
      <AppSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative pb-nav-full md:pb-0 bg-white md:rounded-tl-3xl border-t border-l border-transparent md:border-slate-200/60 md:shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.02)]">
        {/* Persistent tabs — always mounted, CSS show/hide */}
        <PersistentTabShell />

        {/* Router children — only rendered when not on a persistent tab */}
        {!isOnPersistentTab && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {children}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
