"use client";

import { useState } from "react";

import {
  CreateServiceDto,
  Service,
  UpdateServiceDto,
} from "@/services/service";

import ImageUpload from "@/components/media/ImageUpload";

type ServiceModalProps = {
  open: boolean;
  mode: "create" | "edit";
  loading: boolean;
  initialData?: Service | null;
  onClose: () => void;
  onSubmit: (
    data: CreateServiceDto | UpdateServiceDto,
  ) => Promise<void>;
};

const INITIAL_FORM: CreateServiceDto = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  image: "",
  icon: "",
  displayOrder: 0,
  isActive: true,
  featured: false,
};

export default function ServiceModal({
  open,
  mode,
  loading,
  initialData,
  onClose,
  onSubmit,
}: ServiceModalProps) {
  const [form, setForm] =
    useState<CreateServiceDto>(
      () =>
        mode === "edit" &&
        initialData
          ? {
              title:
                initialData.title,
              slug:
                initialData.slug,
              shortDescription:
                initialData.shortDescription ??
                "",
              description:
                initialData.description ??
                "",
              image:
                initialData.image ??
                "",
              icon:
                initialData.icon ??
                "",
              displayOrder:
                initialData.displayOrder,
              isActive:
                initialData.isActive,
              featured:
                initialData.featured,
            }
          : INITIAL_FORM,
    );

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (
        e.target as HTMLInputElement
      ).checked;

      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "displayOrder"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    await onSubmit(form);

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            {mode === "create"
              ? "Create Service"
              : "Edit Service"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage a service displayed on the
            Stream Nepal website.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Service Title
            </label>

            <input
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Esports Tournament Management"
              className="w-full rounded-xl border px-3 py-2"
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
              placeholder="esports-tournament-management"
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Short Description
            </label>

            <input
              name="shortDescription"
              value={
                form.shortDescription ?? ""
              }
              onChange={handleChange}
              placeholder="Professional esports tournament solutions."
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              value={form.description ?? ""}
              onChange={handleChange}
              placeholder="Describe the service..."
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Image
            </label>

            <ImageUpload
              value={form.image ?? ""}
              folder="services"
              onChange={(result) =>
                setForm((prev) => ({
                  ...prev,
                  image:
                    result?.url ?? "",
                }))
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Icon
            </label>

            <input
              name="icon"
              value={form.icon ?? ""}
              onChange={handleChange}
              placeholder="Trophy"
              className="w-full rounded-xl border px-3 py-2"
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
              className="w-full rounded-xl border px-3 py-2"
            />
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
              className="rounded-xl border px-5 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Service"
                  : "Update Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}