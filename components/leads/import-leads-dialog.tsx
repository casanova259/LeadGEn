"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { importLeadsAction } from "@/src/server/actions/lead.actions";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

interface ImportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simple RFC 4180 CSV parser
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentVal += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentVal.trim());
        currentVal = "";
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++; // skip \n
        }
        currentRow.push(currentVal.trim());
        if (currentRow.some((val) => val.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = "";
      } else if (char === "\n") {
        currentRow.push(currentVal.trim());
        if (currentRow.some((val) => val.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((val) => val.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

type FieldKey = "name" | "phone" | "email" | "source" | "priority" | "notes";

const FIELD_CONFIG: { key: FieldKey; label: string; required: boolean; hints: string[] }[] = [
  { key: "name", label: "Lead Name", required: true, hints: ["name", "lead", "full name", "contact", "customer"] },
  { key: "phone", label: "Phone Number", required: false, hints: ["phone", "mobile", "cell", "tel", "whatsapp"] },
  { key: "email", label: "Email Address", required: false, hints: ["email", "e-mail", "mail"] },
  { key: "source", label: "Source / Channel", required: false, hints: ["source", "channel", "origin", "medium"] },
  { key: "priority", label: "Priority", required: false, hints: ["priority", "urgency", "hot"] },
  { key: "notes", label: "Notes / Details", required: false, hints: ["notes", "note", "message", "comments", "description"] },
];

export function ImportLeadsDialog({ open, onOpenChange }: ImportLeadsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({
    name: "",
    phone: "",
    email: "",
    source: "",
    priority: "",
    notes: "",
  });
  const [autoTasks, setAutoTasks] = useState(true);
  const [step, setStep] = useState<"upload" | "mapping" | "success">("upload");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ importedCount: number; errorCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped || !dropped.name.endsWith(".csv")) return;
    processFile(dropped);
  };

  const processFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        alert("The CSV file must contain at least a header row and one data row.");
        return;
      }

      const headers = parsed[0];
      const data = parsed.slice(1);
      setCsvHeaders(headers);
      setCsvData(data);

      // Auto-detect mappings
      const newMapping: Record<FieldKey, string> = {
        name: "",
        phone: "",
        email: "",
        source: "",
        priority: "",
        notes: "",
      };

      FIELD_CONFIG.forEach((field) => {
        const found = headers.find((h) => {
          const lower = h.toLowerCase().replace(/[^a-z0-9]/g, "");
          return field.hints.some((hint) => lower.includes(hint.replace(/[^a-z0-9]/g, "")));
        });
        if (found) {
          newMapping[field.key] = found;
        }
      });

      setMapping(newMapping);
      setStep("mapping");
    };
    reader.readAsText(f);
  };

  const handleReset = () => {
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setStep("upload");
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExecuteImport = async () => {
    if (!mapping.name) {
      alert("Please map the Lead Name field before importing.");
      return;
    }

    setIsImporting(true);

    const nameIdx = csvHeaders.indexOf(mapping.name);
    const phoneIdx = mapping.phone ? csvHeaders.indexOf(mapping.phone) : -1;
    const emailIdx = mapping.email ? csvHeaders.indexOf(mapping.email) : -1;
    const sourceIdx = mapping.source ? csvHeaders.indexOf(mapping.source) : -1;
    const priorityIdx = mapping.priority ? csvHeaders.indexOf(mapping.priority) : -1;
    const notesIdx = mapping.notes ? csvHeaders.indexOf(mapping.notes) : -1;

    const leadsToImport = csvData
      .map((row) => {
        const name = row[nameIdx]?.trim();
        if (!name) return null;

        let priority: "NORMAL" | "HOT" = "NORMAL";
        if (priorityIdx !== -1) {
          const p = row[priorityIdx]?.toUpperCase() || "";
          if (p.includes("HOT") || p === "HIGH" || p === "URGENT") {
            priority = "HOT";
          }
        }

        return {
          name,
          phone: phoneIdx !== -1 ? row[phoneIdx] : undefined,
          email: emailIdx !== -1 ? row[emailIdx] : undefined,
          source: (sourceIdx !== -1 && row[sourceIdx] ? "OTHER" : "OTHER") as any,
          priority,
          notes: notesIdx !== -1 ? row[notesIdx] : undefined,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    try {
      const result = await importLeadsAction(leadsToImport, autoTasks);
      setImportResult(result);
      setStep("success");
    } catch (err) {
      console.error("Import error:", err);
      alert("An error occurred during import. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleReset();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-primary" />
            Import Leads from CSV
          </DialogTitle>
          <DialogDescription>
            Migrate contacts from Google Sheets, Excel, or Meta Lead Ads into Lost Leads.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-2">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center hover:bg-muted/40 transition cursor-pointer"
            >
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Click to select or drag and drop your .CSV file here
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports UTF-8 CSV exports from Google Sheets, Excel, or CRMs
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs border border-border/60">
              <span className="font-medium text-foreground truncate">
                📄 {file?.name} ({csvData.length} rows found)
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground underline"
              >
                Change file
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Match CSV Columns
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FIELD_CONFIG.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-medium flex items-center justify-between">
                      <span>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </span>
                    </label>
                    <select
                      value={mapping[field.key]}
                      onChange={(e) =>
                        setMapping({ ...mapping, [field.key]: e.target.value })
                      }
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs shadow-xs focus:ring-1 focus:ring-ring"
                    >
                      <option value="">-- Do Not Import --</option>
                      {csvHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview of first 3 rows */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Data Preview (First 3 Rows)
              </span>
              <div className="rounded-lg border border-border/60 overflow-x-auto text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b border-border/60">
                    <tr>
                      <th className="p-2 font-medium">Name</th>
                      <th className="p-2 font-medium">Phone</th>
                      <th className="p-2 font-medium">Email</th>
                      <th className="p-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {csvData.slice(0, 3).map((row, idx) => {
                      const nameIdx = csvHeaders.indexOf(mapping.name);
                      const phoneIdx = mapping.phone ? csvHeaders.indexOf(mapping.phone) : -1;
                      const emailIdx = mapping.email ? csvHeaders.indexOf(mapping.email) : -1;
                      const notesIdx = mapping.notes ? csvHeaders.indexOf(mapping.notes) : -1;

                      return (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="p-2 font-medium truncate max-w-[120px]">
                            {nameIdx !== -1 ? row[nameIdx] || "—" : "—"}
                          </td>
                          <td className="p-2 truncate max-w-[100px]">
                            {phoneIdx !== -1 ? row[phoneIdx] || "—" : "—"}
                          </td>
                          <td className="p-2 truncate max-w-[120px]">
                            {emailIdx !== -1 ? row[emailIdx] || "—" : "—"}
                          </td>
                          <td className="p-2 truncate max-w-[150px] text-muted-foreground">
                            {notesIdx !== -1 ? row[notesIdx] || "—" : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Auto Follow-Up Task Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoTasks}
                  onChange={(e) => setAutoTasks(e.target.checked)}
                  className="rounded border-input text-primary size-3.5 focus:ring-1 focus:ring-ring"
                />
                <span>Auto-schedule 24-hour follow-up tasks for imported leads</span>
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={isImporting}>
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteImport}
                disabled={!mapping.name || isImporting}
                className="gap-1.5"
              >
                {isImporting ? "Importing..." : `Import ${csvData.length} Leads`}
                <ArrowRight className="size-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "success" && (
          <div className="py-6 text-center space-y-4">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Import Completed!</h3>
              <p className="text-xs text-muted-foreground">
                Successfully imported{" "}
                <span className="font-semibold text-foreground">
                  {importResult?.importedCount ?? 0}
                </span>{" "}
                leads.
                {(importResult?.errorCount ?? 0) > 0 && (
                  <span> ({importResult?.errorCount} skipped due to missing name)</span>
                )}
              </p>
            </div>
            <div className="pt-2">
              <Button size="sm" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
