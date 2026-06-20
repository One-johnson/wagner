"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/data-table/mobile-record-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Label } from "@/components/ui/label";
import { monthYearEnd, monthYearStart, type MonthYear } from "@/lib/month-year";

type TransactionRow = {
  _id: Id<"toolTransactions">;
  type: string;
  occurredAt: number;
  toolName: string;
  assetTag: string;
  technicianName: string;
  performedByName: string;
  notes: string | null;
};

function exportCsv(rows: TransactionRow[]) {
  const header = [
    "Date",
    "Type",
    "Tool",
    "Asset Tag",
    "Technician",
    "Performed By",
    "Notes",
  ];
  const lines = rows.map((r) =>
    [
      new Date(r.occurredAt).toISOString(),
      r.type,
      r.toolName,
      r.assetTag,
      r.technicianName,
      r.performedByName,
      r.notes ?? "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wagner-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function TransactionsPanel() {
  const { sessionToken } = useAdminSession();
  const [fromMonthYear, setFromMonthYear] = useState<MonthYear | undefined>();
  const [toMonthYear, setToMonthYear] = useState<MonthYear | undefined>();

  const fromTs = fromMonthYear ? monthYearStart(fromMonthYear) : undefined;
  const toTs = toMonthYear ? monthYearEnd(toMonthYear) : undefined;

  const transactions = useQuery(
    api.transactions.list,
    sessionToken
      ? { sessionToken, fromDate: fromTs, toDate: toTs }
      : "skip"
  );

  const columns: ColumnDef<TransactionRow>[] = useMemo(
    () => [
      {
        accessorKey: "occurredAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => new Date(row.original.occurredAt).toLocaleString(),
        meta: { label: "Date" },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant={row.original.type === "checkout" ? "default" : "secondary"}>
            {row.original.type}
          </Badge>
        ),
        meta: { label: "Type" },
      },
      {
        accessorKey: "toolName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tool" />,
        meta: { label: "Tool" },
      },
      {
        accessorKey: "assetTag",
        header: "Asset tag",
        meta: { label: "Asset tag" },
      },
      {
        accessorKey: "technicianName",
        header: "Technician",
        meta: { label: "Technician" },
      },
      {
        accessorKey: "performedByName",
        header: "Recorded by",
        meta: { label: "Recorded by" },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Transactions"
        description="Full audit log of check-outs and returns"
        dataTour="page-transactions"
        actions={
          <Button
            variant="outline"
            disabled={!transactions?.length}
            onClick={() => exportCsv((transactions as TransactionRow[]) ?? [])}
          >
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        }
      />
      <div className="grid gap-4 sm:flex sm:flex-wrap sm:items-end">
        <div className="w-full space-y-2 sm:w-auto">
          <Label htmlFor="from">From month</Label>
          <MonthYearPicker
            id="from"
            value={fromMonthYear}
            onChange={setFromMonthYear}
            placeholder="Start month"
            maxMonthYear={toMonthYear}
            className="w-full"
          />
        </div>
        <div className="w-full space-y-2 sm:w-auto">
          <Label htmlFor="to">To month</Label>
          <MonthYearPicker
            id="to"
            value={toMonthYear}
            onChange={setToMonthYear}
            placeholder="End month"
            minMonthYear={fromMonthYear}
            className="w-full"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!fromMonthYear && !toMonthYear}
          onClick={() => {
            setFromMonthYear(undefined);
            setToMonthYear(undefined);
          }}
        >
          Clear range
        </Button>
      </div>
      <div data-tour="transactions-table">
        <DataTable
        columns={columns}
        data={(transactions as TransactionRow[]) ?? []}
        getRowId={(row) => row._id}
        filterColumnId="toolName"
        filterPlaceholder="Search transactions…"
        isLoading={transactions === undefined}
        emptyMessage="No transactions found."
        renderMobileBody={({ table }) => {
          const rows = table.getRowModel().rows;
          if (transactions === undefined) {
            return <MobileRecordList isLoading />;
          }
          if (!rows.length) {
            return <MobileRecordList emptyMessage="No transactions found." />;
          }
          return (
            <MobileRecordList>
              {rows.map((row) => {
                const tx = row.original;
                return (
                  <MobileRecordCard key={row.id}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{tx.toolName}</p>
                        <Badge
                          variant={tx.type === "checkout" ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {tx.type}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {tx.assetTag}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {tx.technicianName} · {new Date(tx.occurredAt).toLocaleString()}
                      </p>
                    </div>
                  </MobileRecordCard>
                );
              })}
            </MobileRecordList>
          );
        }}
        />
      </div>
    </div>
  );
}
