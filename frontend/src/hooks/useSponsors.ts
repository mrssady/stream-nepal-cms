"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createSponsor,
  deleteSponsor,
  getSponsors,
  updateSponsor,
} from "@/services/sponsors";

import {
  type CreateSponsorDto,
  type Sponsor,
  type UpdateSponsorDto,
} from "@/types/sponsors";

export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const fetchSponsors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSponsors();

      setSponsors(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load sponsors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSponsors();
  }, [fetchSponsors]);

  async function addSponsor(
    data: CreateSponsorDto,
  ) {
    const created = await createSponsor(data);

    setSponsors((current) => [
      created,
      ...current,
    ]);
  }

  async function editSponsor(
    id: string,
    data: UpdateSponsorDto,
  ) {
    const updated = await updateSponsor(
      id,
      data,
    );

    setSponsors((current) =>
      current.map((item) =>
        item.id === id ? updated : item,
      ),
    );
  }

  async function removeSponsor(id: string) {
    await deleteSponsor(id);

    setSponsors((current) =>
      current.filter(
        (item) => item.id !== id,
      ),
    );
  }

  return {
    sponsors,
    loading,
    error,
    fetchSponsors,
    addSponsor,
    editSponsor,
    removeSponsor,
  };
}
