"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImportLeadsDialog } from "./import-leads-dialog";
import { NewLeadDialog } from "./new-lead-dialog";
import { Upload, Download, Plus, Kanban } from "lucide-react";

export function LeadsHeaderActions() {
  const [importOpen, setImportOpen] = useState(false);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const searchParams = useSearchParams();

  const handleExport = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);

    const queryString = params.toString();
    const exportUrl = `/api/leads/export${queryString ? `?${queryString}` : ""}`;
    window.location.href = exportUrl;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs h-9"
      >
        <Link href="/kanbanleads" title="Open Kanban Pipeline View">
          <Kanban className="size-3.5" />
          <span className="hidden sm:inline">Pipeline</span>
        </Link>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setImportOpen(true)}
        className="gap-1.5 text-xs h-9"
      >
        <Upload className="size-3.5" />
        <span>Import CSV</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="gap-1.5 text-xs h-9"
      >
        <Download className="size-3.5" />
        <span>Export CSV</span>
      </Button>

      <Button
        size="sm"
        onClick={() => setNewLeadOpen(true)}
        className="gap-1 text-xs h-9 cursor-pointer"
      >
        <Plus className="size-3.5" />
        <span>New Lead</span>
      </Button>

      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} />
      <ImportLeadsDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
