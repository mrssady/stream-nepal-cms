"use client";
import Link from "next/link";
import {
  Pencil,
  Trash2,
} from "lucide-react";

import type { Event } from "@/services/event";

import { resolveMediaUrl } from "@/lib/media";

type EventsTableProps = {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
};

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

export default function EventsTable({
  events,
  onEdit,
  onDelete,
}: EventsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-muted/60">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Event
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Category
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Client
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-t border-slate-200 hover:bg-slate-50 dark:border-border dark:hover:bg-muted/40"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {event.coverImage ? (
                      <img
                        src={resolveMediaUrl(event.coverImage)}
                        alt={event.title}
                        className="size-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        SN
                      </div>
                    )}

                    <div>
                      <Link
  href={`/events/${event.id}`}
  className="font-semibold hover:text-blue-600 hover:underline"
>
  {event.title}
</Link>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        /{event.slug}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {event.category || "—"}
                </td>

                <td className="px-6 py-4">
                  {event.client || "—"}
                </td>

                <td className="px-6 py-4">
                  {formatDate(
                    event.eventDate,
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        event.isActive
                          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-slate-100 text-slate-500 dark:bg-muted dark:text-slate-400"
                      }`}
                    >
                      {event.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {event.featured && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                        Featured
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(event)
                      }
                      className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(event)
                      }
                      className="rounded-lg border border-slate-300 p-2 text-red-600 transition hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}