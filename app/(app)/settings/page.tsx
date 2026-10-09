import { getOrCreateBusiness } from "@/src/server/services/business.service";
import { updateBusinessAction } from "@/src/server/actions/setting.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { WebhookSettings } from "./_components/webhook-settings";

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

export default async function SettingsPage() {
  const business = await getOrCreateBusiness();

  async function action(formData: FormData) {
    "use server";
    await updateBusinessAction({
      name: formData.get("name") as string,
      industry: (formData.get("industry") as string) || undefined,
      timezone: formData.get("timezone") as string,
    });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your business profile and inbound lead integrations.</p>
      </div>

      <div className="border border-[var(--hairline)] rounded-[12px] bg-[var(--surface)] p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-[var(--ink)]">Business Profile</h2>
          <p className="text-xs text-[var(--ink-muted)]">Configure your company identity and regional timezone.</p>
        </div>

        <form action={action} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <Label htmlFor="name">Business Name *</Label>
            <Input id="name" name="name" defaultValue={business.name} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              defaultValue={business.industry ?? ""}
              placeholder="e.g. Clinic, Salon, Real Estate"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={business.timezone}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background border-input"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-lg font-medium text-[var(--ink)]">Inbound Integrations</h2>
          <p className="text-xs text-[var(--ink-muted)]">Connect website forms and WhatsApp messaging to capture leads automatically.</p>
        </div>
        <WebhookSettings businessId={business.id} />
      </div>
    </div>
  );
}