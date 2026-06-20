import type { ReactNode } from "react";
import { CheckCircle2, ClipboardList, Package, Wrench } from "lucide-react";
import { WagnerLogo } from "@/components/branding/wagner-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: Wrench,
    title: "Tool inventory",
    description: "Register, categorize, and track every shop tool.",
  },
  {
    icon: Package,
    title: "Check-outs & returns",
    description: "Record who has what, with due dates and history.",
  },
  {
    icon: ClipboardList,
    title: "Audit trail",
    description: "Full transaction log for accountability.",
  },
] as const;

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
    <div className="min-h-svh bg-zinc-950 lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 20% 0%, oklch(0.45 0.12 250 / 0.4), transparent 55%), radial-gradient(ellipse 50% 50% at 100% 100%, oklch(0.65 0.18 55 / 0.2), transparent 50%)",
          }}
        />
        <div className="relative">
          <WagnerLogo size="lg" />
          <p className="mt-6 max-w-sm text-lg font-medium text-zinc-100">
            Wagner Tool Management
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
            Internal system for Wagner Vehicle Management — manage workshop
            tools, technicians, and check-outs in one place.
          </p>
        </div>
        <ul className="relative space-y-5">
          {FEATURES.map(({ icon: Icon, title: featureTitle, description }) => (
            <li key={featureTitle} className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-zinc-100">
                <Icon className="size-4" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">{featureTitle}</p>
                <p className="text-sm text-zinc-400">{description}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="relative text-xs text-zinc-500">
          Authorized administrators only
        </p>
      </aside>

      <div className="relative flex flex-col items-center justify-center overflow-hidden p-4 safe-x safe-bottom lg:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 lg:hidden"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.45 0.12 250 / 0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, oklch(0.65 0.18 55 / 0.15), transparent 50%)",
          }}
        />

        <div className="relative w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center lg:hidden">
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
              {footer}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AuthSuccessBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm"
      role="status"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div>
        <p className="font-medium text-emerald-800 dark:text-emerald-300">{title}</p>
        <p className="mt-0.5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
