"use client";

import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthField({
  id,
  label,
  icon: Icon,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon ? (
          <Icon
            className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        ) : null}
        {children}
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function authInputClassName(hasIcon: boolean, hasError?: boolean) {
  return cn(hasIcon && "pl-9", hasError && "border-destructive ring-destructive/20");
}
