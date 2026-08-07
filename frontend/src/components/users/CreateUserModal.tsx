"use client";

import { useState } from "react";
import { CreateUserDto } from "@/types/user";

type CreateUserModalProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto) => Promise<void>;
};

const INITIAL_FORM: CreateUserDto = {
  name: "",
  email: "",
  password: "",
  role: "ADMIN",
};

export default function CreateUserModal({
  open,
  loading,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  const [form, setForm] = useState<CreateUserDto>(INITIAL_FORM);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    await onSubmit(form);

    setForm(INITIAL_FORM);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            Create User
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              required
              minLength={6}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-600"
            >
              <option value="ADMIN">
                ADMIN
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}