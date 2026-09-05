"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addLeadNoteAction } from "@/src/server/actions/lead.actions";
import {
  Phone,
  Mic,
  Users2,
  FileText,
  Clock,
  Check,
  Send,
  Calendar,
} from "lucide-react";

type NoteCategory = "CALL" | "VOICEMAIL" | "MEETING" | "GENERAL";

const CATEGORIES: {
  id: NoteCategory;
  label: string;
  icon: typeof Phone;
  color: string;
  activeColor: string;
}[] = [
  {
    id: "CALL",
    label: "Call",
    icon: Phone,
    color: "text-blue-500",
    activeColor: "border-blue-500/50 bg-blue-500/10 text-blue-500",
  },
  {
    id: "VOICEMAIL",
    label: "Voicemail",
    icon: Mic,
    color: "text-purple-500",
    activeColor: "border-purple-500/50 bg-purple-500/10 text-purple-500",
  },
  {
    id: "MEETING",
    label: "Meeting",
    icon: Users2,
    color: "text-amber-500",
    activeColor: "border-amber-500/50 bg-amber-500/10 text-amber-500",
  },
  {
    id: "GENERAL",
    label: "General",
    icon: FileText,
    color: "text-zinc-400",
    activeColor: "border-zinc-500/50 bg-zinc-500/10 text-foreground",
  },
];

export function LeadNoteComposer({ leadId }: { leadId: string }) {
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<NoteCategory>("CALL");
  const [scheduleTask, setScheduleTask] = useState(false);
  const [dueDateTime, setDueDateTime] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const applyPreset = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    const offset = d.getTimezoneOffset() * 60000;
    setDueDateTime(new Date(d.getTime() - offset).toISOString().slice(0, 16));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addLeadNoteAction(leadId, {
        note: note.trim(),
        category,
        scheduleFollowUp: scheduleTask,
        followUpDueAt: scheduleTask ? new Date(dueDateTime).toISOString() : undefined,
      });

      setNote("");
      setScheduleTask(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Log Interaction / Note
        </span>
        {success && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 animate-in fade-in">
            <Check className="size-3.5" /> Note saved
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? cat.activeColor
                    : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Note Textarea */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Log details about this ${category.toLowerCase()}... (e.g. Discussed pricing, left voicemail, requested quote)`}
          rows={3}
          className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-ring resize-y min-h-[72px]"
          required
        />

        {/* Follow-Up Task Toggle */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={scheduleTask}
              onChange={(e) => setScheduleTask(e.target.checked)}
              className="rounded border-input text-primary size-3.5 focus:ring-1 focus:ring-ring"
            />
            <span>Schedule follow-up task from this note</span>
          </label>

          {scheduleTask && (
            <div className="space-y-2 rounded-lg bg-muted/30 p-2.5 border border-border/40 text-xs animate-in fade-in-50 duration-150">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset(2)}
                  className="rounded bg-background px-2 py-0.5 text-[11px] border border-border hover:bg-muted"
                >
                  +2 hours
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(24)}
                  className="rounded bg-background px-2 py-0.5 text-[11px] border border-border hover:bg-muted"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(48)}
                  className="rounded bg-background px-2 py-0.5 text-[11px] border border-border hover:bg-muted"
                >
                  +2 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(168)}
                  className="rounded bg-background px-2 py-0.5 text-[11px] border border-border hover:bg-muted"
                >
                  +1 Week
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <input
                  type="datetime-local"
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                  className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                  required={scheduleTask}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={!note.trim() || isSubmitting}
            className="gap-1.5 text-xs h-8"
          >
            <Send className="size-3.5" />
            {isSubmitting ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
