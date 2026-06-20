"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { LogOut, Package } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CheckoutDialog } from "@/components/admin/checkout-dialog";
import { ReturnToolDialog } from "@/components/admin/return-tool-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/data-table/mobile-record-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ActiveCheckoutRow = {
  _id: Id<"activeCheckouts">;
  toolName: string;
  assetTag: string;
  technicianName: string;
  employeeCode: string;
  checkedOutAt: number;
  dueAt: number | null;
  isOverdue: boolean;
};

export function CheckoutsPanel() {
  const { sessionToken } = useAdminSession();
  const checkouts = useQuery(
    api.checkouts.listActive,
    sessionToken ? { sessionToken } : "skip"
  );

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [returningCheckout, setReturningCheckout] = useState<ActiveCheckoutRow | null>(null);

  const columns: ColumnDef<ActiveCheckoutRow>[] = [
    {
      accessorKey: "assetTag",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Asset tag" />,
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.assetTag}</span>
      ),
      meta: { label: "Asset tag" },
    },
    {
      accessorKey: "toolName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tool" />,
      meta: { label: "Tool" },
    },
    {
      accessorKey: "technicianName",
      header: "Technician",
      meta: { label: "Technician" },
    },
    {
      accessorKey: "checkedOutAt",
      header: "Checked out",
      cell: ({ row }) => new Date(row.original.checkedOutAt).toLocaleString(),
      meta: { label: "Checked out" },
    },
    {
      accessorKey: "dueAt",
      header: "Due",
      cell: ({ row }) =>
        row.original.dueAt ? (
          <span className={row.original.isOverdue ? "font-medium text-destructive" : ""}>
            {new Date(row.original.dueAt).toLocaleDateString()}
            {row.original.isOverdue ? (
              <Badge variant="destructive" className="ml-2">
                Overdue
              </Badge>
            ) : null}
          </span>
        ) : (
          "—"
        ),
      meta: { label: "Due" },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button size="sm" onClick={() => setReturningCheckout(row.original)}>
          <Package className="size-4" />
          Return
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Check-outs"
        description="Tools currently with technicians"
        dataTour="page-checkouts"
        actions={
          <Button data-tour="checkouts-add" onClick={() => setCheckoutOpen(true)}>
            <LogOut className="size-4" />
            Check out tool
          </Button>
        }
      />

      <div data-tour="checkouts-table">
        <DataTable
        columns={columns}
        data={(checkouts as ActiveCheckoutRow[]) ?? []}
        getRowId={(row) => row._id}
        filterColumnId="toolName"
        filterPlaceholder="Search active checkouts…"
        isLoading={checkouts === undefined}
        emptyMessage="No tools currently checked out. Use Check out tool to record one."
        renderMobileBody={({ table }) => {
          const rows = table.getRowModel().rows;
          if (checkouts === undefined) {
            return <MobileRecordList isLoading />;
          }
          if (!rows.length) {
            return (
              <MobileRecordList emptyMessage="No tools currently checked out. Use Check out tool to record one." />
            );
          }
          return (
            <MobileRecordList>
              {rows.map((row) => {
                const checkout = row.original;
                return (
                  <MobileRecordCard
                    key={row.id}
                    actions={
                      <Button
                        size="sm"
                        onClick={() => setReturningCheckout(checkout)}
                      >
                        <Package className="size-4" />
                        Return
                      </Button>
                    }
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-primary/10 text-primary">
                      <Package className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{checkout.toolName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span className="font-mono">{checkout.assetTag}</span>
                        {" · "}
                        {checkout.technicianName}
                      </p>
                      {checkout.dueAt ? (
                        <p
                          className={
                            checkout.isOverdue
                              ? "mt-0.5 text-xs font-medium text-destructive"
                              : "mt-0.5 text-xs text-muted-foreground"
                          }
                        >
                          Due {new Date(checkout.dueAt).toLocaleDateString()}
                          {checkout.isOverdue ? " · Overdue" : ""}
                        </p>
                      ) : null}
                    </div>
                  </MobileRecordCard>
                );
              })}
            </MobileRecordList>
          );
        }}
        />
      </div>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <ReturnToolDialog
        checkout={returningCheckout}
        open={!!returningCheckout}
        onOpenChange={(open) => !open && setReturningCheckout(null)}
      />
    </div>
  );
}
