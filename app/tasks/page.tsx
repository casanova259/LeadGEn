import Link from "next/link";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { listTasks } from "@/src/server/services/task.service";
import { completeTaskAction } from "@/src/server/actions/task.action";
import { Button } from "@/components/ui/button";

export default async function TasksPage() {
    const business = await getOrCreateBusiness();
    const tasks = await listTasks(business.id);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Tasks</h1>

            <div className="border rounded-md divide-y">
                {tasks.length === 0 && (
                    <div className="p-6 text-sm text-muted-foreground text-center">No tasks yet.</div>
                )}
                {tasks.map((task) => {
                    const overdue = task.status === "PENDING" && new Date(task.dueAt) < new Date();
                    return (
                        <div key={task.id} className="flex items-center justify-between px-4 py-3 text-sm">
                            <div>
                                <Link href={`/leads/${task.leadId}`} className="font-medium hover:underline">
                                    {task.lead.name}
                                </Link>
                                <div className="text-muted-foreground">
                                    {task.type} · due {new Date(task.dueAt).toLocaleString()}
                                    {overdue && <span className="text-red-500 ml-2">Overdue</span>}
                                </div>
                            </div>
                            {task.status === "PENDING" ? (
                                <form action={async () => {
                                    "use server";
                                    await completeTaskAction(task.id);
                                }}>
                                    <Button size="sm" variant="outline">Mark Done</Button>
                                </form>
                            ) : (
                                <span className="text-xs text-muted-foreground">Completed</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}