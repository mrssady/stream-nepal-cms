"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

function getPageItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  const visible = new Set<number>();

  visible.add(1);
  visible.add(totalPages);

  for (
    let index = currentPage - 1;
    index <= currentPage + 1;
    index += 1
  ) {
    if (index >= 1 && index <= totalPages) {
      visible.add(index);
    }
  }

  const sorted = [...visible].sort((a, b) => a - b);

  const items: Array<number | "ellipsis"> = [];

  let previous = 0;

  for (const page of sorted) {
    if (page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
    previous = page;
  }

  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const rangeStart =
    totalItems === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const rangeEnd = Math.min(
    currentPage * itemsPerPage,
    totalItems,
  );

  const pageItems = getPageItems(
    currentPage,
    totalPages,
  );

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row dark:border-border dark:bg-card">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {rangeStart}
        </span>{" "}
        to{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {rangeEnd}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {totalItems}
        </span>{" "}
        items
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(currentPage - 1)
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-slate-400 dark:text-slate-500"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm transition ${
                currentPage === item
                  ? "bg-blue-600 text-white dark:bg-primary dark:text-primary-foreground"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
