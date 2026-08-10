"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createMedia,
  deleteMedia,
  getMedia,
  updateMedia,
} from "@/services/media";

import {
  type CreateMediaDto,
  type Media,
  type UpdateMediaDto,
} from "@/types/media";

export function useMedia() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getMedia();

      setMedia(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMedia();
  }, [fetchMedia]);

  async function addMedia(
    data: CreateMediaDto,
  ) {
    const created = await createMedia(data);

    setMedia((current) => [
      created,
      ...current,
    ]);
  }

  async function editMedia(
    id: string,
    data: UpdateMediaDto,
  ) {
    const updated = await updateMedia(
      id,
      data,
    );

    setMedia((current) =>
      current.map((item) =>
        item.id === id ? updated : item,
      ),
    );
  }

  async function removeMedia(id: string) {
    await deleteMedia(id);

    setMedia((current) =>
      current.filter(
        (item) => item.id !== id,
      ),
    );
  }

  return {
    media,
    loading,
    error,
    fetchMedia,
    addMedia,
    editMedia,
    removeMedia,
  };
}