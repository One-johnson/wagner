import type { ReactNode } from "react";
import { WagnerLogo } from "@/components/branding/wagner-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-zinc-950 p-4 safe-x safe-bottom">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.45 0.12 250 / 0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, oklch(0.65 0.18 55 / 0.15), transparent 50%)",
        }}
      />

      <div className="relative w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <WagnerLogo size="xl" />
          <p className="mt-4 text-sm font-medium tracking-wide text-zinc-400 uppercase">
            Tool Management System
          </p>
        </div>

        <Card className="border-zinc-200/10 bg-background/95 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
            {footer ? <div className="pt-2">{footer}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
