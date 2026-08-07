"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import TeamsTable from "@/components/teams/TeamsTable";
import TeamModal from "@/components/teams/TeamModal";

import { useTeams } from "@/hooks/useTeams";

import {
  CreateTeamDto,
  Team,
  UpdateTeamDto,
} from "@/services/team";

const ITEMS_PER_PAGE = 10;

export default function TeamsPage() {
  const {
    teams,
    loading,
    addTeam,
    editTeam,
    removeTeam,
  } = useTeams();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] =
    useState<"create" | "edit">("create");

  const [selectedTeam, setSelectedTeam] =
    useState<Team | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openDelete, setOpenDelete] =
    useState(false);

  const filteredTeams = useMemo(() => {
    const keyword = search.toLowerCase();

    return teams.filter(
      (team) =>
        team.name
          .toLowerCase()
          .includes(keyword) ||
        (team.description ?? "")
          .toLowerCase()
          .includes(keyword),
    );
  }, [teams, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTeams.length / ITEMS_PER_PAGE),
  );

  const paginatedTeams = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return filteredTeams.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredTeams, page]);

  async function handleSubmit(
    data: CreateTeamDto | UpdateTeamDto,
  ) {
    try {
      setSaving(true);

      if (mode === "create") {
        await addTeam(data as CreateTeamDto);
      } else if (selectedTeam) {
        await editTeam(
          selectedTeam.id,
          data as UpdateTeamDto,
        );
      }

      setOpenModal(false);
      setSelectedTeam(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedTeam) return;

    try {
      setDeleting(true);

      await removeTeam(selectedTeam.id);

      setOpenDelete(false);
      setSelectedTeam(null);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading teams...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Teams"
          description="Manage esports teams."
          action={
            <button
              onClick={() => {
                setMode("create");
                setSelectedTeam(null);
                setOpenModal(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Create Team
            </button>
          }
        />

        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search teams..."
        />

        {filteredTeams.length === 0 ? (
          <EmptyState
            title="No Teams Found"
            description="Create your first team."
          />
        ) : (
          <>
            <TeamsTable
              teams={paginatedTeams}
              onEdit={(team) => {
                setMode("edit");
                setSelectedTeam(team);
                setOpenModal(true);
              }}
              onDelete={(team) => {
                setSelectedTeam(team);
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

      <TeamModal
        open={openModal}
        mode={mode}
        loading={saving}
        initialData={selectedTeam}
        onClose={() => {
          setOpenModal(false);
          setSelectedTeam(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={openDelete}
        loading={deleting}
        title="Delete Team"
        message={`Are you sure you want to delete "${selectedTeam?.name}"?`}
        onCancel={() => {
          setOpenDelete(false);
          setSelectedTeam(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}