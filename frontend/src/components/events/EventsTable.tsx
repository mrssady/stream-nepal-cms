"use client";

import { Event } from "@/services/event";

type EventsTableProps = {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
};

export default function EventsTable({
  events,
  onEdit,
  onDelete,
}: EventsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Event
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Game
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Location
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Duration
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
                <div>
                  <p className="font-semibold">
                    {event.title}
                  </p>

                  <p className="text-xs text-slate-500">
                    {event.id}
                  </p>
                </div>
              </td>

              <td className="px-6 py-4">
                {event.game}
              </td>

              <td className="px-6 py-4">
                {event.location}
              </td>

              <td className="px-6 py-4">
                {new Date(
                  event.startDate,
                ).toLocaleDateString()}
                {" - "}
                {new Date(
                  event.endDate,
                ).toLocaleDateString()}
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(event)}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(event)}
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