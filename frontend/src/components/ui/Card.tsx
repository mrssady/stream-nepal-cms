import { ReactNode } from "react";
import clsx from "clsx";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}