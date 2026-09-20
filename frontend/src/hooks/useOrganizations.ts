"use client";

import { useEffect, useState } from "react";

import { getOrganizations } from "@/services/organizations";

import { type Organization } from "@/types/organization";

export function useOrganizations() {
  const [organizations, setOrganizations] =
    useState<Organization[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  async function loadOrganizations() {
    try {
      setLoading(true);
      setError(null);

      const data = await getOrganizations();

      setOrganizations(data);
    } catch (error) {
      setError(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
          "Failed to load organizations.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    refresh: loadOrganizations,
  };
}