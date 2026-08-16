import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";

export default function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-card ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-semibold">{title}</h3>

          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>

        {action}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function EmptyChart({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center">
      <BarChart3 className="size-7 text-muted-foreground/60" />

      <p className="text-sm text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
