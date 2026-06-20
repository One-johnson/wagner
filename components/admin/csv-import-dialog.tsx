"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAdminSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";
import { mapCsvRows, parseCsv } from "@/lib/csv/parse-csv";

type ImportKind = "tools" | "technicians";

export function CsvImportDialog({
  kind,
  open,
  onOpenChange,
  aliases,
  templateHeaders,
  templateExample,
  onImport,
}: {
  kind: ImportKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aliases: Record<string, string[]>;
  templateHeaders: string[];
  templateExample: string[];
  onImport: (
    sessionToken: string,
    rows: Record<string, string>[]
  ) => Promise<{ created: number; skipped: number; errors: string[] }>;
}) {
  const { sessionToken } = useAdminSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  function reset() {
    setPreview([]);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function downloadTemplate() {
    const lines = [
      templateHeaders.join(","),
      templateExample.map((v) => `"${v.replace(/"/g, '""')}"`).join(","),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wagner-${kind}-import-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = parseCsv(text);
    const mapped = mapCsvRows(parsed, aliases).filter((row) =>
      Object.values(row).some((v) => v.trim().length > 0)
    );
    setPreview(mapped);
    setFileName(file.name);
  }

  async function handleImport() {
    if (!sessionToken || preview.length === 0) return;
    setLoading(true);
    try {
      const result = await onImport(sessionToken, preview);
      if (result.created > 0) {
        toast.success(`Imported ${result.created} ${kind}`);
      }
      if (result.errors.length > 0) {
        toast.error(
          `${result.skipped} row(s) skipped. ${result.errors.slice(0, 2).join(" ")}`
        );
      } else if (result.created === 0) {
        toast.error("No rows were imported. Check your CSV format.");
      }
      if (result.created > 0) handleClose(false);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const label = kind === "tools" ? "tools" : "technicians";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import {label} from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add {label}. Download the template to see the
            expected columns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="size-4" />
              Download template
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              Choose file
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </div>

          {fileName ? (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <p className="font-medium">{fileName}</p>
              <p className="text-muted-foreground">
                {preview.length} row{preview.length === 1 ? "" : "s"} ready to import
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Expected columns: {templateHeaders.join(", ")}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || preview.length === 0}
            onClick={() => void handleImport()}
          >
            {loading ? "Importing…" : `Import ${preview.length || ""} rows`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ToolsCsvImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const importTools = useMutation(api.csvImport.importTools);

  return (
    <CsvImportDialog
      kind="tools"
      open={open}
      onOpenChange={onOpenChange}
      aliases={{
        name: ["name", "toolname", "tool"],
        assetTag: ["assettag", "asset", "tag", "id"],
        category: ["category", "type"],
        barcode: ["barcode", "barcodeid"],
        conditionNotes: ["conditionnotes", "notes", "condition"],
      }}
      templateHeaders={["name", "asset_tag", "category", "barcode", "condition_notes"]}
      templateExample={["Torque Wrench", "WGV-1001", "Hand Tools", "", "Calibrated annually"]}
      onImport={async (sessionToken, rows) =>
        importTools({
          sessionToken,
          rows: rows.map((row) => ({
            name: row.name ?? "",
            assetTag: row.assetTag ?? "",
            category: row.category || undefined,
            barcode: row.barcode || undefined,
            conditionNotes: row.conditionNotes || undefined,
          })),
        })
      }
    />
  );
}

export function TechniciansCsvImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const importTechnicians = useMutation(api.csvImport.importTechnicians);

  return (
    <CsvImportDialog
      kind="technicians"
      open={open}
      onOpenChange={onOpenChange}
      aliases={{
        name: ["name", "technician", "fullname"],
        employeeCode: ["employeecode", "employeeid", "id", "code"],
      }}
      templateHeaders={["name", "employee_code"]}
      templateExample={["Alex Morgan", ""]}
      onImport={async (sessionToken, rows) =>
        importTechnicians({
          sessionToken,
          rows: rows.map((row) => ({
            name: row.name ?? "",
            employeeCode: row.employeeCode || undefined,
          })),
        })
      }
    />
  );
}
