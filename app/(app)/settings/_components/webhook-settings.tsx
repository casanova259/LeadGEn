"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WebhookSettings({ businessId }: { businessId: string }) {
  const [copiedWeb, setCopiedWeb] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Derive origin or fallback
  const origin = typeof window !== "undefined" ? window.location.origin : "https://lost-leads.vercel.app";
  const webWebhookUrl = `${origin}/api/webhook/lead?businessId=${businessId}`;
  const waWebhookUrl = `${origin}/api/webhook/whatsapp?businessId=${businessId}`;
  const verifyToken = "lostleads_whatsapp_verify";

  const copyText = async (text: string, setFn: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setFn(true);
      setTimeout(() => setFn(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Website Lead Webhook */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Inbound Website Webhook</CardTitle>
          <CardDescription>
            Connect your website contact forms (Webflow, WordPress, custom HTML, Zapier, etc.) directly into Lost Leads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Your Website Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                readOnly
                value={webWebhookUrl}
                className="font-mono text-xs bg-muted/50"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => copyText(webWebhookUrl, setCopiedWeb)}
                className="shrink-0"
              >
                {copiedWeb ? "Copied!" : "Copy URL"}
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
{`curl -X POST "${webWebhookUrl}" \\
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
{`<form action="${webWebhookUrl}" method="POST">
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

      {/* WhatsApp Webhook Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl">WhatsApp Ingestion Webhook</CardTitle>
          <CardDescription>
            Connect incoming messages from Meta WhatsApp Cloud API or Twilio WhatsApp to capture leads instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="wa-webhook-url">WhatsApp Webhook Callback URL</Label>
            <div className="flex gap-2">
              <Input
                id="wa-webhook-url"
                readOnly
                value={waWebhookUrl}
                className="font-mono text-xs bg-muted/50"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => copyText(waWebhookUrl, setCopiedWa)}
                className="shrink-0"
              >
                {copiedWa ? "Copied!" : "Copy Callback"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste this into your Meta App Dashboard under <strong>WhatsApp &gt; Configuration &gt; Webhook Callback URL</strong> or into Twilio.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wa-verify-token">Meta Webhook Verification Token</Label>
            <div className="flex gap-2">
              <Input
                id="wa-verify-token"
                readOnly
                value={verifyToken}
                className="font-mono text-xs bg-muted/50 max-w-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => copyText(verifyToken, setCopiedToken)}
                className="shrink-0"
              >
                {copiedToken ? "Copied!" : "Copy Token"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
