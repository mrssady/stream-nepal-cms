"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  CalendarDays,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Users,
} from "lucide-react";

import { useTournaments } from "@/hooks/useTournaments";

import type {
  CreateTournamentDto,
  Tournament,
  TournamentStatus,
  UpdateTournamentDto,
} from "@/types/tournament";

import TournamentFormModal from "@/components/tournaments/TournamentFormModal";

import SearchBar from "@/components/common/SearchBar";

import Pagination from "@/components/common/Pagination";

import { resolveMediaUrl } from "@/lib/media";

const ITEMS_PER_PAGE = 9;

const statusStyles: Record<
  TournamentStatus,
  string
> = {
  DRAFT:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",

  PUBLISHED:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",

  REGISTRATION_OPEN:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",

  REGISTRATION_CLOSED:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",

  LIVE:
    "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",

  COMPLETED:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",

  CANCELLED:
    "bg-slate-100 text-slate-500 dark:bg-muted dark:text-slate-400",
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function TournamentsPage() {
  const {
    tournaments,
    loading,
    addTournament,
    editTournament,
    removeTournament,
  } = useTournaments();

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState<"create" | "edit">(
      "create",
    );

  const [selected, setSelected] =
    useState<Tournament | null>(
      null,
    );

  const [saving, setSaving] =
    useState(false);

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return tournaments;
    }

    return tournaments.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(query) ||
        item.slug
          .toLowerCase()
          .includes(query) ||
        item.organizer
          .toLowerCase()
          .includes(query) ||
        item.game
          .toLowerCase()
          .includes(query),
    );
  }, [tournaments, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginated = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filtered.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filtered, currentPage]);

  function openCreate() {
    setSelected(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEdit(item: Tournament) {
    setSelected(item);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSubmit(
    data:
      | CreateTournamentDto
      | UpdateTournamentDto,
  ) {
    try {
      setSaving(true);

      if (modalMode === "create") {
        await addTournament(
          data as CreateTournamentDto,
        );
      } else if (selected) {
        await editTournament(
          selected.id,
          data as UpdateTournamentDto,
        );
      }

      setModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save the tournament.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    item: Tournament,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${item.name}"? This removes its registrations and matches.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await removeTournament(item.id);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete the tournament.",
      );
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Tournaments
          </h1>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage tournaments, team
            registrations and matches.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          <Plus size={18} />
          Create Tournament
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search tournaments..."
      />

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-border dark:bg-card dark:text-slate-400">
          Loading tournaments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center dark:border-border dark:bg-card">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {tournaments.length === 0
              ? "No Tournaments Yet"
              : "No Matching Tournaments"}
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {tournaments.length === 0
              ? "Create your first tournament."
              : "Try changing your search."}
          </p>

          {tournaments.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              Create Tournament
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paginated.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card"
            >
              {item.banner ? (
                <Link
                  href={`/dashboard/tournaments/${item.id}`}
                  className="block"
                >
                  <img
                    src={resolveMediaUrl(item.banner)}
                    alt={item.name}
                    className="h-36 w-full object-cover"
                  />
                </Link>
              ) : (
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-bold text-white">
                  {item.name
                    .split(" ")
                    .slice(0, 2)
                    .map((word) =>
                      word.charAt(0),
                    )
                    .join("")
                    .toUpperCase() || "SN"}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/tournaments/${item.id}`}
                      className="block truncate text-lg font-semibold text-slate-900 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                    >
                      {item.name}
                    </Link>

                    <p className="mt-0.5 text-xs text-slate-400">
                      /{item.slug}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[item.status]}`}
                  >
                    {formatLabel(
                      item.status,
                    )}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium dark:bg-muted">
                    {formatLabel(item.game)}
                  </span>

                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    {item.currentTeams}/
                    {item.maxTeams} teams
                  </span>

                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} />
                    {formatDate(
                      item.tournamentStart,
                    )}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-border">
                  <Link
                    href={`/dashboard/tournaments/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    <Settings2 size={15} />
                    Manage
                  </Link>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEdit(item)
                      }
                      className="rounded-lg border border-slate-300 p-2 transition hover:bg-slate-50 dark:border-border dark:hover:bg-muted"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(item)
                      }
                      className="rounded-lg border border-slate-300 p-2 text-red-600 transition hover:bg-red-50 dark:border-border dark:text-red-400 dark:hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />

      <TournamentFormModal
        open={modalOpen}
        mode={modalMode}
        loading={saving}
        initialData={selected}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setSelected(null);
          }
        }}
        onSubmit={handleSubmit}
      />
    </main>
  );
}