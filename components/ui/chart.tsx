"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  const style = Object.fromEntries(
    Object.entries(config)
      .filter(([, item]) => item.color)
      .map(([key, item]) => [`--color-${key}`, item.color as string])
  ) as React.CSSProperties;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        style={style}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

type TooltipPayload = {
  name?: string;
  value?: number;
  dataKey?: string;
  color?: string;
  payload?: Record<string, unknown>;
  fill?: string;
};

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  formatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  hideLabel?: boolean;
  formatter?: (
    value: number,
    name: string,
    item: TooltipPayload
  ) => React.ReactNode;
  labelFormatter?: (label: string, payload: TooltipPayload[]) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const tooltipLabel = labelFormatter
    ? labelFormatter(label ?? "", payload)
    : label;

  return (
    <div className="grid min-w-32 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {!hideLabel && tooltipLabel ? (
        <div className="font-medium">{tooltipLabel}</div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = item.dataKey ?? item.name ?? "value";
          const itemConfig = config[key];
          const labelText = itemConfig?.label ?? item.name ?? key;

          if (formatter && item.value != null) {
            return (
              <div key={key}>{formatter(item.value, String(labelText), item)}</div>
            );
          }

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-[2px]"
                  style={{ backgroundColor: item.color ?? item.fill }}
                />
                <span className="text-muted-foreground">{labelText}</span>
              </div>
              {item.value != null ? (
                <span className="font-mono font-medium tabular-nums">
                  {item.value.toLocaleString()}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartLegendContent({
  payload,
}: {
  payload?: Array<{ value?: string; dataKey?: string; color?: string }>;
}) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
      {payload.map((item) => {
        const key = item.dataKey ?? item.value ?? "value";
        const itemConfig = config[key];
        return (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">
              {itemConfig?.label ?? item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { ChartContainer, ChartTooltipContent, ChartLegendContent };
