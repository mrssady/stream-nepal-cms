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
  Trash2,
} from "lucide-react";

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

import { Input } from "@/components/ui/input";

import ImageUpload from "@/components/media/ImageUpload";

import {
  createService,
  updateService,
  deleteService,
} from "@/services/services";

import { useServices } from "@/hooks/useServices";

import {
  type Service,
  type CreateServiceDto,
  type UpdateServiceDto,
} from "@/types/service";

const ITEMS_PER_PAGE = 10;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function ServicesPage() {
  const { services, loading } = useServices();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [deletingService, setDeletingService] =
    useState<Service | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    image: "",
    icon: "",
    displayOrder: 0,
    isActive: true,
    featured: false,
  });

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formError, setFormError] = useState("");

  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return services;
    }

    return services.filter(
      (service) =>
        service.title
          .toLowerCase()
          .includes(keyword) ||
        service.slug
          .toLowerCase()
          .includes(keyword) ||
        service.shortDescription
          ?.toLowerCase()
          .includes(keyword),
    );
  }, [services, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredServices.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedServices = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredServices.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredServices, currentPage]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function resetForm() {
    setForm({
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      image: "",
      icon: "",
      displayOrder: 0,
      isActive: true,
      featured: false,
    });
  }

  function openCreateDialog() {
    setFormError("");
    resetForm();
    setCreateOpen(true);
  }

  function openEditDialog(service: Service) {
    setFormError("");
    setEditingService(service);

    setForm({
      title: service.title,
      slug: service.slug,
      shortDescription:
        service.shortDescription ?? "",
      description:
        service.description ?? "",
      image: service.image ?? "",
      icon: service.icon ?? "",
      displayOrder:
        service.displayOrder ?? 0,
      isActive:
        service.isActive ?? true,
      featured:
        service.featured ?? false,
    });

    setEditOpen(true);
  }

  function openDeleteDialog(service: Service) {
    setFormError("");
    setDeletingService(service);
    setDeleteOpen(true);
  }

  async function handleCreateService(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError("");

    if (
      !form.title.trim() ||
      !form.slug.trim()
    ) {
      setFormError(
        "Title and slug are required.",
      );
      return;
    }

    try {
      setCreating(true);

      const data: CreateServiceDto = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        shortDescription:
          form.shortDescription.trim() ||
          undefined,
        description:
          form.description.trim() ||
          undefined,
        image:
          form.image.trim() || undefined,
        icon:
          form.icon.trim() || undefined,
        displayOrder:
          form.displayOrder,
        isActive: form.isActive,
        featured: form.featured,
      };

      await createService(data);

      setCreateOpen(false);
      resetForm();

      window.location.reload();
    } catch (error) {
      setFormError(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
          "Failed to create service.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateService(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingService) {
      return;
    }

    setFormError("");

    if (
      !form.title.trim() ||
      !form.slug.trim()
    ) {
      setFormError(
        "Title and slug are required.",
      );
      return;
    }

    try {
      setUpdating(true);

      const data: UpdateServiceDto = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        shortDescription:
          form.shortDescription.trim() ||
          undefined,
        description:
          form.description.trim() ||
          undefined,
        image:
          form.image.trim() || undefined,
        icon:
          form.icon.trim() || undefined,
        displayOrder:
          form.displayOrder,
        isActive: form.isActive,
        featured: form.featured,
      };

      await updateService(
        editingService.id,
        data,
      );

      setEditOpen(false);
      setEditingService(null);
      resetForm();

      window.location.reload();
    } catch (error) {
      setFormError(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
          "Failed to update service.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteService() {
    if (!deletingService) {
      return;
    }

    setFormError("");

    try {
      setDeleting(true);

      await deleteService(
        deletingService.id,
      );

      setDeleteOpen(false);
      setDeletingService(null);

      window.location.reload();
    } catch (error) {
      setFormError(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
          "Failed to delete service.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleTextChange(
    field:
      | "title"
      | "slug"
      | "shortDescription"
      | "image"
      | "icon",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  }

  function handleDescriptionChange(
    event: ChangeEvent<HTMLTextAreaElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      description: event.target.value,
    }));
  }

  function handleDisplayOrderChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      displayOrder:
        Number(event.target.value) || 0,
    }));
  }

  function handleActiveChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      isActive: event.target.checked,
    }));
  }

  function handleFeaturedChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setForm((previous) => ({
      ...previous,
      featured: event.target.checked,
    }));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Services
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage Stream Nepal services.
          </p>
        </div>

        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Loading services...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Services
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage Stream Nepal services.
          </p>
        </div>

        <Button
          onClick={openCreateDialog}
        >
          <Plus className="size-4" />
          Create Service
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Search services..."
      />

      {filteredServices.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <p className="font-medium">
            {search
              ? "No services found"
              : "No services yet"}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try a different search."
              : "Create your first service."}
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
                    Service
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Slug
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Featured
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
                {paginatedServices.map(
                  (service) => (
                    <tr
                      key={service.id}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                            {service.title
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium">
                              {service.title}
                            </p>

                            {service.shortDescription && (
                              <p className="max-w-md truncate text-xs text-muted-foreground">
                                {
                                  service.shortDescription
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {service.slug}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            service.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400"
                          }`}
                        >
                          {service.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            service.featured
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400"
                          }`}
                        >
                          {service.featured
                            ? "Featured"
                            : "Normal"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatDate(
                          service.createdAt,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit service"
                            onClick={() =>
                              openEditDialog(
                                service,
                              )
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete service"
                            onClick={() =>
                              openDeleteDialog(
                                service,
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
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredServices.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
        </>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Create Service
            </DialogTitle>

            <DialogDescription>
              Add a new service to Stream Nepal.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateService}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Title
              </label>

              <Input
                value={form.title}
                onChange={(event) =>
                  handleTextChange(
                    "title",
                    event,
                  )
                }
                placeholder="Live Broadcasting"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Slug
              </label>

              <Input
                value={form.slug}
                onChange={(event) =>
                  handleTextChange(
                    "slug",
                    event,
                  )
                }
                placeholder="live-broadcasting"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Short Description
              </label>

              <Input
                value={form.shortDescription}
                onChange={(event) =>
                  handleTextChange(
                    "shortDescription",
                    event,
                  )
                }
                placeholder="Professional live event broadcasting."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={
                  handleDescriptionChange
                }
                placeholder="Describe the service..."
                className="min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Image
                </label>

                <ImageUpload
                  value={form.image}
                  folder="services"
                  onChange={(result) =>
                    setForm((previous) => ({
                      ...previous,
                      image:
                        result?.url ?? "",
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Icon
                </label>

                <Input
                  value={form.icon}
                  onChange={(event) =>
                    handleTextChange(
                      "icon",
                      event,
                    )
                  }
                  placeholder="Icon name"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Display Order
              </label>

              <Input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={
                  handleDisplayOrderChange
                }
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={
                    handleActiveChange
                  }
                  className="size-4 rounded"
                />

                Active
              </label>

              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={
                    handleFeaturedChange
                  }
                  className="size-4 rounded"
                />

                Featured
              </label>
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
                  : "Create Service"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Service
            </DialogTitle>

            <DialogDescription>
              Update this Stream Nepal service.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleUpdateService}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Title
              </label>

              <Input
                value={form.title}
                onChange={(event) =>
                  handleTextChange(
                    "title",
                    event,
                  )
                }
                placeholder="Service title"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Slug
              </label>

              <Input
                value={form.slug}
                onChange={(event) =>
                  handleTextChange(
                    "slug",
                    event,
                  )
                }
                placeholder="service-slug"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Short Description
              </label>

              <Input
                value={form.shortDescription}
                onChange={(event) =>
                  handleTextChange(
                    "shortDescription",
                    event,
                  )
                }
                placeholder="Short description"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={
                  handleDescriptionChange
                }
                placeholder="Service description..."
                className="min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Image
                </label>

                <ImageUpload
                  value={form.image}
                  folder="services"
                  onChange={(result) =>
                    setForm((previous) => ({
                      ...previous,
                      image:
                        result?.url ?? "",
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Icon
                </label>

                <Input
                  value={form.icon}
                  onChange={(event) =>
                    handleTextChange(
                      "icon",
                      event,
                    )
                  }
                  placeholder="Icon name"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Display Order
              </label>

              <Input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={
                  handleDisplayOrderChange
                }
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={
                    handleActiveChange
                  }
                  className="size-4 rounded"
                />

                Active
              </label>

              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={
                    handleFeaturedChange
                  }
                  className="size-4 rounded"
                />

                Featured
              </label>
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

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Service
            </DialogTitle>

            <DialogDescription>
              This action cannot be undone.
              The service will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="font-medium">
                {deletingService?.title}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {deletingService?.slug}
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
                onClick={
                  handleDeleteService
                }
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Service"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}