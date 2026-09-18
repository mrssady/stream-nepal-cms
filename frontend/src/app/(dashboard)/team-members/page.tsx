"use client";

import { useMemo, useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { useTeamMembers } from "@/hooks/useTeamMembers";

import type {
  CreateTeamMemberDto,
  Department,
  TeamMember,
  UpdateTeamMemberDto,
} from "@/types/team-member";

import TeamMemberModal from "@/components/team-members/TeamMemberModal";

import SearchBar from "@/components/common/SearchBar";

import Pagination from "@/components/common/Pagination";

import { resolveMediaUrl } from "@/lib/media";

const ITEMS_PER_PAGE = 9;

const departmentStyles: Record<
  Department,
  string
> = {
  MANAGEMENT:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",

  ESPORTS:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",

  BROADCAST:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",

  PRODUCTION:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",

  MEDIA:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",

  MARKETING:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

export default function TeamMembersPage() {
  const {
    members,
    loading,
    addMember,
    editMember,
    removeMember,
  } = useTeamMembers();

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

  const [selectedMember, setSelectedMember] =
    useState<TeamMember | null>(
      null,
    );

  const [saving, setSaving] =
    useState(false);

  const filteredMembers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return members;
    }

    return members.filter(
      (member) =>
        member.fullName
          .toLowerCase()
          .includes(query) ||
        (member.nickname ?? "")
          .toLowerCase()
          .includes(query) ||
        member.position
          .toLowerCase()
          .includes(query) ||
        member.department
          .toLowerCase()
          .includes(query),
    );
  }, [members, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMembers.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedMembers = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredMembers.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredMembers, currentPage]);

  function openCreate() {
    setSelectedMember(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setSelectedMember(member);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSubmit(
    data:
      | CreateTeamMemberDto
      | UpdateTeamMemberDto,
  ) {
    try {
      setSaving(true);

      if (modalMode === "create") {
        await addMember(
          data as CreateTeamMemberDto,
        );
      } else if (selectedMember) {
        await editMember(
          selectedMember.id,
          data as UpdateTeamMemberDto,
        );
      }

      setModalOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save the team member.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    member: TeamMember,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${member.fullName}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await removeMember(member.id);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete the team member.",
      );
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Team Members
          </h1>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            The Stream Nepal crew shown on
            the public website.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search team members..."
      />

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-border dark:bg-card dark:text-slate-400">
          Loading team members...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center dark:border-border dark:bg-card">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {members.length === 0
              ? "No Team Members Yet"
              : "No Matching Team Members"}
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {members.length === 0
              ? "Add your first crew member."
              : "Try changing your search."}
          </p>

          {members.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              Add Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paginatedMembers.map(
            (member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card"
              >
                <div className="flex items-center gap-4 p-6">
                  {member.profileImage ? (
                    <img
                      src={resolveMediaUrl(
                        member.profileImage,
                      )}
                      alt={member.fullName}
                      className="size-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      {member.fullName
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                      {member.fullName}
                    </h2>

                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {member.nickname
                        ? `"${member.nickname}" · `
                        : ""}
                      {formatLabel(
                        member.position,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 dark:border-border">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${departmentStyles[member.department]}`}
                    >
                      {formatLabel(
                        member.department,
                      )}
                    </span>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        member.isActive
                          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-slate-100 text-slate-500 dark:bg-muted dark:text-slate-400"
                      }`}
                    >
                      {member.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEdit(member)
                      }
                      className="rounded-lg border border-slate-300 p-2 transition hover:bg-slate-50 dark:border-border dark:hover:bg-muted"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(member)
                      }
                      className="rounded-lg border border-slate-300 p-2 text-red-600 transition hover:bg-red-50 dark:border-border dark:text-red-400 dark:hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={
          filteredMembers.length
        }
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />

      <TeamMemberModal
        open={modalOpen}
        mode={modalMode}
        loading={saving}
        initialData={selectedMember}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setSelectedMember(null);
          }
        }}
        onSubmit={handleSubmit}
      />
    </main>
  );
}