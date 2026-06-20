"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  buildYearOptions,
  formatMonthYear,
  MONTH_LABELS,
  type MonthYear,
} from "@/lib/month-year";

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Pick month",
  disabled,
  className,
  id,
  maxMonthYear,
  minMonthYear,
}: {
  value?: MonthYear;
  onChange: (value: MonthYear | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  maxMonthYear?: MonthYear;
  minMonthYear?: MonthYear;
}) {
  const [open, setOpen] = React.useState(false);
  const now = new Date();
  const [draft, setDraft] = React.useState<MonthYear>(
    value ?? { month: now.getMonth(), year: now.getFullYear() }
  );

  React.useEffect(() => {
    if (value) setDraft(value);
  }, [value]);

  const years = buildYearOptions();

  function isOutOfRange(candidate: MonthYear) {
    const ts = new Date(candidate.year, candidate.month, 1).getTime();
    if (minMonthYear) {
      const minTs = new Date(minMonthYear.year, minMonthYear.month, 1).getTime();
      if (ts < minTs) return true;
    }
    if (maxMonthYear) {
      const maxTs = new Date(maxMonthYear.year, maxMonthYear.month, 1).getTime();
      if (ts > maxTs) return true;
    }
    return false;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        render={
          <Button
            variant="outline"
            className={cn(
              "h-8 w-full min-w-[180px] justify-start px-2.5 text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 size-4 shrink-0 opacity-60" />
        {value ? formatMonthYear(value) : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Year</p>
            <Select
              value={String(draft.year)}
              onValueChange={(year) =>
                setDraft((prev) => ({ ...prev, year: Number(year) }))
              }
              items={years.map((year) => ({
                value: String(year),
                label: String(year),
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Month</p>
            <Select
              value={String(draft.month)}
              onValueChange={(month) =>
                setDraft((prev) => ({ ...prev, month: Number(month) }))
              }
              items={MONTH_LABELS.map((label, index) => ({
                value: String(index),
                label,
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_LABELS.map((label, index) => (
                  <SelectItem key={label} value={String(index)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isOutOfRange(draft)}
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
