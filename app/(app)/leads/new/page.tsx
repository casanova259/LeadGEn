"use client";


import { createLeadAction } from "@/src/server/actions/lead.actions";
import { LeadSource, LeadPriority } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/Form-select";

export default function NewLeadPage() {
  async function action(formData: FormData) {
    await createLeadAction({
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      source: formData.get("source") as LeadSource,
      priority: formData.get("priority") as LeadPriority,
      notes: (formData.get("notes") as string) || undefined,
    });
  }

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">New Lead</h1>
      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div className="space-y-1.5">
          <Label>Source *</Label>
          <FormSelect
            name="source"
            defaultValue="WEBSITE"
            required
            options={[
              { value: "WEBSITE", label: "Website" },
              { value: "WHATSAPP", label: "WhatsApp" },
              { value: "PHONE", label: "Phone" },
              { value: "WALK_IN", label: "Walk-in" },
              { value: "FACEBOOK_ADS", label: "Facebook Ads" },
              { value: "INSTAGRAM_ADS", label: "Instagram Ads" },
              { value: "GOOGLE_ADS", label: "Google Ads" },
              { value: "OTHER", label: "Other" },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <FormSelect
            name="priority"
            defaultValue="NORMAL"
            options={[
              { value: "NORMAL", label: "Normal" },
              { value: "HOT", label: "Hot" },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background border-input"
          />
        </div>
        <Button type="submit">Create Lead</Button>
      </form>
    </div>
  );
}