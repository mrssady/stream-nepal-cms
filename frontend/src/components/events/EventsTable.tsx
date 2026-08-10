"use client";

import {
  Pencil,
  Trash2,
} from "lucide-react";

import {
  type Tournament,
} from "@/types/tournament";

type EventsTableProps = {
  events: Tournament[];
  onEdit: (
    event: Tournament,
  ) => void;
  onDelete: (
    event: Tournament,
  ) => void;
};

function formatGame(game: string) {
  return game
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
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
                Game
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Organizer
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Teams
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
                    {event.logo ? (
                      <img
                        src={event.logo}
                        alt={event.name}
                        className="size-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                        SN
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">
                        {event.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        /{event.slug}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {formatGame(event.game)}
                </td>

                <td className="px-6 py-4">
                  {event.organizer}
                </td>

                <td className="px-6 py-4">
                  {event.currentTeams} /{" "}
                  {event.maxTeams}
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {formatStatus(
                      event.status,
                    )}
                  </span>
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
                      <Pencil
                        size={16}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(event)
                      }
                      className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2
                        size={16}
                      />
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