import { createLeadAction } from "@/src/server/actions/lead.actions";
import { LeadSource, LeadPriority } from "@prisma/client";

export default function NewLeadPage() {
  async function action(formData: FormData) {
    "use server";
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
        <div>
          <label className="text-sm font-medium">Name *</label>
          <input name="name" required className="w-full border rounded-md px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input name="phone" className="w-full border rounded-md px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" className="w-full border rounded-md px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Source *</label>
          <select name="source" required className="w-full border rounded-md px-3 py-2 text-sm mt-1">
            <option value="WEBSITE">Website</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PHONE">Phone</option>
            <option value="WALK_IN">Walk-in</option>
            <option value="FACEBOOK_ADS">Facebook Ads</option>
            <option value="INSTAGRAM_ADS">Instagram Ads</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Priority</label>
          <select name="priority" className="w-full border rounded-md px-3 py-2 text-sm mt-1">
            <option value="NORMAL">Normal</option>
            <option value="HOT">Hot</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea name="notes" className="w-full border rounded-md px-3 py-2 text-sm mt-1" rows={3} />
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
          Create Lead
        </button>
      </form>
    </div>
  );
}