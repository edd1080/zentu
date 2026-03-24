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

          <main className="flex-1 flex flex-col overflow-hidden relative pb-14 md:pb-0 bg-white md:rounded-tl-3xl border-t border-l border-transparent md:border-slate-200/60 md:shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.02)]">
            {children}
          </main>

          <MobileNav />
        </div>
      </NavCountsProvider>
    </ToastProvider>
  );
}
