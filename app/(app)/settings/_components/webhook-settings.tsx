"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WebhookSettings({ businessId }: { businessId: string }) {
  const [copied, setCopied] = useState(false);

  // Derive origin or fallback
  const origin = typeof window !== "undefined" ? window.location.origin : "https://lost-leads.vercel.app";
  const webhookUrl = `${origin}/api/webhook/lead?businessId=${businessId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Card className="mt-8 border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Inbound Lead Webhook</CardTitle>
        <CardDescription>
          Connect your website contact forms (Webflow, WordPress, custom HTML, Zapier, etc.) directly into Lost Leads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Your Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              readOnly
              value={webhookUrl}
              className="font-mono text-xs bg-muted/50"
            />
            <Button
              type="button"
              variant="outline"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? "Copied!" : "Copy URL"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Any POST request sent to this URL with a <code>name</code>, <code>email</code>, or <code>phone</code> will instantly create a lead and a 24h follow-up task.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Example cURL Request
          </Label>
          <pre className="p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto text-foreground">
{`curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "notes": "Interested in private consultation"
  }'`}
          </pre>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Example HTML Form Submission
          </Label>
          <pre className="p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto text-foreground">
{`<form action="${webhookUrl}" method="POST">
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="Email" />
  <input type="tel" name="phone" placeholder="Phone" />
  <textarea name="notes" placeholder="Message"></textarea>
  <button type="submit">Submit</button>
</form>`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
