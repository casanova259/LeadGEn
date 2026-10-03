import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { ThemeScope } from "@/components/shared/theme-scoped";
import { Toasts } from "@/components/ui/toast";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { getRescueQueueCount } from "@/src/server/services/task.service";
import { getCurrentUser } from "@/src/server/services/auth.service";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getOrCreateBusiness();
  const rescueCount = await getRescueQueueCount(business.id);
  const user = await getCurrentUser();
  const authUser = user?.provider === "authjs" ? { name: user.name, email: user.email, image: user.image } : null;

  return (
    <SidebarProvider>
      <TooltipProvider>
        <ThemeScope />
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AppSidebar businessName={business.name} rescueCount={rescueCount} />
          <div className="flex flex-1 flex-col">
            <Navbar authUser={authUser} />
            <main className="flex-1">{children}</main>
            <Toasts position="top-center" />
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}