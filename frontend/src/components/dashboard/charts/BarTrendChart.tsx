"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/services/dashboard";

import { formatCount } from "./chart-palette";
import { ChartTooltip } from "./ChartTooltip";
import { EmptyChart } from "./ChartCard";

export default function BarTrendChart({
  data,
  color = "var(--chart-2)",
  label,
}: {
  data: TrendPoint[];
  color?: string;
  label: string;
}) {
  const hasData =
    data.length > 0 &&
    data.some((point) => point.count > 0);

  if (!hasData) {
    return (
      <EmptyChart label="No data to display yet." />
    );
  }

  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
            minTickGap={24}
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
            content={
              <ChartTooltip
                formatter={(value) =>
                  formatCount(value as number)
                }
              />
            }
            cursor={{
              fill: "var(--muted)",
              opacity: 0.4,
            }}
          />

          <Bar
            dataKey="count"
            name={label}
            fill={color}
            radius={[4, 4, 0, 0]}
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
