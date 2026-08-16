"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { DistributionEntry } from "@/services/dashboard";

import {
  colorForIndex,
  formatCount,
} from "./chart-palette";
import { ChartTooltip } from "./ChartTooltip";
import { EmptyChart } from "./ChartCard";

export default function DistributionDonut({
  data,
  totalLabel = "Total",
}: {
  data: DistributionEntry[];
  totalLabel?: string;
}) {
  const total = data.reduce(
    (sum, entry) => sum + entry.count,
    0,
  );

  if (data.length === 0 || total === 0) {
    return (
      <EmptyChart label="No data to display yet." />
    );
  }

  return (
    <div>
      <div className="relative h-52">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(value) =>
                    formatCount(value as number)
                  }
                />
              }
            />

            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={3}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={colorForIndex(index)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">
            {formatCount(total)}
          </span>

          <span className="text-xs text-muted-foreground">
            {totalLabel}
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {data.map((entry, index) => (
          <li
            key={entry.label}
            className="flex items-center gap-2.5 text-sm"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: colorForIndex(index),
              }}
            />

            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {entry.label}
            </span>

            <span className="font-semibold">
              {formatCount(entry.count)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
