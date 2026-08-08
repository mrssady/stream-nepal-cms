"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useServices } from "@/hooks/useServices";
import {
  CreateServiceDto,
  Service,
  UpdateServiceDto,
} from "@/services/service";

import ServiceModal from "@/components/services/ServiceModal";

export default function ServicesPage() {
  const {
    services,
    loading,
    addService,
    editService,
    removeService,
  } = useServices();

  const [search, setSearch] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState<"create" | "edit">("create");

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [saving, setSaving] =
    useState(false);

  const filteredServices = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) return services;

    return services.filter(
      (service) =>
        service.title
          .toLowerCase()
          .includes(query) ||
        service.slug
          .toLowerCase()
          .includes(query) ||
        (
          service.shortDescription ?? ""
        )
          .toLowerCase()
          .includes(query),
    );
  }, [services, search]);

  function openCreate() {
    setSelectedService(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setSelectedService(service);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSubmit(
    data:
      | CreateServiceDto
      | UpdateServiceDto,
  ) {
    try {
      setSaving(true);

      if (
        modalMode === "create"
      ) {
        await addService(
          data as CreateServiceDto,
        );
      } else if (selectedService) {
        await editService(
          selectedService.id,
          data as UpdateServiceDto,
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        "Unable to save the service.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    service: Service,
  ) {
    const confirmed = window.confirm(
      `Delete "${service.title}"?`,
    );

    if (!confirmed) return;

    try {
      await removeService(service.id);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete the service.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Services
            </h1>

            <p className="mt-1 text-slate-500">
              Manage services displayed on the
              Stream Nepal website.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Service
          </button>
        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search services..."
            className="w-full max-w-md rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            Loading services...
          </div>
        ) : filteredServices.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-16 text-center">
            <h2 className="text-xl font-semibold">
              No Services Found
            </h2>

            <p className="mt-2 text-slate-500">
              Create your first Stream Nepal
              service.
            </p>

            <button
              onClick={openCreate}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white"
            >
              Create Service
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map(
              (service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      {service.icon || "SN"}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          openEdit(service)
                        }
                        className="rounded-lg border p-2 hover:bg-slate-50"
                        title="Edit"
                      >
                        <Pencil
                          size={16}
                        />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            service,
                          )
                        }
                        className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold">
                    {service.title}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    /{service.slug}
                  </p>

                  <p className="mt-4 line-clamp-3 text-sm text-slate-600">
                    {service.shortDescription ||
                      service.description ||
                      "No description."}
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        service.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {service.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {service.featured && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <ServiceModal
        open={modalOpen}
        mode={modalMode}
        loading={saving}
        initialData={selectedService}
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={handleSubmit}
      />
    </main>
  );
}