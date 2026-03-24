"use client";

import { usePathname } from "next/navigation";
import AgentPage from "@/app/dashboard/agent/page";
import TrainPage from "@/app/dashboard/train/page";
import SettingsPage from "@/app/dashboard/settings/page";

const TABS = [
  { path: "/dashboard/agent",    Component: AgentPage },
  { path: "/dashboard/train",    Component: TrainPage },
  { path: "/dashboard/settings", Component: SettingsPage },
] as const;

/**
 * Keeps Agent, Train, and Settings pages permanently mounted.
 * Switching between these tabs is instant — no remount, no re-fetch.
 * Uses CSS `hidden` to show/hide; all components stay alive in the background.
 */
export function PersistentTabShell() {
  const pathname = usePathname();

  return (
    <>
      {TABS.map(({ path, Component }) => (
        <div
          key={path}
          className={pathname === path
            ? "flex flex-col flex-1 overflow-hidden"
            : "hidden"}
        >
          <Component />
        </div>
      ))}
    </>
  );
}

export const PERSISTENT_TAB_PATHS = TABS.map(t => t.path);
