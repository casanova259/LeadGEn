"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImportLeadsDialog } from "./import-leads-dialog";
import { Upload, Download, Plus } from "lucide-react";

export function LeadsHeaderActions() {
  const [importOpen, setImportOpen] = useState(false);
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

      <Button asChild size="sm" className="gap-1 text-xs h-9">
        <Link href="/leads/new">
          <Plus className="size-3.5" />
          <span>New Lead</span>
        </Link>
      </Button>

      <ImportLeadsDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
