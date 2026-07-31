import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { AppSidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getOrCreateBusiness();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center border-b h-14 px-2">
            <SidebarTrigger />
            <div className="flex-1">
              <Navbar />
            </div>
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}