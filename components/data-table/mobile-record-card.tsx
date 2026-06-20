"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MobileRecordCard({
  children,
  actions,
  onClick,
  className,
}: {
  children: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-colors",
        onClick && "hover:bg-muted/40 active:bg-muted/60",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">{children}</div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </Comp>
  );
}

export function MobileRecordList({
  children,
  emptyMessage,
  isLoading,
}: {
  children?: ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage ?? "No results."}
      </p>
    );
  }

  return <div className="space-y-2">{children}</div>;
}
