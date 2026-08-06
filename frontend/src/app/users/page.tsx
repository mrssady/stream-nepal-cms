"use client";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DataTable from "@/components/common/DataTable";
import { useUsers } from "@/hooks/useUsers";

export default function UsersPage() {
  const { users, loading } = useUsers();

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage CMS administrators and users."
      />

      {users.length > 0 ? (
        <DataTable
          columns={[
            { key: "name", title: "Name" },
            { key: "email", title: "Email" },
            { key: "role", title: "Role" },
          ]}
          data={users}
        />
      ) : (
        <EmptyState
          title="No users found"
          description="Create your first user to get started."
        />
      )}
    </div>
  );
}