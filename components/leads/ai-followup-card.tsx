"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  Copy,
  Check,
  CalendarPlus,
  FileText,
  RotateCw,
  Loader2,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  getLeadAiRecommendationAction,
  applyAiFollowUpAction,
} from "@/src/server/actions/lead.actions";
import type { AiFollowUpRecommendation } from "@/src/server/services/ai-followup.service";

interface AiFollowUpCardProps {
  leadId: string;
  leadPhone?: string | null;
  leadEmail?: string | null;
  initialRecommendation?: AiFollowUpRecommendation | null;
}

export function AiFollowUpCard({
  leadId,
  leadPhone,
  leadEmail,
  initialRecommendation,
}: AiFollowUpCardProps) {
  const [rec, setRec] = useState<AiFollowUpRecommendation | null>(
    initialRecommendation || null
  );
  const [isLoading, setIsLoading] = useState(!initialRecommendation);
  const [isApplying, setIsApplying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Clean phone number for WhatsApp link (strip spaces, symbols, keep digits)
  const cleanPhone = leadPhone ? leadPhone.replace(/[^0-9]/g, "") : "";

  async function handleRefresh() {
    setIsLoading(true);
    setAppliedNotice(null);
    try {
      const data = await getLeadAiRecommendationAction(leadId);
      setRec(data);
    } catch (err) {
      console.error("Failed to refresh AI recommendation:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopy() {
    if (!rec?.openingHook) return;
    navigator.clipboard.writeText(rec.openingHook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleScheduleTask() {
    if (!rec) return;
    setIsApplying(true);
    try {
      await applyAiFollowUpAction(leadId, {
        channel: rec.channel,
        timingHours: rec.timingHours,
        openingHook: rec.openingHook,
        createTask: true,
      });
      setAppliedNotice("Follow-up task scheduled!");
      setTimeout(() => setAppliedNotice(null), 3500);
    } catch (err) {
      console.error("Failed to schedule task:", err);
    } finally {
      setIsApplying(false);
    }
  }

  async function handleLogAsNote() {
    if (!rec) return;
    setIsApplying(true);
    try {
      await applyAiFollowUpAction(leadId, {
        channel: rec.channel,
        timingHours: rec.timingHours,
        openingHook: rec.openingHook,
        createTask: false,
        logAsNote: true,
      });
      setAppliedNotice("Added to lead notes!");
      setTimeout(() => setAppliedNotice(null), 3500);
    } catch (err) {
      console.error("Failed to log note:", err);
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>AI Follow-Up Strategy</span>
                {rec?.source === "gemini" && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Gemini 2.5
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Context-aware recommendations to convert this inquiry
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isApplying}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Regenerate recommendation"
          >
            <RotateCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {isLoading ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="size-6 animate-spin text-indigo-400" />
            <p className="text-xs text-muted-foreground">Analyzing lead history and generating strategy...</p>
          </div>
        ) : !rec ? (
          <div className="py-4 text-center">
            <p className="text-xs text-muted-foreground">No recommendation available.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 text-xs"
            >
              Generate Strategy
            </Button>
          </div>
        ) : (
          <>
            {/* Status & Timing Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-medium border border-border">
                {rec.channel === "WHATSAPP" ? (
                  <>
                    <MessageSquare className="size-3.5 text-emerald-500" />
                    <span>WhatsApp Outreach</span>
                  </>
                ) : rec.channel === "PHONE" ? (
                  <>
                    <Phone className="size-3.5 text-blue-500" />
                    <span>Phone Call</span>
                  </>
                ) : (
                  <>
                    <Mail className="size-3.5 text-purple-500" />
                    <span>Email Follow-up</span>
                  </>
                )}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium border ${
                  rec.urgency === "IMMEDIATE"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : rec.urgency === "TODAY"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}
              >
                <Clock className="size-3.5" />
                <span>
                  {rec.urgency === "IMMEDIATE"
                    ? `Urgent: within ${rec.timingHours}h`
                    : rec.urgency === "TODAY"
                    ? `Today (${rec.timingHours}h SLA)`
                    : `Scheduled: within ${rec.timingHours}h`}
                </span>
              </span>
            </div>

            {/* Rationale */}
            {rec.rationale && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-indigo-500/40 pl-2.5">
                {rec.rationale}
              </p>
            )}

            {/* Suggested Opening Script */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Recommended Opening Script</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs leading-relaxed text-foreground select-text">
                &ldquo;{rec.openingHook}&rdquo;
              </div>
            </div>

            {/* Talking Points */}
            {rec.talkingPoints && rec.talkingPoints.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-foreground block">Key Talking Points</span>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {rec.talkingPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Direct Outreach Shortcuts */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              {rec.channel === "WHATSAPP" && cleanPhone ? (
                <Button
                  asChild
                  size="sm"
                  className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                >
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(rec.openingHook)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="size-3.5" />
                    <span>Launch WhatsApp</span>
                    <ExternalLink className="size-3 ml-0.5 opacity-70" />
                  </a>
                </Button>
              ) : rec.channel === "PHONE" && leadPhone ? (
                <Button
                  asChild
                  size="sm"
                  className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                >
                  <a href={`tel:${leadPhone}`}>
                    <Phone className="size-3.5" />
                    <span>Call Now</span>
                  </a>
                </Button>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                onClick={handleScheduleTask}
                disabled={isApplying}
                className="h-8 gap-1.5 text-xs"
              >
                <CalendarPlus className="size-3.5 text-indigo-400" />
                <span>Schedule Task</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogAsNote}
                disabled={isApplying}
                className="h-8 gap-1.5 text-xs"
              >
                <FileText className="size-3.5" />
                <span>Add to Notes</span>
              </Button>
            </div>

            {appliedNotice && (
              <p className="text-xs text-emerald-400 font-medium text-center animate-fade-in">
                ✓ {appliedNotice}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
