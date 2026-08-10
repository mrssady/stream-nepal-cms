"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createProject,
  CreateProjectDto,
  deleteProject,
  getProjects,
  Project,
  updateProject,
  UpdateProjectDto,
} from "@/services/project";

export function useProjects() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchProjects =
    useCallback(async () => {
      try {
        setLoading(true);

        const data = await getProjects();

        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  async function addProject(
    data: CreateProjectDto,
  ) {
    await createProject(data);
    await fetchProjects();
  }

  async function editProject(
    id: string,
    data: UpdateProjectDto,
  ) {
    await updateProject(id, data);
    await fetchProjects();
  }

  async function removeProject(
    id: string,
  ) {
    await deleteProject(id);
    await fetchProjects();
  }

  return {
    projects,
    loading,
    fetchProjects,
    addProject,
    editProject,
    removeProject,
  };
}