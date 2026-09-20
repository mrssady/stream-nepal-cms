"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

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

import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "@/services/organizations";

import { useOrganizations } from "@/hooks/useOrganizations";

import {
  type Organization,
  type CreateOrganizationDto,
  type UpdateOrganizationDto,
} from "@/types/organization";

import {
  getActiveOrganizationId,
  saveActiveOrganizationId,
} from "@/lib/org";

const ITEMS_PER_PAGE = 10;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OrganizationsPage() {
  const { organizations, loading } = useOrganizations();

  const activeOrganizationId = getActiveOrganizationId();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);

  const [deletingOrganization, setDeletingOrganization] =
    useState<Organization | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    logo: "",
  });

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formError, setFormError] = useState("");

  const filteredOrganizations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return organizations;
    }

    return organizations.filter(
      (organization) =>
        organization.name
          .toLowerCase()
          .includes(keyword) ||
        organization.slug
          .toLowerCase()
          .includes(keyword),
    );
  }, [organizations, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrganizations.length / ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedOrganizations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredOrganizations.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredOrganizations, currentPage]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function resetForm() {
    setForm({
      name: "",
      slug: "",
      logo: "",
    });
  }

  function openCreateDialog() {
    setFormError("");
    resetForm();
    setCreateOpen(true);
  }

  function openEditDialog(organization: Organization) {
    setFormError("");
    setEditingOrganization(organization);

    setForm({
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo ?? "",
    });

    setEditOpen(true);
  }

  function openDeleteDialog(organization: Organization) {
    setFormError("");
    setDeletingOrganization(organization);
    setDeleteOpen(true);
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.value;

    setForm((previous) => ({
      ...previous,
      name,
      slug: slugFromName(name),
    }));
  }

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((previous) => ({
      ...previous,
      slug: event.target.value,
    }));
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((previous) => ({
      ...previous,
      logo: event.target.value,
    }));
  }

  async function handleCreateOrganization(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.slug.trim()) {
      setFormError("Name and slug are required.");
      return;
    }

    try {
      setCreating(true);

      const data: CreateOrganizationDto = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        logo: form.logo.trim() || undefined,
      };

      await createOrganization(data);

      setCreateOpen(false);
      resetForm();

      window.location.reload();
    } catch (error) {
      setFormError(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
          "Failed to create organization.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateOrganization(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingOrganization) {
      return;
    }

    setFormError("");

    if (!form.name.trim() || !form.slug.trim()) {
      setFormError("Name and slug are required.");
      return;
    }

    try {
      setUpdating(true);

      const data: UpdateOrganizationDto = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        logo: form.logo.trim() || undefined,
      };

      const updated = await updateOrganization(
        editingOrganization.id,
        data,
      );

      if (updated.id === activeOrganizationId) {
        saveActiveOrganizationId(updated.id);
      }

      setEditOpen(false);
      setEditingOrganization(null);
      resetForm();

      window.location.reload();
    } catch (error) {
      setFormError(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
          "Failed to update organization.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteOrganization() {
    if (!deletingOrganization) {
      return;
    }

    setFormError("");

    try {
      setDeleting(true);

      await deleteOrganization(deletingOrganization.id);

      if (deletingOrganization.id === activeOrganizationId) {
        saveActiveOrganizationId(activeOrganizationId);

        const fallback = organizations.find(
          (organization) =>
            organization.id !== deletingOrganization.id,
        );

        if (fallback) {
          saveActiveOrganizationId(fallback.id);
        }
      }

      setDeleteOpen(false);
      setDeletingOrganization(null);

      window.location.reload();
    } catch (error) {
      setFormError(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
          "Failed to delete organization.",
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
            Organizations
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage organizations and their workspaces.
          </p>
        </div>

        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Loading organizations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Organizations
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage organizations and their workspaces.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          Create Organization
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Search organizations..."
      />

      {filteredOrganizations.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <p className="font-medium">
            {search ? "No organizations found" : "No organizations yet"}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try a different search."
              : "Create your first organization."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">
                      Organization
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Slug
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Users
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
                  {paginatedOrganizations.map((organization) => (
                    <tr
                      key={organization.id}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                            {organization.logo
                              ? (
                                  <img
                                    src={organization.logo}
                                    alt={organization.name}
                                    className="size-10 rounded-lg object-cover"
                                  />
                                )
                              : (
                                  organization.name
                                    .charAt(0)
                                    .toUpperCase()
                                )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium">
                              {organization.name}
                            </p>

                            {organization.id ===
                              activeOrganizationId && (
                              <span className="mt-0.5 inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {organization.slug}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {organization._count?.users ?? 0}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatDate(organization.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit organization"
                            onClick={() =>
                              openEditDialog(organization)
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete organization"
                            onClick={() =>
                              openDeleteDialog(organization)
                            }
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrganizations.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
          />
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>

            <DialogDescription>
              Add a new organization workspace.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateOrganization}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name
              </label>

              <Input
                value={form.name}
                onChange={handleNameChange}
                placeholder="Acme Productions"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Slug
              </label>

              <Input
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="acme-productions"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Logo URL
              </label>

              <Input
                value={form.logo}
                onChange={handleLogoChange}
                placeholder="https://example.com/logo.png"
              />
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
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>

            <DialogDescription>
              Update this organization.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleUpdateOrganization}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name
              </label>

              <Input
                value={form.name}
                onChange={handleNameChange}
                placeholder="Organization name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Slug
              </label>

              <Input
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="organization-slug"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Logo URL
              </label>

              <Input
                value={form.logo}
                onChange={handleLogoChange}
                placeholder="https://example.com/logo.png"
              />
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
                onClick={() => setEditOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>

            <DialogDescription>
              This action cannot be undone. The organization will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="font-medium">
                {deletingOrganization?.name}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {deletingOrganization?.slug}
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
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteOrganization}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Organization"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}