"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterColumnId?: string;
  filterPlaceholder?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  filterColumnId = "name",
  filterPlaceholder = "Filter…",
  children,
}: DataTableToolbarProps<TData>) {
  const column = table.getColumn(filterColumnId);
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {column ? (
          <Input
            placeholder={filterPlaceholder}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className="h-8 w-full sm:max-w-sm"
          />
        ) : null}
        {isFiltered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        ) : null}
        {children}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
