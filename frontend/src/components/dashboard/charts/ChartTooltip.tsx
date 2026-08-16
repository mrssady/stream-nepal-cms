interface TooltipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatter?: (value: number | string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{label}</p>

      {payload.map((entry, index) => (
        <p
          key={index}
          className="mt-1 flex items-center gap-2 text-muted-foreground"
        >
          <span
            className="size-2 rounded-full"
            style={{
              backgroundColor: entry.color,
            }}
          />

          {entry.name}:{" "}
          <span className="font-semibold text-foreground">
            {formatter
              ? formatter(entry.value ?? 0)
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}
