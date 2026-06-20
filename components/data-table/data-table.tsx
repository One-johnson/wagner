"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (row: TData) => string;
  filterColumnId?: string;
  filterPlaceholder?: string;
  toolbarChildren?: React.ReactNode;
  renderToolbarActions?: (table: TanstackTable<TData>) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  mobileColumnVisibility?: VisibilityState;
  renderMobileBody?: (props: { table: TanstackTable<TData> }) => React.ReactNode;
}

function DataTablePlaceholder({ columnCount }: { columnCount: number }) {
  return (
    <div className="space-y-4">
      <div className="h-8 w-full max-w-sm animate-pulse rounded-md bg-muted" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24" />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** TanStack Table may invoke onChange during render; defer until after commit. */
function useSafeOnChange<T>(setState: React.Dispatch<React.SetStateAction<T>>) {
  return React.useCallback<OnChangeFn<T>>(
    (updater) => {
      queueMicrotask(() => setState(updater));
    },
    [setState]
  );
}

function DataTableInner<TData, TValue>({
  columns,
  data,
  getRowId,
  filterColumnId,
  filterPlaceholder,
  toolbarChildren,
  renderToolbarActions,
  isLoading = false,
  emptyMessage = "No results.",
  onRowClick,
  mobileColumnVisibility,
  renderMobileBody,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  React.useEffect(() => {
    if (!mobileColumnVisibility) return;
    setColumnVisibility(isMobile ? mobileColumnVisibility : {});
  }, [isMobile, mobileColumnVisibility]);

  const onSortingChange = useSafeOnChange(setSorting);
  const onColumnFiltersChange = useSafeOnChange(setColumnFilters);
  const onColumnVisibilityChange = useSafeOnChange(setColumnVisibility);
  const onRowSelectionChange = useSafeOnChange(setRowSelection);

  const resolvedGetRowId = React.useCallback(
    (row: TData) => getRowId!(row),
    [getRowId]
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ? resolvedGetRowId : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        filterColumnId={filterColumnId}
        filterPlaceholder={filterPlaceholder}
      >
        {renderToolbarActions?.(table)}
        {toolbarChildren}
      </DataTableToolbar>
      {isMobile && renderMobileBody ? (
        <div
          className={
            selectedCount > 0
              ? "pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-20"
              : undefined
          }
        >
          {renderMobileBody({ table })}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={onRowClick ? "cursor-pointer" : undefined}
                    onClick={
                      onRowClick
                        ? () => onRowClick(row.original)
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <DataTablePagination table={table} />
    </div>
  );
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <DataTablePlaceholder columnCount={props.columns.length} />;
  }

  return <DataTableInner {...props} />;
}
