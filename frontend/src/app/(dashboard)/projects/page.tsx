"use client";

import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { useProjects } from "@/hooks/useProjects";

import {
  CreateProjectDto,
  Project,
  UpdateProjectDto,
} from "@/services/project";

import ProjectModal from "@/components/projects/ProjectModal";

export default function ProjectsPage() {
  const {
    projects,
    loading,
    addProject,
    editProject,
    removeProject,
  } = useProjects();

  const [search, setSearch] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState<"create" | "edit">("create");

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [saving, setSaving] =
    useState(false);

  const filteredProjects = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.title
          .toLowerCase()
          .includes(query) ||
        project.slug
          .toLowerCase()
          .includes(query) ||
        (
          project.client ?? ""
        )
          .toLowerCase()
          .includes(query) ||
        (
          project.category ?? ""
        )
          .toLowerCase()
          .includes(query),
    );
  }, [projects, search]);

  function openCreate() {
    setSelectedProject(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEdit(
    project: Project,
  ) {
    setSelectedProject(project);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSubmit(
    data:
      | CreateProjectDto
      | UpdateProjectDto,
  ) {
    try {
      setSaving(true);

      if (
        modalMode === "create"
      ) {
        await addProject(
          data as CreateProjectDto,
        );
      } else if (selectedProject) {
        await editProject(
          selectedProject.id,
          data as UpdateProjectDto,
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save the project.",
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
        `Delete "${project.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await removeProject(
        project.id,
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete the project.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Projects
            </h1>

            <p className="mt-1 text-slate-500">
              Manage Stream Nepal portfolio
              projects.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search projects..."
            className="w-full max-w-md rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            Loading projects...
          </div>
        ) : filteredProjects.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-16 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              No Projects Found
            </h2>

            <p className="mt-2 text-slate-500">
              Add your first Stream Nepal
              portfolio project.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(
              (project) => (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                >
                  {project.coverImage ? (
                    <img
                      src={
                        project.coverImage
                      }
                      alt={project.title}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-slate-100 text-3xl font-bold text-slate-300">
                      SN
                    </div>
                  )}

                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {project.title}
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                          /{project.slug}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              project,
                            )
                          }
                          className="rounded-lg border p-2 hover:bg-slate-50"
                          title="Edit"
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              project,
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

                    {project.client && (
                      <p className="text-sm font-medium text-slate-600">
                        {project.client}
                      </p>
                    )}

                    {project.category && (
                      <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {project.category}
                      </span>
                    )}

                    <p className="mt-4 line-clamp-3 text-sm text-slate-600">
                      {project.shortDescription ||
                        project.description ||
                        "No description."}
                    </p>

                    <div className="mt-5 flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          project.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {project.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                      {project.featured && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <ProjectModal
        open={modalOpen}
        mode={modalMode}
        loading={saving}
        initialData={
          selectedProject
        }
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={handleSubmit}
      />
    </main>
  );
}