"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-border dark:bg-card">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg border border-slate-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
      >
        Previous
      </button>

      <div className="flex items-center gap-2">
        {Array.from(
          { length: totalPages },
          (_, index) => (
            <button
              key={index}
              onClick={() =>
                onPageChange(index + 1)
              }
              className={`h-10 w-10 rounded-lg transition ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white dark:bg-primary dark:text-primary-foreground"
                  : "border border-slate-300 hover:bg-slate-100 dark:border-border dark:hover:bg-muted"
              }`}
            >
              {index + 1}
            </button>
          ),
        )}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg border border-slate-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
      >
        Next
      </button>
    </div>
  );
}