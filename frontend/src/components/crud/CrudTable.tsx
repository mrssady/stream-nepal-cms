"use client";

import { CrudColumn } from "./types";

type CrudTableProps<T extends { id: string }> = {
  data: T[];
  columns: CrudColumn<T>[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
};

export default function CrudTable<
  T extends { id: string },
>({
  data,
  columns,
  onEdit,
  onDelete,
}: CrudTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-4 text-left text-sm font-semibold"
              >
                {column.title}
              </th>
            ))}

            <th className="px-6 py-4 text-right text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-t hover:bg-slate-50"
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4"
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key] ?? "-")}
                </td>
              ))}

              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(item)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}