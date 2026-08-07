"use client";

import DataTable, {
  Column,
} from "@/components/common/DataTable";

import { User } from "@/types/user";

type UsersTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export default function UsersTable({
  users,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const columns: Column<User>[] = [
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
      render: (user) => (
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {user.role}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      render: (user) =>
        new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "id",
      title: "Actions",
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(user)}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
    />
  );
}