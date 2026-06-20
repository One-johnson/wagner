"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { ToolFormDialog } from "@/components/admin/tool-form-dialog";
import { ToolsCsvImportDialog } from "@/components/admin/csv-import-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FadeInView } from "@/components/motion";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export type ToolRow = {
  _id: Id<"tools">;
  name: string;
  assetTag: string;
  barcode: string | null;
  photoId: Id<"_storage"> | null;
  photoUrl: string | null;
  categoryId: Id<"toolCategories"> | null;
  categoryName: string | null;
  status: "available" | "checked_out" | "maintenance" | "lost" | "retired";
  conditionNotes: string | null;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  available: "secondary",
  checked_out: "default",
  maintenance: "outline",
  lost: "destructive",
  retired: "outline",
};

export function ToolsPanel() {
  const { sessionToken } = useAdminSession();
  const tools = useQuery(api.tools.list, sessionToken ? { sessionToken } : "skip");
  const categories = useQuery(
    api.tools.listCategories,
    sessionToken ? { sessionToken } : "skip"
  );
  const remove = useMutation(api.tools.remove);

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolRow | null>(null);
  const [deletingTool, setDeletingTool] = useState<ToolRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!sessionToken || !deletingTool) return;
    setDeleting(true);
    try {
      await remove({ sessionToken, toolId: deletingTool._id });
      toast.success("Tool deleted");
      setDeletingTool(null);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const columns: ColumnDef<ToolRow>[] = [
    {
      accessorKey: "assetTag",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Asset tag" />,
      meta: { label: "Asset tag" },
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      meta: { label: "Name" },
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => row.original.categoryName ?? "—",
      meta: { label: "Category" },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
          {row.original.status.replace("_", " ")}
        </Badge>
      ),
      meta: { label: "Status" },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingTool(row.original)}
            aria-label={`Edit ${row.original.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingTool(row.original)}
            aria-label={`Delete ${row.original.name}`}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tools"
        description="Manage shop tool inventory"
        dataTour="page-tools"
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" />
              Import CSV
            </Button>
            <Button
              data-tour="tools-add"
              onClick={() => setAddOpen(true)}
              disabled={!categories}
            >
              <Plus className="size-4" />
              Add tool
            </Button>
          </>
        }
      />

      <FadeInView data-tour="tools-table">
        <DataTable
        columns={columns}
        data={(tools as ToolRow[]) ?? []}
        getRowId={(row) => row._id}
        filterColumnId="name"
        filterPlaceholder="Search tools…"
        isLoading={tools === undefined}
        emptyMessage="No tools found. Add your first tool to get started."
        />
      </FadeInView>

      {categories ? (
        <>
          <ToolFormDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            categories={categories}
          />
          <ToolFormDialog
            tool={editingTool ?? undefined}
            open={!!editingTool}
            onOpenChange={(open) => !open && setEditingTool(null)}
            categories={categories}
          />
        </>
      ) : null}

      <ToolsCsvImportDialog open={importOpen} onOpenChange={setImportOpen} />

      <ConfirmDialog
        open={!!deletingTool}
        onOpenChange={(open) => !open && setDeletingTool(null)}
        title="Delete tool"
        description={
          deletingTool
            ? `Permanently delete ${deletingTool.assetTag} (${deletingTool.name})? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
