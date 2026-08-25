import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark">
      <SidebarProvider>
        <TooltipProvider>
          <div className="flex min-h-screen w-full bg-background text-foreground">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </TooltipProvider>
      </SidebarProvider>
    </div>
  );
}