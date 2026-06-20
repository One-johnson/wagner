"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowRight,
  LogOut,
  Package,
  Plus,
  Users,
  Wrench,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAdminSession } from "@/components/auth/session-provider";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CheckoutDialog } from "@/components/admin/checkout-dialog";
import {
  ActivityTrendChart,
  ToolStatusChart,
} from "@/components/admin/dashboard-charts";
import { DemoDataBanner } from "@/components/admin/demo-data-banner";
import { FadeInView, MotionCard, StaggerChildren, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const content = (
    <MotionCard>
      <Card className="transition-colors hover:bg-muted/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
        </CardContent>
      </Card>
    </MotionCard>
  );
  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

function EmptyInventoryBanner() {
  return (
    <Card className="border-dashed bg-muted/20">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:text-left">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Wrench className="size-7" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold">Start with a clean slate</h3>
          <p className="max-w-xl text-sm text-muted-foreground">
            No tools in the system yet. Add your inventory, register technicians,
            then record check-outs and returns as work happens.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-2">
          <Button render={<Link href="/admin/tools" />}>
            <Plus className="size-4" />
            Add tools
          </Button>
          <Button variant="outline" render={<Link href="/admin/technicians" />}>
            Add technicians
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPanel() {
  const { sessionToken } = useAdminSession();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const stats = useQuery(
    api.dashboard.getStats,
    sessionToken ? { sessionToken } : "skip"
  );
  const recent = useQuery(
    api.dashboard.getRecentActivity,
    sessionToken ? { sessionToken, limit: 8 } : "skip"
  );
  const overdue = useQuery(
    api.dashboard.getOverdueCheckouts,
    sessionToken ? { sessionToken } : "skip"
  );
  const statusBreakdown = useQuery(
    api.dashboard.getStatusBreakdown,
    sessionToken ? { sessionToken } : "skip"
  );
  const activityTrend = useQuery(
    api.dashboard.getActivityTrend,
    sessionToken ? { sessionToken, days: 14 } : "skip"
  );

  const loading =
    !sessionToken ||
    stats === undefined ||
    statusBreakdown === undefined ||
    activityTrend === undefined;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[320px]" />
          <Skeleton className="h-[320px]" />
        </div>
      </div>
    );
  }

  const isEmpty = stats.total === 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Live overview of shop tools and recent activity"
        dataTour="page-dashboard"
        actions={
          <Button
            data-tour="dashboard-checkout"
            onClick={() => setCheckoutOpen(true)}
          >
            <LogOut className="size-4" />
            Check out tool
          </Button>
        }
      />

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />

      <DemoDataBanner />
      {isEmpty ? <EmptyInventoryBanner /> : null}

      <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="dashboard-stats">
        <StaggerItem>
          <StatCard title="Total tools" value={stats.total} icon={Wrench} href="/admin/tools" />
        </StaggerItem>
        <StaggerItem>
          <StatCard title="Available" value={stats.available} icon={Package} />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Checked out"
            value={stats.checkedOut}
            icon={Users}
            href="/admin/checkouts"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            href="/admin/reports"
          />
        </StaggerItem>
      </StaggerChildren>

      <FadeInView className="grid gap-6 lg:grid-cols-2" data-tour="dashboard-charts">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory status</CardTitle>
            <CardDescription>How tools are distributed across statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ToolStatusChart data={statusBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity trend</CardTitle>
            <CardDescription>Check-outs and returns over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityTrendChart data={activityTrend} />
          </CardContent>
        </Card>
      </FadeInView>

      <FadeInView className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Recent activity</CardTitle>
              <CardDescription>Latest check-outs and returns</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/transactions" />}
            >
              View all
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {!recent?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No transactions yet. Record a check-out to see activity here.
              </p>
            ) : (
              <ul className="space-y-3">
                {recent.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-2 text-sm transition-colors hover:border-border hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.toolName}</p>
                      <p className="truncate text-muted-foreground">
                        {item.technicianName} · {item.assetTag}
                      </p>
                    </div>
                    <Badge variant={item.type === "checkout" ? "default" : "secondary"}>
                      {item.type}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Overdue returns</CardTitle>
              <CardDescription>Tools past their due date</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/reports" />}
            >
              Reports
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {!overdue?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No overdue tools. All returns are on track.
              </p>
            ) : (
              <ul className="space-y-3">
                {overdue.map((item) => (
                  <li
                    key={item._id}
                    className="rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2.5 text-sm"
                  >
                    <p className="font-medium">{item.toolName}</p>
                    <p className="text-muted-foreground">
                      {item.technicianName} · due{" "}
                      {new Date(item.dueAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </FadeInView>
    </div>
  );
}
