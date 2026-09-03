import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { ThemeScope } from "@/components/shared/theme-scoped";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { getRescueQueueCount } from "@/src/server/services/task.service";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getOrCreateBusiness();
  const rescueCount = await getRescueQueueCount(business.id);

  return (
    <SidebarProvider>
      <TooltipProvider>
        <ThemeScope />
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AppSidebar businessName={business.name} rescueCount={rescueCount} />
          <div className="flex flex-1 flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}