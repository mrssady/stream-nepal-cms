"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/services/dashboard";

import { ChartTooltip } from "./ChartTooltip";
import { EmptyChart } from "./ChartCard";

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export default function ActivityAreaChart({
  data,
}: {
  data: TrendPoint[];
}) {
  const hasData =
    data.length > 0 &&
    data.some((point) => point.count > 0);

  if (!hasData) {
    return (
      <EmptyChart label="No activity recorded yet." />
    );
  }

  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="activityFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--chart-1)"
                stopOpacity={0.35}
              />

              <stop
                offset="100%"
                stopColor="var(--chart-1)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
            tickFormatter={formatDay}
            minTickGap={28}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{
              stroke: "var(--muted-foreground)",
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="monotone"
            dataKey="count"
            name="Activities"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#activityFill)"
            dot={false}
            activeDot={{
              r: 4,
              strokeWidth: 0,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function activityTotal(data: TrendPoint[]) {
  return data.reduce(
    (sum, point) => sum + point.count,
    0,
  );
}
