import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { getLead } from "@/src/server/services/lead.service";
import { completeTaskAction } from "@/src/server/actions/task.action";
import { LeadDetailActions } from "./_components/lead-detail-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  Activity as ActivityIcon,
  Phone,
  Mail,
  FileText,
  Tag,
  Sparkles,
} from "lucide-react";

function formatRelative(date: Date) {
  const hrs = Math.floor((Date.now() - new Date(date).getTime()) / 36e5);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ACTIVITY_LABELS: Record<string, { label: string; icon: typeof ActivityIcon; color: string }> = {
  LEAD_CREATED: { label: "Lead Captured", icon: Sparkles, color: "text-blue-500 bg-blue-500/10" },
  STATUS_CHANGED: { label: "Status Updated", icon: Tag, color: "text-purple-500 bg-purple-500/10" },
  TASK_COMPLETED: { label: "Task Completed", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
  LEAD_UPDATED: { label: "Details Updated", icon: FileText, color: "text-amber-500 bg-amber-500/10" },
  LEAD_CONVERTED: { label: "Lead Converted! 🎉", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/15" },
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getOrCreateBusiness();
  const lead = await getLead(id, business.id);

  if (!lead) {
    notFound();
  }

  const isRescueEligible =
    lead.priority === "HOT" &&
    lead.status === "NEW" &&
    new Date(lead.createdAt).getTime() < Date.now() - 24 * 60 * 60 * 1000;

  return (
    <div className="p-6 max-w-6xl space-y-6">
      {/* Top Bar / Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/leads">
            <ArrowLeft className="size-4" />
            Back to Leads
          </Link>
        </Button>
      </div>

      {/* Rescue Alert Banner */}
      {isRescueEligible && (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex items-center justify-between text-orange-400">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
              <Flame className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-sm text-foreground">In Rescue Queue: No contact in &gt;24 hours</p>
              <p className="text-xs text-muted-foreground">
                This inquiry was received {formatRelative(lead.createdAt)} and has not had direct contact. Reach out immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{lead.name}</h1>
            {lead.priority === "HOT" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-500">
                <Flame size={12} />
                HOT LEAD
              </span>
            )}
            <span className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-medium uppercase text-muted-foreground">
              {lead.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Captured {new Date(lead.createdAt).toLocaleDateString()} ({formatRelative(lead.createdAt)})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Tag className="size-3.5" />
              Source: {lead.source}
            </span>
          </p>
        </div>

        <LeadDetailActions
          leadId={lead.id}
          phone={lead.phone}
          email={lead.email}
          status={lead.status}
          priority={lead.priority}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Details & Tasks */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    <span className="font-medium text-foreground">{lead.phone || "No phone provided"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <span className="font-medium text-foreground">{lead.email || "No email provided"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">First Contact</span>
                    <span className="font-medium text-foreground">
                      {lead.contactedAt ? new Date(lead.contactedAt).toLocaleString() : "Not contacted yet"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Channel Source</span>
                    <span className="font-medium text-foreground">{lead.source}</span>
                  </div>
                </div>
              </div>

              {lead.notes && (
                <div className="pt-3 border-t border-border">
                  <div className="flex items-start gap-2.5">
                    <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Inquiry Notes</span>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap rounded-md bg-muted/50 p-3 border border-border/50">
                        {lead.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Associated Tasks Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Follow-Up Tasks</CardTitle>
              <CardDescription>Automated and scheduled action items for this lead</CardDescription>
            </CardHeader>
            <CardContent>
              {lead.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No active tasks for this lead.</p>
              ) : (
                <div className="divide-y divide-border border rounded-lg overflow-hidden">
                  {lead.tasks.map((task) => {
                    const isOverdue = task.status === "PENDING" && new Date(task.dueAt) < new Date();
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3.5 bg-background text-sm">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{task.type.replace("_", " ")}</span>
                            {isOverdue && (
                              <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(task.dueAt).toLocaleString()}
                          </p>
                        </div>

                        {task.status === "PENDING" ? (
                          <form
                            action={async () => {
                              "use server";
                              await completeTaskAction(task.id);
                            }}
                          >
                            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                              <CheckCircle2 className="size-3.5" />
                              Mark Done
                            </Button>
                          </form>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                            <CheckCircle2 className="size-3.5" />
                            Completed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="lg:col-span-5">
          <Card className="border-border bg-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity Timeline</CardTitle>
              <CardDescription>Audited history of touchpoints and status changes</CardDescription>
            </CardHeader>
            <CardContent>
              {lead.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No activity recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {lead.activities.map((act) => {
                    const info = ACTIVITY_LABELS[act.type] || {
                      label: act.type,
                      icon: ActivityIcon,
                      color: "text-muted-foreground bg-muted",
                    };
                    const Icon = info.icon;
                    const meta = act.metadata as Record<string, unknown> | null;

                    return (
                      <div key={act.id} className="relative">
                        {/* Timeline dot */}
                        <span
                          className={`absolute -left-6 top-0 flex size-5 items-center justify-center rounded-full border border-background ring-4 ring-card ${info.color}`}
                        >
                          <Icon className="size-3" />
                        </span>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{info.label}</span>
                            <span className="text-muted-foreground">
                              {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {Boolean(meta?.from && meta?.to) && (
                            <p className="text-xs text-muted-foreground">
                              Changed from <code className="text-foreground">{String(meta?.from)}</code> to{" "}
                              <code className="text-foreground">{String(meta?.to)}</code>
                            </p>
                          )}

                          <p className="text-[11px] text-muted-foreground">
                            {new Date(act.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
