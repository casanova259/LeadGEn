import Link from "next/link";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { getRescueQueue, getDashboardStats } from "@/src/server/services/task.service";

export default async function DashboardPage() {
  const business = await getOrCreateBusiness();
  const [stats, rescueQueue] = await Promise.all([
    getDashboardStats(business.id),
    getRescueQueue(business.id),
  ]);

  const cards = [
    { label: "Today's Leads", value: stats.todaysLeads },
    { label: "Pending Tasks", value: stats.pendingTasks },
    { label: "Hot Leads", value: stats.hotLeads },
    { label: "Converted", value: stats.converted },
    { label: "Lost", value: stats.lost },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Lost Leads.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border rounded-md p-4">
            <div className="text-2xl font-semibold">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      {rescueQueue.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">🔥 Rescue Queue</h2>
          <div className="border border-red-300 rounded-md divide-y">
            {rescueQueue.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted text-sm"
              >
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-muted-foreground">{lead.phone || lead.email || "—"}</div>
                </div>
                <div className="text-xs text-red-500">
                  Since {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}