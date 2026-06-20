"use client";

import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminAppSidebar } from "@/components/admin/admin-app-sidebar";
import { WagnerLogo } from "@/components/branding/wagner-logo";
import { GlobalSearch } from "@/components/admin/global-search";
import { NotificationsMenu } from "@/components/admin/notifications-menu";
import { AdminTourProvider, useAdminTour } from "@/components/admin/admin-tour-provider";
import { PageTransition } from "@/components/motion";
import type { AdminUser } from "@/lib/auth/types";

function TourTriggerButton() {
  const { startTour, isRunning } = useAdminTour();

  return (
    <Button
      variant="outline"
      size="sm"
      data-tour="tour-trigger"
      onClick={startTour}
      disabled={isRunning}
      className="hidden sm:inline-flex"
    >
      <HelpCircle className="size-4" />
      Take tour
    </Button>
  );
}

function AdminShellInner({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <AdminAppSidebar user={user} />
      <SidebarInset className="max-h-svh flex-col overflow-hidden safe-x">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur safe-top sm:gap-3 sm:px-4">
          <SidebarTrigger className="-ml-1 touch-target" data-tour="sidebar-trigger" />
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
            <WagnerLogo size="sm" className="hidden sm:inline-flex" />
            <span className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
              Wagner Vehicle Management
            </span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <GlobalSearch />
            <NotificationsMenu />
            <TourTriggerButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 safe-bottom sm:p-4 md:p-6" data-tour="page-content">
          <AnimatePresence mode="wait">
            <PageTransition key={pathname}>{children}</PageTransition>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  return (
    <AdminTourProvider>
      <AdminShellInner user={user}>{children}</AdminShellInner>
    </AdminTourProvider>
  );
}
