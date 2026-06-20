"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const statusChartConfig = {
  available: { label: "Available", color: "var(--chart-3)" },
  checked_out: { label: "Checked out", color: "var(--chart-1)" },
  maintenance: { label: "Maintenance", color: "var(--chart-2)" },
  lost: { label: "Lost", color: "var(--chart-4)" },
  retired: { label: "Retired", color: "var(--chart-5)" },
} satisfies ChartConfig;

const activityChartConfig = {
  checkouts: { label: "Check-outs", color: "var(--chart-1)" },
  returns: { label: "Returns", color: "var(--chart-3)" },
} satisfies ChartConfig;

type StatusItem = {
  status: string;
  key: string;
  count: number;
};

type ActivityItem = {
  date: number;
  label: string;
  checkouts: number;
  returns: number;
  total: number;
};

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center">
      <div className="size-12 rounded-full bg-muted/60" />
      <p className="max-w-[220px] text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function ToolStatusChart({ data }: { data: StatusItem[] }) {
  if (!data.length) {
    return <ChartEmptyState message="Add tools to see inventory status breakdown." />;
  }

  const chartData = data.map((item) => ({
    ...item,
    fill: `var(--color-${item.key})`,
  }));

  return (
    <ChartContainer config={statusChartConfig} className="mx-auto aspect-auto h-[260px] w-full">
      <PieChart>
        <Tooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-mono font-medium tabular-nums">
                    {Number(value).toLocaleString()}
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={3}
          strokeWidth={2}
          stroke="var(--background)"
        >
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Pie>
        <Legend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}

export function ActivityTrendChart({ data }: { data: ActivityItem[] }) {
  const hasActivity = data.some((d) => d.total > 0);

  if (!hasActivity) {
    return (
      <ChartEmptyState message="Check-out and return activity will appear here once you start using tools." />
    );
  }

  return (
    <ChartContainer config={activityChartConfig} className="aspect-auto h-[260px] w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="fillCheckouts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-checkouts)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-checkouts)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillReturns" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-returns)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-returns)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={28}
        />
        <Tooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                String(payload?.[0]?.payload?.label ?? "")
              }
            />
          }
        />
        <Area
          type="monotone"
          dataKey="checkouts"
          stroke="var(--color-checkouts)"
          fill="url(#fillCheckouts)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="returns"
          stroke="var(--color-returns)"
          fill="url(#fillReturns)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Legend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
