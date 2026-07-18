import { getOrCreateBusiness } from "@/src/server/services/business.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getOrCreateBusiness();

  return <div className="min-h-screen">{children}</div>;
}