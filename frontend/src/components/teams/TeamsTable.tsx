"use client";

import { Team } from "@/services/team";

type TeamsTableProps = {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
};

export default function TeamsTable({
  teams,
  onEdit,
  onDelete,
}: TeamsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Team
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Description
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Created
            </th>

            <th className="px-6 py-4 text-right text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => (
            <tr
              key={team.id}
              className="border-t hover:bg-slate-50"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                    {team.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {team.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {team.id}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 text-slate-600">
                {team.description || "-"}
              </td>

              <td className="px-6 py-4 text-slate-600">
                {new Date(
                  team.createdAt,
                ).toLocaleDateString()}
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(team)}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(team)}
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