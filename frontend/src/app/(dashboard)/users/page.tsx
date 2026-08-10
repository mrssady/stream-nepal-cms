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
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  createUser,
  updateUser,
  deleteUser,
} from "@/services/users";

import { useUsers } from "@/hooks/useUsers";

import {
  type User,
  type UserRole,
} from "@/types/user";

const ITEMS_PER_PAGE = 10;

const roleStyles: Record<UserRole, string> = {
  OWNER:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",

  CO_OWNER:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",

  ADMIN:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",

  MANAGER:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",

  STAFF:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
};

function formatRole(role: UserRole) {
  return role.replace("_", " ");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function UsersPage() {
  const {
    users,
    loading,
  } = useUsers();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [deletingUser, setDeletingUser] =
    useState<User | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as UserRole,
  });

  const [creating, setCreating] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const filteredUsers = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name
          .toLowerCase()
          .includes(keyword) ||
        user.email
          .toLowerCase()
          .includes(keyword) ||
        user.role
          .toLowerCase()
          .includes(keyword),
    );
  }, [users, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedUsers = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredUsers.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [
    filteredUsers,
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

    setForm({
      name: "",
      email: "",
      password: "",
      role: "STAFF",
    });

    setCreateOpen(true);
  }

  function openEditDialog(user: User) {
    setFormError("");

    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setEditOpen(true);
  }

  function openDeleteDialog(user: User) {
    setFormError("");

    setDeletingUser(user);
    setDeleteOpen(true);
  }

  async function handleCreateUser(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setFormError(
        "Name, email and password are required.",
      );

      return;
    }

    try {
      setCreating(true);

      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setForm({
        name: "",
        email: "",
        password: "",
        role: "STAFF",
      });

      setCreateOpen(false);

      window.location.reload();
    } catch (error: any) {
      setFormError(
        error?.response?.data?.message ||
          "Failed to create user.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateUser(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    setFormError("");

    if (
      !form.name.trim() ||
      !form.email.trim()
    ) {
      setFormError(
        "Name and email are required.",
      );

      return;
    }

    try {
      setUpdating(true);

      const updateData: {
        name: string;
        email: string;
        role: UserRole;
        password?: string;
      } = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };

      if (form.password.trim()) {
        updateData.password =
          form.password;
      }

      await updateUser(
        editingUser.id,
        updateData,
      );

      setEditOpen(false);
      setEditingUser(null);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "STAFF",
      });

      window.location.reload();
    } catch (error: any) {
      setFormError(
        error?.response?.data?.message ||
          "Failed to update user.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteUser() {
    if (!deletingUser) {
      return;
    }

    setFormError("");

    try {
      setDeleting(true);

      await deleteUser(
        deletingUser.id,
      );

      setDeleteOpen(false);
      setDeletingUser(null);

      window.location.reload();
    } catch (error: any) {
      setFormError(
        error?.response?.data?.message ||
          "Failed to delete user.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleNameChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      name: event.target.value,
    }));
  }

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      email: event.target.value,
    }));
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      password: event.target.value,
    }));
  }

  function handleRoleChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      role: event.target.value as UserRole,
    }));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Users
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage CMS users and permissions.
          </p>
        </div>

        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Users
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage CMS users and permissions.
          </p>
        </div>

        <Button
          onClick={openCreateDialog}
        >
          <Plus className="size-4" />
          Create User
        </Button>
      </div>

      {/* Search */}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            handleSearch(
              event.target.value,
            )
          }
          placeholder="Search users..."
          className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Users Table */}

      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <p className="font-medium">
            {search
              ? "No users found"
              : "No users yet"}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try a different search."
              : "Create your first CMS user."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">
                    User
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Email
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Role
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
                {paginatedUsers.map(
                  (user: User) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span className="font-medium">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[user.role]}`}
                        >
                          {formatRole(
                            user.role,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatDate(
                          user.createdAt,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit user"
                            onClick={() =>
                              openEditDialog(
                                user,
                              )
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete user"
                            onClick={() =>
                              openDeleteDialog(
                                user,
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

          {/* Pagination */}

          <div className="flex items-center justify-between border-t px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) *
                    ITEMS_PER_PAGE +
                  1}{" "}
              to{" "}
              {Math.min(
                currentPage *
                  ITEMS_PER_PAGE,
                filteredUsers.length,
              )}{" "}
              of{" "}
              {filteredUsers.length}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setPage(
                    (value) =>
                      value - 1,
                  )
                }
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (value) =>
                      value + 1,
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Dialog */}

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create User
            </DialogTitle>

            <DialogDescription>
              Create a new Stream Nepal CMS
              user.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateUser}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name
              </label>

              <Input
                value={form.name}
                onChange={handleNameChange}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Email
              </label>

              <Input
                type="email"
                value={form.email}
                onChange={handleEmailChange}
                placeholder="admin@streamnepal.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Password
              </label>

              <Input
                type="password"
                value={form.password}
                onChange={
                  handlePasswordChange
                }
                placeholder="Password"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Role
              </label>

              <select
                value={form.role}
                onChange={handleRoleChange}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="STAFF">
                  Staff
                </option>

                <option value="MANAGER">
                  Manager
                </option>

                <option value="ADMIN">
                  Admin
                </option>

                <option value="CO_OWNER">
                  Co-Owner
                </option>

                <option value="OWNER">
                  Owner
                </option>
              </select>
            </div>

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
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}

      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit User
            </DialogTitle>

            <DialogDescription>
              Update this CMS user's
              information and permissions.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleUpdateUser}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name
              </label>

              <Input
                value={form.name}
                onChange={handleNameChange}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Email
              </label>

              <Input
                type="email"
                value={form.email}
                onChange={handleEmailChange}
                placeholder="admin@streamnepal.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                New Password
              </label>

              <Input
                type="password"
                value={form.password}
                onChange={
                  handlePasswordChange
                }
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Role
              </label>

              <select
                value={form.role}
                onChange={handleRoleChange}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="STAFF">
                  Staff
                </option>

                <option value="MANAGER">
                  Manager
                </option>

                <option value="ADMIN">
                  Admin
                </option>

                <option value="CO_OWNER">
                  Co-Owner
                </option>

                <option value="OWNER">
                  Owner
                </option>
              </select>
            </div>

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

      {/* Delete User Dialog */}

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete User
            </DialogTitle>

            <DialogDescription>
              This action cannot be undone.
              The user will be permanently
              removed from the CMS.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="font-medium">
                {deletingUser?.name}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {deletingUser?.email}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Role:{" "}
                {deletingUser
                  ? formatRole(
                      deletingUser.role,
                    )
                  : ""}
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
                onClick={handleDeleteUser}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}