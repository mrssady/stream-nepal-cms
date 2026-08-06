import { InputHTMLAttributes } from "react";
import clsx from "clsx";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className,
  ...props
}: Props) {
  return (
    <input
      {...props}
      className={clsx(
        "h-11 w-full rounded-lg border border-slate-300 bg-white px-4 outline-none transition",
        "focus:border-blue-600 focus:ring-2 focus:ring-blue-200",
        className
      )}
    />
  );
}