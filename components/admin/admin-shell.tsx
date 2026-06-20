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
      <SidebarInset className="max-h-svh flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" data-tour="sidebar-trigger" />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm font-medium text-muted-foreground">
            Wagner Vehicle Management
          </span>
          <div className="ml-auto flex items-center gap-2">
            <GlobalSearch />
            <NotificationsMenu />
            <TourTriggerButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6" data-tour="page-content">
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
