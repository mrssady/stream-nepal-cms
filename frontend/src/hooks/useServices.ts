"use client";

import { useEffect, useState } from "react";

import {
  getServices,
} from "@/services/services";

import {
  type Service,
} from "@/types/service";

export function useServices() {
  const [services, setServices] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadServices() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getServices();

      setServices(data);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to load services.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  return {
    services,
    loading,
    error,
    refresh: loadServices,
  };
}