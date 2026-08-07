"use client";

import { Player } from "@/services/player";

type PlayersTableProps = {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
};

export default function PlayersTable({
  players,
  onEdit,
  onDelete,
}: PlayersTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Player
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              In-Game Name
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Team
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
          {players.map((player) => (
            <tr
              key={player.id}
              className="border-t hover:bg-slate-50"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {player.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {player.id}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                {player.gameName}
              </td>

              <td className="px-6 py-4">
                {player.teamId || "-"}
              </td>

              <td className="px-6 py-4">
                {new Date(
                  player.createdAt,
                ).toLocaleDateString()}
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(player)}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(player)}
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