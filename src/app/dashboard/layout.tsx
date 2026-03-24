import { ToastProvider } from "@/components/ui/Toast";
import { NavCountsProvider } from "@/components/dashboard/NavCountsContext";
import OneSignalInitializer from "@/components/notifications/OneSignalInitializer";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <NavCountsProvider>
        <OneSignalInitializer />
        <DashboardShell>{children}</DashboardShell>
      </NavCountsProvider>
    </ToastProvider>
  );
}
