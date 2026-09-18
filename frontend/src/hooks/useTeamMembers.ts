"use client";

import { useEffect, useState } from "react";

import {
  createTeamMember,
  deleteTeamMember,
  getTeamMembers,
  updateTeamMember,
} from "@/services/team-members";

import type {
  CreateTeamMemberDto,
  TeamMember,
  UpdateTeamMemberDto,
} from "@/types/team-member";

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamMembers()
      .then((data) => setMembers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function addMember(data: CreateTeamMemberDto) {
    const created = await createTeamMember(data);

    setMembers((current) => [created, ...current]);
  }

  async function editMember(id: string, data: UpdateTeamMemberDto) {
    const updated = await updateTeamMember(id, data);

    setMembers((current) =>
      current.map((item) => (item.id === id ? updated : item)),
    );
  }

  async function removeMember(id: string) {
    await deleteTeamMember(id);

    setMembers((current) => current.filter((item) => item.id !== id));
  }

  return {
    members,
    loading,
    addMember,
    editMember,
    removeMember,
  };
}