"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import ImageUpload from "@/components/media/ImageUpload";

import SearchBar from "@/components/common/SearchBar";

import Pagination from "@/components/common/Pagination";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/Input";

import { usePlayers } from "@/hooks/usePlayers";

import { resolveMediaUrl } from "@/lib/media";

import type {
  CreatePlayerDto,
  Player,
  PlayerRole,
  UpdatePlayerDto,
} from "@/types/player";

function getApiErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const response = (
      error as {
        response: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

const ITEMS_PER_PAGE = 10;

const PLAYER_ROLES: PlayerRole[] = [
  "CAPTAIN",
  "PLAYER",
  "SUBSTITUTE",
  "COACH",
  "MANAGER",
];

const roleStyles: Record<
  PlayerRole,
  string
> = {
  CAPTAIN:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",

  PLAYER:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",

  SUBSTITUTE:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",

  COACH:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",

  MANAGER:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
};

function formatRole(role: PlayerRole) {
  return role
    .toLowerCase()
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

type PlayerFormState = {
  teamId: string;
  fullName: string;
  inGameName: string;
  gameUID: string;
  role: PlayerRole;
  country: string;
  nationality: string;
  profileImage: string;
  slotNumber: string;
  isActive: boolean;
};

function buildForm(
  player: Player | null,
): PlayerFormState {
  return {
    teamId: player?.teamId ?? "",
    fullName: player?.fullName ?? "",
    inGameName: player?.inGameName ?? "",
    gameUID: player?.gameUID ?? "",
    role: player?.role ?? "PLAYER",
    country: player?.country ?? "",
    nationality: player?.nationality ?? "",
    profileImage: player?.profileImage ?? "",
    slotNumber:
      player?.slotNumber?.toString() ??
      "0",
    isActive: player?.isActive ?? true,
  };
}

export default function PlayersPage() {
  const {
    players,
    teams,
    tournaments,
    loading,
    teamsLoading,
    addPlayer,
    editPlayer,
    removePlayer,
  } = usePlayers();

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingPlayer, setEditingPlayer] =
    useState<Player | null>(null);

  const [deletingPlayer, setDeletingPlayer] =
    useState<Player | null>(null);

  const [form, setForm] =
    useState<PlayerFormState>(() =>
      buildForm(null),
    );

  const [creating, setCreating] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const tournamentNameById = useMemo(() => {
    const map = new Map<
      string,
      string
    >();

    tournaments.forEach(
      (tournament) => {
        map.set(
          tournament.id,
          tournament.name,
        );
      },
    );

    return map;
  }, [tournaments]);

  const teamsByTournament = useMemo(() => {
    const map = new Map<
      string,
      typeof teams
    >();

    teams.forEach((team) => {
      const tournamentId =
        team.registration
          ?.tournamentId ??
        "unassigned";

      const list =
        map.get(tournamentId) ?? [];

      list.push(team);

      map.set(tournamentId, list);
    });

    return map;
  }, [teams]);

  const filteredPlayers = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return players;
    }

    return players.filter(
      (player) =>
        player.fullName
          .toLowerCase()
          .includes(keyword) ||
        player.inGameName
          .toLowerCase()
          .includes(keyword) ||
        player.gameUID
          .toLowerCase()
          .includes(keyword) ||
        (player.team?.teamName ?? "")
          .toLowerCase()
          .includes(keyword) ||
        player.role
          .toLowerCase()
          .includes(keyword),
    );
  }, [players, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPlayers.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedPlayers = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredPlayers.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [
    filteredPlayers,
    currentPage,
  ]);

  function handleSearch(
    value: string,
  ) {
    setSearch(value);
    setPage(1);
  }

  function openCreateDialog() {
    setFormError("");
    setForm(buildForm(null));
    setCreateOpen(true);
  }

  function openEditDialog(
    player: Player,
  ) {
    setFormError("");
    setEditingPlayer(player);
    setForm(buildForm(player));
    setEditOpen(true);
  }

  function openDeleteDialog(
    player: Player,
  ) {
    setFormError("");
    setDeletingPlayer(player);
    setDeleteOpen(true);
  }

  function handleFieldChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "isActive"
          ? value === "true"
          : value,
    }));
  }

  function handleCheckboxChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      isActive:
        event.target.checked,
    }));
  }

  async function submitPlayer(
    event: FormEvent<HTMLFormElement>,
    mode: "create" | "edit",
  ) {
    event.preventDefault();

    setFormError("");

    if (
      !form.teamId ||
      !form.fullName.trim() ||
      !form.inGameName.trim() ||
      !form.gameUID.trim()
    ) {
      setFormError(
        "Team, full name, in-game name and game UID are required.",
      );

      return;
    }

    const payload:
      | CreatePlayerDto
      | UpdatePlayerDto = {
      teamId: form.teamId,
      fullName: form.fullName.trim(),
      inGameName: form.inGameName.trim(),
      gameUID: form.gameUID.trim(),
      role: form.role,
      country:
        form.country.trim() ||
        undefined,
      nationality:
        form.nationality.trim() ||
        undefined,
      profileImage:
        form.profileImage.trim() ||
        undefined,
      slotNumber:
        Number(form.slotNumber) || 0,
      isActive: form.isActive,
    };

    try {
      if (mode === "create") {
        setCreating(true);
        await addPlayer(
          payload as CreatePlayerDto,
        );
        setCreateOpen(false);
      } else {
        if (!editingPlayer) {
          return;
        }

        setUpdating(true);
        await editPlayer(
          editingPlayer.id,
          payload as UpdatePlayerDto,
        );
        setEditOpen(false);
        setEditingPlayer(null);
      }

      setForm(buildForm(null));
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          mode === "create"
            ? "Failed to create player."
            : "Failed to update player.",
        ),
      );
    } finally {
      setCreating(false);
      setUpdating(false);
    }
  }

  async function handleDeletePlayer() {
    if (!deletingPlayer) {
      return;
    }

    setFormError("");

    try {
      setDeleting(true);

      await removePlayer(
        deletingPlayer.id,
      );

      setDeleteOpen(false);
      setDeletingPlayer(null);
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "Failed to delete player.",
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Players
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage tournament players and
            rosters.
          </p>
        </div>

        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Loading players...
        </div>
      </div>
    );
  }

  const teamOptions = Array.from(
    teamsByTournament.entries(),
  ).sort(
    ([a], [b]) => {
      const nameA =
        tournamentNameById.get(a) ??
        "Misc";

      const nameB =
        tournamentNameById.get(b) ??
        "Misc";

      return nameA.localeCompare(nameB);
    },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Players
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage tournament players and
            rosters.
          </p>
        </div>

        <Button
          onClick={openCreateDialog}
        >
          <Plus className="size-4" />
          Create Player
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Search players..."
      />

      {filteredPlayers.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <p className="font-medium">
            {search
              ? "No players found"
              : "No players yet"}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try a different search."
              : "Create your first tournament player."}
          </p>

          {!search && (
            <Button
              className="mt-4"
              onClick={openCreateDialog}
            >
              <Plus className="size-4" />
              Create Player
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">
                      Player
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Team
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Game UID
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Created
                    </th>

                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {paginatedPlayers.map(
                    (player) => (
                      <tr
                        key={player.id}
                        className="transition hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {player.profileImage ? (
                              <img
                                src={resolveMediaUrl(
                                  player.profileImage,
                                )}
                                alt={player.fullName}
                                className="size-9 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                {player.fullName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <span className="block font-medium">
                                {player.fullName}
                              </span>

                              <span className="block text-xs text-muted-foreground">
                                {player.inGameName}
                                {player.slotNumber
                                  ? `  ·  Slot ${player.slotNumber}`
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {player.team
                            ?.teamName ?? "—"}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {player.gameUID}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[player.role]}`}
                          >
                            {formatRole(
                              player.role,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              player.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                : "bg-slate-100 text-slate-500 dark:bg-muted dark:text-slate-400"
                            }`}
                          >
                            {player.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {formatDate(
                            player.createdAt,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit player"
                              onClick={() =>
                                openEditDialog(
                                  player,
                                )
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete player"
                              onClick={() =>
                                openDeleteDialog(
                                  player,
                                )
                              }
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={
              filteredPlayers.length
            }
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
          />
        </>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create Player
            </DialogTitle>

            <DialogDescription>
              Add a new player to a
              tournament team roster.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) =>
              submitPlayer(
                event,
                "create",
              )
            }
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Team
              </label>

              {teamsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading teams...
                </p>
              ) : teams.length === 0 ? (
                <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  No tournament teams yet.
                  Approve a registration to
                  create a team first.
                </p>
              ) : (
                <select
                  name="teamId"
                  value={form.teamId}
                  onChange={
                    handleFieldChange
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">
                    Select a team
                  </option>

                  {teamOptions.map(
                    ([
                      tournamentId,
                      teamList,
                    ]) => (
                      <optgroup
                        key={tournamentId}
                        label={
                          tournamentNameById.get(
                            tournamentId,
                          ) ??
                          "Unassigned"
                        }
                      >
                        {teamList.map(
                          (team) => (
                            <option
                              key={team.id}
                              value={team.id}
                            >
                              {team.teamName}
                              {team.shortName
                                ? ` (${team.shortName})`
                                : ""}
                            </option>
                          ),
                        )}
                      </optgroup>
                    ),
                  )}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Full Name
              </label>

              <Input
                name="fullName"
                value={form.fullName}
                onChange={
                  handleFieldChange
                }
                placeholder="Player full name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                In-Game Name
              </label>

              <Input
                name="inGameName"
                value={form.inGameName}
                onChange={
                  handleFieldChange
                }
                placeholder="IGN / IGNPDX"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Game UID
              </label>

              <Input
                name="gameUID"
                value={form.gameUID}
                onChange={
                  handleFieldChange
                }
                placeholder="Game account UID"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={
                    handleFieldChange
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {PLAYER_ROLES.map(
                    (role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {formatRole(
                          role,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Slot Number
                </label>

                <Input
                  type="number"
                  min={0}
                  name="slotNumber"
                  value={form.slotNumber}
                  onChange={
                    handleFieldChange
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Country
                </label>

                <Input
                  name="country"
                  value={form.country}
                  onChange={
                    handleFieldChange
                  }
                  placeholder="Nepal"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Nationality
                </label>

                <Input
                  name="nationality"
                  value={form.nationality}
                  onChange={
                    handleFieldChange
                  }
                  placeholder="Nepali"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Profile Image
              </label>

              <ImageUpload
                value={form.profileImage}
                folder="players"
                onChange={(result) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      profileImage:
                        result?.url ??
                        "",
                    }),
                  )
                }
                disabled={creating}
              />
            </div>

            <label className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={
                  handleCheckboxChange
                }
                disabled={creating}
              />

              <span className="text-sm font-medium">
                Active
              </span>
            </label>

            {formError && (
              <p className="text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCreateOpen(false)
                }
                disabled={creating}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  creating ||
                  teams.length === 0
                }
              >
                {creating
                  ? "Creating..."
                  : "Create Player"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Player
            </DialogTitle>

            <DialogDescription>
              Update this player&apos;s
              information.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) =>
              submitPlayer(
                event,
                "edit",
              )
            }
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Team
              </label>

              {teamsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading teams...
                </p>
              ) : teams.length === 0 ? (
                <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  No tournament teams yet.
                  Approve a registration to
                  create a team first.
                </p>
              ) : (
                <select
                  name="teamId"
                  value={form.teamId}
                  onChange={
                    handleFieldChange
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">
                    Select a team
                  </option>

                  {teamOptions.map(
                    ([
                      tournamentId,
                      teamList,
                    ]) => (
                      <optgroup
                        key={tournamentId}
                        label={
                          tournamentNameById.get(
                            tournamentId,
                          ) ??
                          "Unassigned"
                        }
                      >
                        {teamList.map(
                          (team) => (
                            <option
                              key={team.id}
                              value={team.id}
                            >
                              {team.teamName}
                              {team.shortName
                                ? ` (${team.shortName})`
                                : ""}
                            </option>
                          ),
                        )}
                      </optgroup>
                    ),
                  )}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Full Name
              </label>

              <Input
                name="fullName"
                value={form.fullName}
                onChange={
                  handleFieldChange
                }
                placeholder="Player full name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                In-Game Name
              </label>

              <Input
                name="inGameName"
                value={form.inGameName}
                onChange={
                  handleFieldChange
                }
                placeholder="IGN / IGNPDX"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Game UID
              </label>

              <Input
                name="gameUID"
                value={form.gameUID}
                onChange={
                  handleFieldChange
                }
                placeholder="Game account UID"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={
                    handleFieldChange
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                >
                  {PLAYER_ROLES.map(
                    (role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {formatRole(
                          role,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Slot Number
                </label>

                <Input
                  type="number"
                  min={0}
                  name="slotNumber"
                  value={form.slotNumber}
                  onChange={
                    handleFieldChange
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Country
                </label>

                <Input
                  name="country"
                  value={form.country}
                  onChange={
                    handleFieldChange
                  }
                  placeholder="Nepal"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Nationality
                </label>

                <Input
                  name="nationality"
                  value={form.nationality}
                  onChange={
                    handleFieldChange
                  }
                  placeholder="Nepali"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Profile Image
              </label>

              <ImageUpload
                value={form.profileImage}
                folder="players"
                onChange={(result) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      profileImage:
                        result?.url ??
                        "",
                    }),
                  )
                }
                disabled={updating}
              />
            </div>

            <label className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={
                  handleCheckboxChange
                }
                disabled={updating}
              />

              <span className="text-sm font-medium">
                Active
              </span>
            </label>

            {formError && (
              <p className="text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setEditOpen(false)
                }
                disabled={updating}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updating}
              >
                {updating
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Player
            </DialogTitle>

            <DialogDescription>
              This action cannot be undone.
              The player will be permanently
              removed from the roster.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="font-medium">
                {deletingPlayer?.fullName}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {deletingPlayer?.inGameName}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Team:{" "}
                {deletingPlayer?.team
                  ?.teamName ?? "—"}
              </p>
            </div>

            {formError && (
              <p className="text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDeleteOpen(false)
                }
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={
                  handleDeletePlayer
                }
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Player"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}