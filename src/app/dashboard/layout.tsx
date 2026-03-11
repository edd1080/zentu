import { ToastProvider } from "@/components/ui/Toast";
import { AppSidebar, MobileNav } from "@/components/dashboard/AppNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen w-full flex-col md:flex-row bg-(--surface-background) overflow-hidden">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden relative pb-14 md:pb-0">
          {children}
        </main>
        
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
