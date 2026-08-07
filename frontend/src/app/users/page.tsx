"use client";

import { useState } from "react";

import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import CreateUserModal from "@/components/users/CreateUserModal";

import { useUsers } from "@/hooks/useUsers";
import { CreateUserDto } from "@/types/user";

export default function UsersPage() {
  const {
    users,
    loading,
    addUser,
  } = useUsers();

  const [openCreateModal, setOpenCreateModal] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  async function handleCreateUser(
    data: CreateUserDto,
  ) {
    try {
      setCreating(true);

      await addUser(data);

      setOpenCreateModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading users...</p>
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
              onClick={() =>
                setOpenCreateModal(true)
              }
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Create User
            </button>
          }
        />

        {users.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="Create your first user."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: "name",
                title: "Name",
              },
              {
                key: "email",
                title: "Email",
              },
              {
                key: "role",
                title: "Role",
              },
              {
                key: "createdAt",
                title: "Created",
              },
            ]}
            data={users}
          />
        )}
      </div>

      <CreateUserModal
        open={openCreateModal}
        loading={creating}
        onClose={() =>
          setOpenCreateModal(false)
        }
        onSubmit={handleCreateUser}
      />
    </>
  );
}