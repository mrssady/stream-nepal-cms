"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  Player,
  CreatePlayerDto,
  UpdatePlayerDto,
} from "@/services/player";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getPlayers();

      setPlayers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  async function addPlayer(
    data: CreatePlayerDto,
  ) {
    await createPlayer(data);
    await fetchPlayers();
  }

  async function editPlayer(
    id: string,
    data: UpdatePlayerDto,
  ) {
    await updatePlayer(id, data);
    await fetchPlayers();
  }

  async function removePlayer(
    id: string,
  ) {
    await deletePlayer(id);
    await fetchPlayers();
  }

  return {
    players,
    loading,
    fetchPlayers,
    addPlayer,
    editPlayer,
    removePlayer,
  };
}