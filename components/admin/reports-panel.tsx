"use client";

import { useQuery } from "convex/react";
import { Download } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAdminSession } from "@/components/auth/session-provider";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsPanel() {
  const { sessionToken } = useAdminSession();
  const whoHasWhat = useQuery(
    api.dashboard.getWhoHasWhat,
    sessionToken ? { sessionToken } : "skip"
  );
  const overdue = useQuery(
    api.dashboard.getOverdueCheckouts,
    sessionToken ? { sessionToken } : "skip"
  );
  const stats = useQuery(
    api.dashboard.getStats,
    sessionToken ? { sessionToken } : "skip"
  );
  const mostBorrowed = useQuery(
    api.reports.getMostBorrowedTools,
    sessionToken ? { sessionToken, days: 90, limit: 10 } : "skip"
  );
  const technicianStats = useQuery(
    api.reports.getTechnicianBorrowingStats,
    sessionToken ? { sessionToken } : "skip"
  );
  const conditionSummary = useQuery(
    api.reports.getConditionSummary,
    sessionToken ? { sessionToken } : "skip"
  );

  function exportWhoHasWhat() {
    if (!whoHasWhat) return;
    downloadCsv(
      `wagner-who-has-what-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Technician", "Employee Code", "Tool", "Asset Tag", "Checked Out At"],
      whoHasWhat.flatMap((group) =>
        group.tools.map((tool) => [
          group.technicianName,
          group.employeeCode,
          tool.name,
          tool.assetTag,
          new Date(tool.checkedOutAt).toISOString(),
        ])
      )
    );
  }

  function exportMostBorrowed() {
    if (!mostBorrowed) return;
    downloadCsv(
      `wagner-most-borrowed-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Asset Tag", "Tool", "Status", "Checkouts (90 days)"],
      mostBorrowed.map((tool) => [
        tool.assetTag,
        tool.name,
        tool.status,
        String(tool.checkouts),
      ])
    );
  }

  function exportTechnicianStats() {
    if (!technicianStats) return;
    downloadCsv(
      `wagner-technician-activity-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Technician",
        "Employee Code",
        "Active",
        "Total Checkouts",
        "Active Checkouts",
        "Overdue",
      ],
      technicianStats.map((tech) => [
        tech.name,
        tech.employeeCode,
        tech.isActive ? "Yes" : "No",
        String(tech.totalCheckouts),
        String(tech.activeCheckouts),
        String(tech.overdueCheckouts),
      ])
    );
  }

  function exportConditionSummary() {
    if (!conditionSummary) return;
    const rows: string[][] = [
      ...conditionSummary.lostTools.map((tool) => [
        "Lost",
        tool.assetTag,
        tool.name,
        tool.conditionNotes ?? "",
      ]),
      ...conditionSummary.maintenanceTools.map((tool) => [
        "Maintenance",
        tool.assetTag,
        tool.name,
        tool.conditionNotes ?? "",
      ]),
      ...conditionSummary.poorReturns.map((item) => [
        item.condition,
        item.assetTag,
        item.toolName,
        `${item.technicianName} · ${new Date(item.occurredAt).toLocaleDateString()}`,
      ]),
    ];
    downloadCsv(
      `wagner-condition-summary-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Type", "Asset Tag", "Tool", "Details"],
      rows
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        description="Who has what, utilization, borrowing trends, and condition issues"
        dataTour="page-reports"
        actions={
          <Button variant="outline" onClick={exportWhoHasWhat} disabled={!whoHasWhat?.length}>
            <Download className="mr-2 size-4" />
            Export who has what
          </Button>
        }
      />

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-3" data-tour="reports-summary">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {stats.total > 0
                  ? Math.round((stats.checkedOut / stats.total) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.checkedOut} of {stats.total} tools checked out
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Maintenance / lost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.maintenance + stats.lost}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active technicians
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.technicians}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Most borrowed tools (90 days)</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportMostBorrowed}
            disabled={!mostBorrowed?.length}
          >
            <Download className="size-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {!mostBorrowed?.length ? (
            <p className="text-sm text-muted-foreground">No check-outs in the last 90 days.</p>
          ) : (
            <ul className="space-y-2">
              {mostBorrowed.map((tool) => (
                <li
                  key={tool.toolId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-muted-foreground">{tool.assetTag}</p>
                  </div>
                  <Badge variant="secondary">{tool.checkouts} check-outs</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Technician borrowing activity</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportTechnicianStats}
            disabled={!technicianStats?.length}
          >
            <Download className="size-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {!technicianStats?.length ? (
            <p className="text-sm text-muted-foreground">No borrowing activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {technicianStats.map((tech) => (
                <li
                  key={tech.technicianId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {tech.name}{" "}
                      <span className="text-muted-foreground">({tech.employeeCode})</span>
                    </p>
                    <p className="text-muted-foreground">
                      {tech.totalCheckouts} total · {tech.activeCheckouts} active
                    </p>
                  </div>
                  {tech.overdueCheckouts > 0 ? (
                    <Badge variant="destructive">{tech.overdueCheckouts} overdue</Badge>
                  ) : (
                    <Badge variant="outline">On track</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Lost, maintenance & poor returns</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportConditionSummary}
            disabled={
              !conditionSummary ||
              (conditionSummary.lostCount === 0 &&
                conditionSummary.maintenanceCount === 0 &&
                conditionSummary.poorReturnCount === 0)
            }
          >
            <Download className="size-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!conditionSummary ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive">{conditionSummary.lostCount} lost</Badge>
                <Badge variant="outline">{conditionSummary.maintenanceCount} maintenance</Badge>
                <Badge variant="secondary">
                  {conditionSummary.poorReturnCount} poor/damaged returns
                </Badge>
              </div>

              {conditionSummary.lostTools.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-medium">Lost tools</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {conditionSummary.lostTools.map((tool) => (
                      <li key={tool._id}>
                        {tool.assetTag} — {tool.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {conditionSummary.poorReturns.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-medium">Recent poor/damaged returns</p>
                  <ul className="space-y-2 text-sm">
                    {conditionSummary.poorReturns.map((item) => (
                      <li key={item._id} className="rounded-md border px-3 py-2">
                        <p className="font-medium">
                          {item.assetTag} — {item.toolName}
                        </p>
                        <p className="text-muted-foreground">
                          {item.technicianName} · {item.condition} ·{" "}
                          {new Date(item.occurredAt).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {conditionSummary.lostCount === 0 &&
              conditionSummary.maintenanceCount === 0 &&
              conditionSummary.poorReturnCount === 0 ? (
                <p className="text-sm text-muted-foreground">No condition issues recorded.</p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who has what</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!whoHasWhat?.length ? (
            <p className="text-sm text-muted-foreground">No active checkouts.</p>
          ) : (
            whoHasWhat.map((group) => (
              <div key={group.technicianId} className="border-b pb-4 last:border-0">
                <p className="font-medium">
                  {group.technicianName}{" "}
                  <span className="text-muted-foreground">({group.employeeCode})</span>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {group.tools.map((tool) => (
                    <li key={tool.assetTag}>
                      {tool.assetTag} — {tool.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overdue tools</CardTitle>
        </CardHeader>
        <CardContent>
          {!overdue?.length ? (
            <p className="text-sm text-muted-foreground">No overdue tools.</p>
          ) : (
            <ul className="space-y-3">
              {overdue.map((item) => (
                <li key={item._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.toolName}</p>
                    <p className="text-muted-foreground">
                      {item.technicianName} · {item.assetTag}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    Due {new Date(item.dueAt).toLocaleDateString()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
