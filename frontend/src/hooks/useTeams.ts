"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  Team,
  CreateTeamDto,
  UpdateTeamDto,
} from "@/services/team";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getTeams();

      setTeams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  async function addTeam(
    data: CreateTeamDto,
  ) {
    await createTeam(data);
    await fetchTeams();
  }

  async function editTeam(
    id: string,
    data: UpdateTeamDto,
  ) {
    await updateTeam(id, data);
    await fetchTeams();
  }

  async function removeTeam(
    id: string,
  ) {
    await deleteTeam(id);
    await fetchTeams();
  }

  return {
    teams,
    loading,
    fetchTeams,
    addTeam,
    editTeam,
    removeTeam,
  };
}