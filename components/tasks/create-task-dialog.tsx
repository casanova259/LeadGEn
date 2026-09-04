"use client";

import { useState } from "react";
import { TaskType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTaskAction } from "@/src/server/actions/task.action";
import { Phone, Mail, Clock, Calendar, Plus } from "lucide-react";

interface LeadOption {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  priority: string;
}

interface CreateTaskDialogProps {
  leads: LeadOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLeadId?: string;
}

export function CreateTaskDialog({
  leads,
  open,
  onOpenChange,
  defaultLeadId,
}: CreateTaskDialogProps) {
  const [leadId, setLeadId] = useState(defaultLeadId || (leads[0]?.id ?? ""));
  const [taskType, setTaskType] = useState<TaskType>("FOLLOW_UP");
  const [dueDateTime, setDueDateTime] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);
  const [searchLead, setSearchLead] = useState("");

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchLead.toLowerCase()) ||
      (l.phone && l.phone.includes(searchLead)) ||
      (l.email && l.email.toLowerCase().includes(searchLead.toLowerCase()))
  );

  const applyPreset = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    // adjust to local ISO string for datetime-local input
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
    setDueDateTime(localISOTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;

    setLoading(true);
    try {
      await createTaskAction({
        leadId,
        type: taskType,
        dueAt: new Date(dueDateTime).toISOString(),
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            Schedule Follow-Up Task
          </DialogTitle>
          <DialogDescription>
            Create an automated reminder or assign an outreach task for your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Lead Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="leadSelect" className="text-xs font-semibold">
              Select Lead
            </Label>
            {leads.length > 5 && (
              <Input
                placeholder="Search leads..."
                value={searchLead}
                onChange={(e) => setSearchLead(e.target.value)}
                className="mb-1.5 h-8 text-xs"
              />
            )}
            <select
              id="leadSelect"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              required
            >
              {filteredLeads.length === 0 ? (
                <option value="" disabled>
                  No matching leads found
                </option>
              ) : (
                filteredLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.priority === "HOT" ? "🔥" : ""} {l.phone ? `(${l.phone})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Task Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Task Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTaskType("FOLLOW_UP")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                  taskType === "FOLLOW_UP"
                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Clock className="size-3.5" />
                Follow-Up
              </button>
              <button
                type="button"
                onClick={() => setTaskType("CALL")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                  taskType === "CALL"
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 font-semibold shadow-xs"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Phone className="size-3.5" />
                Phone Call
              </button>
              <button
                type="button"
                onClick={() => setTaskType("EMAIL")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                  taskType === "EMAIL"
                    ? "border-violet-500 bg-violet-500/10 text-violet-600 font-semibold shadow-xs"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Mail className="size-3.5" />
                Email
              </button>
            </div>
          </div>

          {/* Due Date & Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="dueAt" className="text-xs font-semibold">
                Due Date & Time
              </Label>
              <span className="text-[11px] text-muted-foreground">Quick Presets:</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pb-1">
              <button
                type="button"
                onClick={() => applyPreset(2)}
                className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                +2 hours
              </button>
              <button
                type="button"
                onClick={() => applyPreset(24)}
                className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => applyPreset(48)}
                className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                +2 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset(168)}
                className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                +1 Week
              </button>
            </div>

            <div className="relative">
              <Input
                id="dueAt"
                type="datetime-local"
                value={dueDateTime}
                onChange={(e) => setDueDateTime(e.target.value)}
                required
                className="text-sm font-sans"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !leadId}>
              {loading ? "Scheduling..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
