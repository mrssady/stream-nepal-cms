"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createPlayer,
  deletePlayer,
  getPlayers,
  getTournamentTeams,
  updatePlayer,
} from "@/services/players";

import { getTournaments } from "@/services/tournaments";

import type {
  CreatePlayerDto,
  Player,
  TournamentTeam,
  UpdatePlayerDto,
} from "@/types/player";

import type { Tournament } from "@/types/tournament";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    getPlayers()
      .then((data) => setPlayers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getTournamentTeams()
      .then((data) => setTeams(data))
      .catch(console.error)
      .finally(() => setTeamsLoading(false));
  }, []);

  useEffect(() => {
    getTournaments()
      .then((data) => setTournaments(data))
      .catch(console.error);
  }, []);

  const fetchPlayers = useCallback(async () => {
    const data = await getPlayers();

    setPlayers(data);
  }, []);

  const fetchTeams = useCallback(async () => {
    const data = await getTournamentTeams();

    setTeams(data);
  }, []);

  async function addPlayer(data: CreatePlayerDto) {
    const created = await createPlayer(data);

    setPlayers((current) => [created, ...current]);
  }

  async function editPlayer(id: string, data: UpdatePlayerDto) {
    const updated = await updatePlayer(id, data);

    setPlayers((current) =>
      current.map((item) => (item.id === id ? updated : item)),
    );
  }

  async function removePlayer(id: string) {
    await deletePlayer(id);

    setPlayers((current) => current.filter((item) => item.id !== id));
  }

  return {
    players,
    teams,
    tournaments,
    loading,
    teamsLoading,
    fetchPlayers,
    fetchTeams,
    addPlayer,
    editPlayer,
    removePlayer,
  };
}