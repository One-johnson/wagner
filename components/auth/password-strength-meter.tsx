"use client";

import { getPasswordStrength } from "@/lib/auth/password-strength";
import { cn } from "@/lib/utils";

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label } = getPasswordStrength(password);
  const segments = [0, 1, 2, 3, 4] as const;

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1">
        {segments.map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-muted transition-colors",
              score > 0 && segment <= score && score === 1 && "bg-destructive",
              score > 0 && segment <= score && score === 2 && "bg-amber-500",
              score > 0 && segment <= score && score === 3 && "bg-primary/70",
              score > 0 && segment <= score && score >= 4 && "bg-emerald-500"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Password strength: {label}</p>
    </div>
  );
}
