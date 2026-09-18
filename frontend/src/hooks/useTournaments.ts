"use client";

import { useEffect, useState } from "react";

import {
  createTournament,
  deleteTournament,
  getTournaments,
  updateTournament,
} from "@/services/tournaments";

import type {
  CreateTournamentDto,
  Tournament,
  UpdateTournamentDto,
} from "@/types/tournament";

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTournaments()
      .then((data) => setTournaments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function addTournament(data: CreateTournamentDto) {
    const created = await createTournament(data);

    setTournaments((current) => [created, ...current]);
  }

  async function editTournament(id: string, data: UpdateTournamentDto) {
    const updated = await updateTournament(id, data);

    setTournaments((current) =>
      current.map((item) => (item.id === id ? updated : item)),
    );
  }

  async function removeTournament(id: string) {
    await deleteTournament(id);

    setTournaments((current) => current.filter((item) => item.id !== id));
  }

  return {
    tournaments,
    loading,
    addTournament,
    editTournament,
    removeTournament,
  };
}