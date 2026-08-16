"use client";

import { useState } from "react";

import {
  CreateUserDto,
  UpdateUserDto,
  User,
} from "@/types/user";

type Mode = "create" | "edit";

type CreateUserModalProps = {
  open: boolean;
  mode: Mode;
  loading: boolean;
  initialData?: User | null;
  onClose: () => void;
  onSubmit: (
    data: CreateUserDto | UpdateUserDto,
  ) => Promise<void>;
};

const INITIAL_FORM: CreateUserDto = {
  name: "",
  email: "",
  password: "",
  role: "ADMIN",
};

function buildForm(
  mode: Mode,
  initialData?: User | null,
): CreateUserDto {
  if (mode === "edit" && initialData) {
    return {
      name: initialData.name,
      email: initialData.email,
      password: "",
      role: initialData.role,
    };
  }

  return { ...INITIAL_FORM };
}

export default function CreateUserModal({
  open,
  mode,
  loading,
  initialData,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  const [form, setForm] =
    useState<CreateUserDto>(() =>
      buildForm(mode, initialData),
    );

  const [prevOpen, setPrevOpen] =
    useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      setForm(buildForm(mode, initialData));
    }
  }

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (mode === "edit") {
      const payload: UpdateUserDto = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await onSubmit(payload);
    } else {
      await onSubmit(form);
    }

    setForm(INITIAL_FORM);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === "create"
              ? "Create User"
              : "Edit User"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Name
            </label>

            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>

            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required={mode === "create"}
              placeholder={
                mode === "edit"
                  ? "Leave blank to keep current password"
                  : ""
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="OWNER">OWNER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create User"
                : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}