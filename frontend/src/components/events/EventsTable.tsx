"use client";

import {
  Pencil,
  Trash2,
} from "lucide-react";

import type { Event } from "@/services/event";

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
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
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
                className="border-t hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {event.coverImage ? (
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="size-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                        SN
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-slate-900">
                        {event.title}
                      </p>

                      <p className="text-xs text-slate-500">
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
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {event.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {event.featured && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
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
                      className="rounded-lg border p-2 text-slate-600 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(event)
                      }
                      className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
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