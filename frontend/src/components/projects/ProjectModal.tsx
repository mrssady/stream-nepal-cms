"use client";

import { useEffect, useState } from "react";

import {
  type CreateProjectDto,
  type Project,
  type UpdateProjectDto,
} from "@/types/project";

type ProjectModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  initialData?: Project | null;
  onClose: () => void;
  onSubmit: (
    data:
      | CreateProjectDto
      | UpdateProjectDto,
  ) => Promise<void>;
};

const INITIAL_FORM: CreateProjectDto = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  coverImage: "",
  client: "",
  category: "",
  projectDate: "",
  projectUrl: "",
  featured: false,
  isActive: true,
  displayOrder: 0,
};

export default function ProjectModal({
  open,
  mode,
  loading,
  initialData,
  onClose,
  onSubmit,
}: ProjectModalProps) {
  const [form, setForm] =
    useState<CreateProjectDto>(
      INITIAL_FORM,
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (
      mode === "edit" &&
      initialData
    ) {
      setForm({
        title: initialData.title,
        slug: initialData.slug,
        shortDescription:
          initialData.shortDescription ??
          "",
        description:
          initialData.description ??
          "",
        coverImage:
          initialData.coverImage ?? "",
        client:
          initialData.client ?? "",
        category:
          initialData.category ?? "",
        projectDate:
          initialData.projectDate
            ? initialData.projectDate.slice(
                0,
                10,
              )
            : "",
        projectUrl:
          initialData.projectUrl ?? "",
        featured:
          initialData.featured,
        isActive:
          initialData.isActive,
        displayOrder:
          initialData.displayOrder,
      });
    } else {
      setForm({
        ...INITIAL_FORM,
      });
    }
  }, [
    open,
    mode,
    initialData,
  ]);

  if (!open) {
    return null;
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const {
      name,
      value,
      type,
    } = event.target;

    if (type === "checkbox") {
      const checked = (
        event.target as HTMLInputElement
      ).checked;

      setForm((previous) => ({
        ...previous,
        [name]: checked,
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "displayOrder"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {mode === "create"
              ? "Create Project"
              : "Edit Project"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage a Stream Nepal portfolio
            project.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Project Title
              </label>

              <input
                required
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="PMBC PUBG LAN Tournament"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Slug
              </label>

              <input
                required
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="pmbc-pubg-lan-tournament"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Client
              </label>

              <input
                name="client"
                value={form.client ?? ""}
                onChange={handleChange}
                placeholder="Client / Organization"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Category
              </label>

              <input
                name="category"
                value={
                  form.category ?? ""
                }
                onChange={handleChange}
                placeholder="Esports / Broadcast / Event"
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Short Description
            </label>

            <input
              name="shortDescription"
              value={
                form.shortDescription ??
                ""
              }
              onChange={handleChange}
              placeholder="Short portfolio description"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              value={
                form.description ?? ""
              }
              onChange={handleChange}
              placeholder="Full project description"
              className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Cover Image URL
              </label>

              <input
                name="coverImage"
                value={
                  form.coverImage ?? ""
                }
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Project URL
              </label>

              <input
                name="projectUrl"
                value={
                  form.projectUrl ?? ""
                }
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Project Date
              </label>

              <input
                type="date"
                name="projectDate"
                value={
                  form.projectDate ?? ""
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Display Order
              </label>

              <input
                type="number"
                min="0"
                name="displayOrder"
                value={
                  form.displayOrder ?? 0
                }
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={
                  form.isActive ?? true
                }
                onChange={handleChange}
              />

              <span className="text-sm">
                Active
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={
                  form.featured ?? false
                }
                onChange={handleChange}
              />

              <span className="text-sm">
                Featured
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border px-5 py-2 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Project"
                  : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}