import { ToastProvider } from "@/components/ui/Toast";
import { AppSidebar, MobileNav } from "@/components/dashboard/AppNavigation";
import { NavCountsProvider } from "@/components/dashboard/NavCountsContext";
import OneSignalInitializer from "@/components/notifications/OneSignalInitializer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <NavCountsProvider>
        <OneSignalInitializer />
        <div className="flex h-screen w-full flex-col md:flex-row bg-(--surface-background) overflow-hidden">
          <AppSidebar />

          <main className="flex-1 flex flex-col overflow-hidden relative pb-14 md:pb-0">
            {children}
          </main>

          <MobileNav />
        </div>
      </NavCountsProvider>
    </ToastProvider>
  );
}
