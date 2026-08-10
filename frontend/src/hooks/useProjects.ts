"use client";

import { useEffect, useState } from "react";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/services/projects";

import {
  type CreateProjectDto,
  type Project,
  type UpdateProjectDto,
} from "@/types/project";

export function useProjects() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getProjects();

      setProjects(data);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function addProject(
    data: CreateProjectDto,
  ) {
    const project =
      await createProject(data);

    setProjects((current) => [
      project,
      ...current,
    ]);

    return project;
  }

  async function editProject(
    id: string,
    data: UpdateProjectDto,
  ) {
    const project =
      await updateProject(id, data);

    setProjects((current) =>
      current.map((item) =>
        item.id === id
          ? project
          : item,
      ),
    );

    return project;
  }

  async function removeProject(
    id: string,
  ) {
    await deleteProject(id);

    setProjects((current) =>
      current.filter(
        (item) => item.id !== id,
      ),
    );
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refresh: loadProjects,
    addProject,
    editProject,
    removeProject,
  };
}