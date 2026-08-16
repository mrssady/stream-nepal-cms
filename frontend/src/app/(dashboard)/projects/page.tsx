"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/services/projects";

import type {
  CreateProjectDto,
  Project,
} from "@/types/project";

import ImageUpload from "@/components/media/ImageUpload";

import Pagination from "@/components/common/Pagination";

import { resolveMediaUrl } from "@/lib/media";

type FilterType =
  | "all"
  | "featured"
  | "active"
  | "inactive";

const ITEMS_PER_PAGE = 9;

const emptyForm: CreateProjectDto = {
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

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(new Date(value));
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProjectsPage() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [form, setForm] =
    useState<CreateProjectDto>(
      emptyForm,
    );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getProjects();

      setProjects(data);
    } catch {
      setError(
        "Unable to load projects. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProjects()
      .then((data) => {
        setProjects(data);
      })
      .catch(() => {
        setError(
          "Unable to load projects. Please try again.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredProjects =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return projects.filter(
        (project) => {
          const matchesSearch =
            !query ||
            project.title
              .toLowerCase()
              .includes(query) ||
            project.slug
              .toLowerCase()
              .includes(query) ||
            project.client
              ?.toLowerCase()
              .includes(query) ||
            project.category
              ?.toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "all" ||
            (filter === "featured" &&
              project.featured) ||
            (filter === "active" &&
              project.isActive) ||
            (filter === "inactive" &&
              !project.isActive);

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [projects, search, filter]);

  const stats = {
    total: projects.length,
    active: projects.filter(
      (project) =>
        project.isActive,
    ).length,
    featured: projects.filter(
      (project) =>
        project.featured,
    ).length,
    inactive: projects.filter(
      (project) =>
        !project.isActive,
    ).length,
  };

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProjects.length /
        ITEMS_PER_PAGE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedProjects = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredProjects.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredProjects, currentPage]);

  function resetForm() {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
  }

  function openCreateModal() {
    resetForm();
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    resetForm();
  }

  function updateField(
    field: keyof CreateProjectDto,
    value:
      | string
      | boolean
      | number
      | undefined,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      title: value,
      ...(editingId
        ? {}
        : {
            slug: createSlug(value),
          }),
    }));
  }

  function startEdit(
    project: Project,
  ) {
    setEditingId(project.id);

    setForm({
      title: project.title,
      slug: project.slug,
      shortDescription:
        project.shortDescription ??
        "",
      description:
        project.description ??
        "",
      coverImage:
        project.coverImage ?? "",
      client:
        project.client ?? "",
      category:
        project.category ?? "",
      projectDate:
        project.projectDate
          ? project.projectDate.slice(
              0,
              10,
            )
          : "",
      projectUrl:
        project.projectUrl ?? "",
      featured:
        project.featured,
      isActive:
        project.isActive,
      displayOrder:
        project.displayOrder,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError(
        "Project title is required.",
      );
      return;
    }

    if (!form.slug?.trim()) {
      setError(
        "Project slug is required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: CreateProjectDto = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim(),
        shortDescription:
          form.shortDescription?.trim() ||
          undefined,
        description:
          form.description?.trim() ||
          undefined,
        coverImage:
          form.coverImage?.trim() ||
          undefined,
        client:
          form.client?.trim() ||
          undefined,
        category:
          form.category?.trim() ||
          undefined,
        projectDate:
          form.projectDate ||
          undefined,
        projectUrl:
          form.projectUrl?.trim() ||
          undefined,
      };

      if (editingId) {
        await updateProject(
          editingId,
          payload,
        );

        setSuccess(
          "Project updated successfully.",
        );
      } else {
        await createProject(
          payload,
        );

        setSuccess(
          "Project created successfully.",
        );
      }

      setModalOpen(false);
      resetForm();

      await loadProjects();
    } catch {
      setError(
        editingId
          ? "Failed to update project."
          : "Failed to create project.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    project: Project,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${project.title}"?\n\nThis action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(project.id);
      setError("");
      setSuccess("");

      await deleteProject(
        project.id,
      );

      setSuccess(
        "Project deleted successfully.",
      );

      await loadProjects();
    } catch {
      setError(
        "Failed to delete project.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(
    project: Project,
  ) {
    try {
      setError("");

      await updateProject(
        project.id,
        {
          isActive:
            !project.isActive,
        },
      );

      await loadProjects();
    } catch {
      setError(
        "Failed to update project status.",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* HEADER */}

        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-500" />

              Portfolio Management
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white lg:text-4xl">
              Projects
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage the projects, productions
              and work displayed on the Stream
              Nepal portfolio.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            <span className="text-lg leading-none">
              +
            </span>

            New Project
          </button>
        </section>

        {/* ALERTS */}

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span>{success}</span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="font-bold text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              ×
            </button>
          </div>
        )}

        {/* STATS */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Projects"
            value={stats.total}
            description="All portfolio projects"
            icon="▦"
          />

          <StatCard
            label="Active"
            value={stats.active}
            description="Visible publicly"
            icon="●"
          />

          <StatCard
            label="Featured"
            value={stats.featured}
            description="Highlighted projects"
            icon="★"
          />

          <StatCard
            label="Inactive"
            value={stats.inactive}
            description="Hidden from public"
            icon="○"
          />
        </section>

        {/* TOOLBAR */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full min-w-0 xl:max-w-md">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );
                  setPage(1);
                }}
                placeholder="Search projects, clients, categories..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 dark:border-slate-700 dark:bg-muted dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-2 dark:focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={
                  filter === "all"
                }
                onClick={() => {
                  setFilter("all");
                  setPage(1);
                }}
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  filter === "featured"
                }
                onClick={() => {
                  setFilter(
                    "featured",
                  );
                  setPage(1);
                }}
              >
                Featured
              </FilterButton>

              <FilterButton
                active={
                  filter === "active"
                }
                onClick={() => {
                  setFilter("active");
                  setPage(1);
                }}
              >
                Active
              </FilterButton>

              <FilterButton
                active={
                  filter === "inactive"
                }
                onClick={() => {
                  setFilter(
                    "inactive",
                  );
                  setPage(1);
                }}
              >
                Inactive
              </FilterButton>
            </div>
          </div>
        </section>

        {/* PROJECT GRID */}

        {loading ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-border dark:bg-card"
              >
                <div className="aspect-video animate-pulse bg-slate-200 dark:bg-muted" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-muted" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-muted" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-muted" />
                </div>
              </div>
            ))}
          </section>
        ) : filteredProjects.length ===
          0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-border dark:bg-card">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              ▦
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
              {projects.length === 0
                ? "No projects yet"
                : "No matching projects"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {projects.length === 0
                ? "Create your first project to start building the Stream Nepal portfolio."
                : "Try changing your search or filter to find the project you're looking for."}
            </p>

            {projects.length ===
              0 && (
              <button
                type="button"
                onClick={
                  openCreateModal
                }
                className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
              >
                Create First Project
              </button>
            )}
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedProjects.map(
              (project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  deleting={
                    deletingId ===
                    project.id
                  }
                  onEdit={() =>
                    startEdit(project)
                  }
                  onDelete={() =>
                    handleDelete(
                      project,
                    )
                  }
                  onToggleActive={() =>
                    toggleActive(
                      project,
                    )
                  }
                />
              ),
            )}
          </section>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProjects.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />

      {/* MODAL */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm dark:bg-black/70">
          <div
            className="absolute inset-0"
            onClick={closeModal}
          />

          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:border dark:border-border dark:bg-card">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-border">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  Portfolio
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                  {editingId
                    ? "Edit Project"
                    : "Create New Project"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex size-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-muted dark:hover:text-slate-300"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >
              <div className="space-y-6 p-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Project Title"
                    required
                  >
                    <input
                      value={form.title}
                      onChange={(event) =>
                        handleTitleChange(
                          event.target
                            .value,
                        )
                      }
                      placeholder="PMBC 3.0"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField
                    label="Slug"
                    required
                    hint="Used in the public project URL"
                  >
                    <input
                      value={
                        form.slug
                      }
                      onChange={(event) =>
                        updateField(
                          "slug",
                          event.target
                            .value,
                        )
                      }
                      placeholder="pmbc-3"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Client">
                    <input
                      value={
                        form.client ??
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "client",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Himalaya Darshan College"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Category">
                    <input
                      value={
                        form.category ??
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "category",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Esports"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Project Date">
                    <input
                      type="date"
                      value={
                        form.projectDate ??
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "projectDate",
                          event.target
                            .value,
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Display Order">
                    <input
                      type="number"
                      min="0"
                      value={
                        form.displayOrder ??
                        0
                      }
                      onChange={(event) =>
                        updateField(
                          "displayOrder",
                          Number(
                            event.target
                              .value,
                          ),
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <FormField label="Short Description">
                  <textarea
                    rows={3}
                    value={
                      form.shortDescription ??
                      ""
                    }
                    onChange={(event) =>
                      updateField(
                        "shortDescription",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Brief project overview..."
                    className={`${inputClass} resize-none`}
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    rows={6}
                    value={
                      form.description ??
                      ""
                    }
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Detailed project description..."
                    className={`${inputClass} resize-y`}
                  />
                </FormField>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Cover Image"
                    hint="Upload or paste a link"
                  >
                    <ImageUpload
                      value={
                        form.coverImage ??
                        ""
                      }
                      folder="projects"
                      onChange={(result) =>
                        updateField(
                          "coverImage",
                          result?.url ?? "",
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Project URL">
                    <input
                      value={
                        form.projectUrl ??
                        ""
                      }
                      onChange={(event) =>
                        updateField(
                          "projectUrl",
                          event.target
                            .value,
                        )
                      }
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </FormField>
                </div>

                {/* STATUS */}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 dark:border-slate-700 dark:bg-muted/60 dark:hover:border-blue-400/40 dark:hover:bg-blue-400/10">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Featured Project
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Highlight this project
                        on the public portfolio.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        form.featured ??
                        false
                      }
                      onChange={(event) =>
                        updateField(
                          "featured",
                          event.target
                            .checked,
                        )
                      }
                      className="size-5 accent-blue-600"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30 dark:border-slate-700 dark:bg-muted/60 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Active Project
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Make this project visible
                        publicly.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        form.isActive ??
                        true
                      }
                      onChange={(event) =>
                        updateField(
                          "isActive",
                          event.target
                            .checked,
                        )
                      }
                      className="size-5 accent-emerald-600"
                    />
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end dark:border-border dark:bg-muted">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-border dark:bg-card dark:text-slate-300 dark:hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- */
/* STAT CARD */
/* ---------------------------------- */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-border dark:bg-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* FILTER BUTTON */
/* ---------------------------------- */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-sm dark:bg-primary dark:text-primary-foreground"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-muted dark:text-slate-400 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- */
/* FORM FIELD */
/* ---------------------------------- */

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}

          {required && (
            <span className="ml-1 text-red-500 dark:text-red-400">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="text-xs text-slate-400">
            {hint}
          </span>
        )}
      </div>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* PROJECT CARD */
/* ---------------------------------- */

function ProjectCard({
  project,
  deleting,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  project: Project;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-border dark:bg-card dark:hover:shadow-black/40">
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-muted">
        {project.coverImage ? (
          <img
            src={resolveMediaUrl(project.coverImage)}
            alt={project.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              Stream Nepal
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {project.featured && (
            <span className="rounded-full bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              ★ Featured
            </span>
          )}

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur ${
              project.isActive
                ? "bg-emerald-500/90 text-white"
                : "bg-slate-950/80 text-slate-200"
            }`}
          >
            {project.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </div>

        <div className="absolute bottom-4 right-4">
          <span className="rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur">
            #{project.displayOrder}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2">
          {project.category && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              {project.category}
            </span>
          )}
        </div>

        <h2 className="mt-3 line-clamp-1 text-xl font-bold text-slate-950 dark:text-white">
          {project.title}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {project.shortDescription ||
            "No project description provided."}
        </p>

        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-border dark:text-slate-400">
          {project.client && (
            <p className="flex justify-between gap-4">
              <span>Client</span>

              <span className="max-w-[65%] truncate font-medium text-slate-700 dark:text-slate-300">
                {project.client}
              </span>
            </p>
          )}

          <p className="flex justify-between gap-4">
            <span>Date</span>

            <span className="font-medium text-slate-700 dark:text-slate-300">
              {formatDate(
                project.projectDate,
              )}
            </span>
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onToggleActive}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              project.isActive
                ? "border border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10"
                : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            }`}
          >
            {project.isActive
              ? "Hide"
              : "Publish"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            {deleting
              ? "..."
              : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 dark:border-border dark:bg-muted dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-2 dark:focus:ring-blue-500/10";