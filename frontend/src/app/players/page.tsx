"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import PlayerModal from "@/components/players/PlayerModal";
import PlayersTable from "@/components/players/PlayersTable";

import { usePlayers } from "@/hooks/usePlayers";

import {
  CreatePlayerDto,
  Player,
  UpdatePlayerDto,
} from "@/services/player";

const ITEMS_PER_PAGE = 10;

export default function PlayersPage() {
  const {
    players,
    loading,
    addPlayer,
    editPlayer,
    removePlayer,
  } = usePlayers();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] =
    useState(false);

  const [mode, setMode] =
    useState<"create" | "edit">("create");

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [openDelete, setOpenDelete] =
    useState(false);

  const filteredPlayers = useMemo(() => {
    const keyword = search.toLowerCase();

    return players.filter(
      (player) =>
        player.name
          .toLowerCase()
          .includes(keyword) ||
        player.gameName
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

  const paginatedPlayers = useMemo(() => {
    const start =
      (page - 1) * ITEMS_PER_PAGE;

    return filteredPlayers.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredPlayers, page]);

  async function handleSubmit(
    data:
      | CreatePlayerDto
      | UpdatePlayerDto,
  ) {
    try {
      setSaving(true);

      if (mode === "create") {
        await addPlayer(
          data as CreatePlayerDto,
        );
      } else if (selectedPlayer) {
        await editPlayer(
          selectedPlayer.id,
          data as UpdatePlayerDto,
        );
      }

      setOpenModal(false);
      setSelectedPlayer(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedPlayer) return;

    try {
      setDeleting(true);

      await removePlayer(
        selectedPlayer.id,
      );

      setOpenDelete(false);
      setSelectedPlayer(null);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading players...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Players"
          description="Manage esports players."
          action={
            <button
              onClick={() => {
                setMode("create");
                setSelectedPlayer(null);
                setOpenModal(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Create Player
            </button>
          }
        />

        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search players..."
        />

        {filteredPlayers.length === 0 ? (
          <EmptyState
            title="No Players Found"
            description="Create your first player."
          />
        ) : (
          <>
            <PlayersTable
              players={paginatedPlayers}
              onEdit={(player) => {
                setMode("edit");
                setSelectedPlayer(
                  player,
                );
                setOpenModal(true);
              }}
              onDelete={(player) => {
                setSelectedPlayer(
                  player,
                );
                setOpenDelete(true);
              }}
            />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <PlayerModal
        open={openModal}
        mode={mode}
        loading={saving}
        initialData={selectedPlayer}
        onClose={() => {
          setOpenModal(false);
          setSelectedPlayer(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={openDelete}
        loading={deleting}
        title="Delete Player"
        message={`Are you sure you want to delete "${selectedPlayer?.name}"?`}
        onCancel={() => {
          setOpenDelete(false);
          setSelectedPlayer(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}