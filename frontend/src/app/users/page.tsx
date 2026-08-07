"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";

import UsersTable from "@/components/users/UsersTable";
import CreateUserModal from "@/components/users/CreateUserModal";

import { useUsers } from "@/hooks/useUsers";

import {
  CreateUserDto,
  UpdateUserDto,
  User,
} from "@/types/user";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const {
    users,
    loading,
    addUser,
    editUser,
    removeUser,
  } = useUsers();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] =
    useState<"create" | "edit">("create");

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [loadingSubmit, setLoadingSubmit] =
    useState(false);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword),
    );
  }, [users, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE),
  );

  const paginatedUsers = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredUsers.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredUsers, currentPage]);

  async function handleCreate(
    data: CreateUserDto,
  ) {
    try {
      setLoadingSubmit(true);

      await addUser(data);

      setOpenModal(false);
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function handleEdit(
    data: UpdateUserDto,
  ) {
    if (!selectedUser) return;

    try {
      setLoadingSubmit(true);

      await editUser(selectedUser.id, data);

      setSelectedUser(null);
      setOpenModal(false);
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function handleDelete() {
    if (!selectedUser) return;

    try {
      setDeleting(true);

      await removeUser(selectedUser.id);

      setDeleteDialog(false);
      setSelectedUser(null);
    } finally {
      setDeleting(false);
    }
  }

  function openCreate() {
    setMode("create");
    setSelectedUser(null);
    setOpenModal(true);
  }

  function openEdit(user: User) {
    setMode("edit");
    setSelectedUser(user);
    setOpenModal(true);
  }

  function openDelete(user: User) {
    setSelectedUser(user);
    setDeleteDialog(true);
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading users...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage CMS users."
          action={
            <button
              onClick={openCreate}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Create User
            </button>
          }
        />

        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          placeholder="Search users..."
        />

        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="Try another search or create a new user."
          />
        ) : (
          <>
            <UsersTable
              users={paginatedUsers}
              onEdit={openEdit}
              onDelete={openDelete}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <CreateUserModal
        open={openModal}
        mode={mode}
        loading={loadingSubmit}
        initialData={selectedUser}
        onClose={() => {
          setOpenModal(false);
          setSelectedUser(null);
        }}
        onSubmit={async (data) => {
          if (mode === "create") {
            await handleCreate(
              data as CreateUserDto,
            );
          } else {
            await handleEdit(
              data as UpdateUserDto,
            );
          }
        }}
      />

      <ConfirmDialog
        open={deleteDialog}
        loading={deleting}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}