import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { listTasks, getTaskStats } from "@/src/server/services/task.service";
import { listLeads } from "@/src/server/services/lead.service";
import { TaskListView } from "@/components/tasks/task-list-view";

export default async function TasksPage() {
  const business = await getOrCreateBusiness();

  const [tasks, stats, leads] = await Promise.all([
    listTasks(business.id),
    getTaskStats(business.id),
    listLeads(business.id),
  ]);

  const leadOptions = leads.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    priority: l.priority,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <TaskListView
        initialTasks={tasks}
        leads={leadOptions}
        stats={stats}
      />
    </div>
  );
}