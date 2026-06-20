"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAdminSession } from "@/components/auth/session-provider";
import {
  TechnicianFormDialog,
  type TechnicianRow,
} from "@/components/admin/technician-form-dialog";
import { TechniciansCsvImportDialog } from "@/components/admin/csv-import-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/data-table/mobile-record-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TablePhotoCell } from "@/components/ui/table-photo-cell";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export function TechniciansPanel() {
  const { sessionToken } = useAdminSession();
  const technicians = useQuery(
    api.technicians.list,
    sessionToken ? { sessionToken } : "skip"
  );
  const remove = useMutation(api.technicians.remove);

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<TechnicianRow | null>(null);
  const [deletingTechnician, setDeletingTechnician] = useState<TechnicianRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!sessionToken || !deletingTechnician) return;
    setDeleting(true);
    try {
      await remove({ sessionToken, technicianId: deletingTechnician._id });
      toast.success("Technician deleted");
      setDeletingTechnician(null);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const columns: ColumnDef<TechnicianRow>[] = [
    {
      id: "photo",
      header: "Photo",
      cell: ({ row }) => (
        <TablePhotoCell url={row.original.photoUrl} alt={row.original.name} />
      ),
      meta: { label: "Photo" },
      enableSorting: false,
    },
    {
      accessorKey: "employeeCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee code" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.employeeCode}</span>
      ),
      meta: { label: "Employee code" },
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      meta: { label: "Name" },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "secondary" : "outline"}>
          {row.original.isActive ? "Active" : "Inactive"}
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
            onClick={() => setEditingTechnician(row.original)}
            aria-label={`Edit ${row.original.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingTechnician(row.original)}
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
        title="Technicians"
        description="Workshop staff who borrow tools"
        dataTour="page-technicians"
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" />
              Import CSV
            </Button>
            <Button data-tour="technicians-add" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add technician
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={(technicians as TechnicianRow[]) ?? []}
        getRowId={(row) => row._id}
        filterColumnId="name"
        filterPlaceholder="Search technicians…"
        isLoading={technicians === undefined}
        emptyMessage="No technicians found. Add your first technician to get started."
        renderMobileBody={({ table }) => {
          const rows = table.getRowModel().rows;
          if (technicians === undefined) {
            return <MobileRecordList isLoading />;
          }
          if (!rows.length) {
            return (
              <MobileRecordList emptyMessage="No technicians found. Add your first technician to get started." />
            );
          }
          return (
            <MobileRecordList>
              {rows.map((row) => {
                const tech = row.original;
                return (
                  <MobileRecordCard
                    key={row.id}
                    onClick={() => setEditingTechnician(tech)}
                    actions={
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTechnician(tech);
                          }}
                          aria-label={`Edit ${tech.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTechnician(tech);
                          }}
                          aria-label={`Delete ${tech.name}`}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </>
                    }
                  >
                    <TablePhotoCell url={tech.photoUrl} alt={tech.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{tech.name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {tech.employeeCode}
                      </p>
                    </div>
                    <Badge variant={tech.isActive ? "secondary" : "outline"}>
                      {tech.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </MobileRecordCard>
                );
              })}
            </MobileRecordList>
          );
        }}
      />

      <TechnicianFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <TechnicianFormDialog
        technician={editingTechnician ?? undefined}
        open={!!editingTechnician}
        onOpenChange={(open) => !open && setEditingTechnician(null)}
      />

      <TechniciansCsvImportDialog open={importOpen} onOpenChange={setImportOpen} />

      <ConfirmDialog
        open={!!deletingTechnician}
        onOpenChange={(open) => !open && setDeletingTechnician(null)}
        title="Delete technician"
        description={
          deletingTechnician
            ? `Permanently delete ${deletingTechnician.employeeCode} (${deletingTechnician.name})? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
