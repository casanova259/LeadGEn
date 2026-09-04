"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight, Sparkles, Flame, Webhook, UserPlus, X } from "lucide-react";

export function OnboardingChecklist({ businessId }: { businessId: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const STEPS = [
    {
      id: "webhook",
      title: "1. Connect your Website Form or WhatsApp",
      description: "Get your unique Inbound Webhook URL to funnel leads directly into your dashboard in real-time.",
      actionLabel: "View Webhooks",
      actionHref: "/settings",
      icon: Webhook,
    },
    {
      id: "test-lead",
      title: "2. Add your first inquiry or test lead",
      description: "Create a test lead or submit your website form to see how automated follow-up tasks are scheduled.",
      actionLabel: "+ Add Test Lead",
      actionHref: "/leads/new",
      icon: UserPlus,
    },
    {
      id: "rescue-queue",
      title: "3. Watch the Rescue Queue protect your revenue",
      description: "Any lead not contacted within 24 hours will automatically show up with an orange flame so no deal gets forgotten.",
      actionLabel: "Learn More",
      actionHref: "/leads",
      icon: Flame,
    },
  ];

  return (
    <Card className="border-border bg-gradient-to-br from-card via-card to-orange-500/5 shadow-sm relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="size-7 p-0 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss checklist"
        >
          <X size={14} />
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <Sparkles size={16} />
          </span>
          <CardTitle className="text-lg">Welcome to Lost Leads! Let&apos;s get you set up</CardTitle>
        </div>
        <CardDescription>
          Complete these 3 simple steps to activate your automated follow-up safety net.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-border bg-background/80 hover:bg-background transition space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-muted text-foreground">
                      <Icon size={13} />
                    </span>
                    <h4 className="text-xs font-semibold text-foreground tracking-tight">{step.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                <Button asChild size="sm" variant="outline" className="w-full text-xs h-8 gap-1 font-medium">
                  <Link href={step.actionHref}>
                    {step.actionLabel}
                    <ArrowRight size={12} />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
