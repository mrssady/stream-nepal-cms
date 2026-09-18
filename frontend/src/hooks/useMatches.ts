"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createMatch,
  deleteMatch,
  getMatches,
  updateMatch,
} from "@/services/matches";

import type {
  CreateMatchDto,
  Match,
  UpdateMatchDto,
} from "@/types/match";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatches()
      .then((data) => setMatches(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(async () => {
    const data = await getMatches();

    setMatches(data);
  }, []);

  async function addMatch(data: CreateMatchDto) {
    const created = await createMatch(data);

    setMatches((current) => [created, ...current]);
  }

  async function editMatch(id: string, data: UpdateMatchDto) {
    const updated = await updateMatch(id, data);

    setMatches((current) =>
      current.map((item) => (item.id === id ? updated : item)),
    );
  }

  async function removeMatch(id: string) {
    await deleteMatch(id);

    setMatches((current) => current.filter((item) => item.id !== id));
  }

  return {
    matches,
    loading,
    refresh,
    addMatch,
    editMatch,
    removeMatch,
  };
}