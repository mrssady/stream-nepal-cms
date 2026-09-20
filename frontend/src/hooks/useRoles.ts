"use client";

import { useCallback, useEffect, useState } from "react";

import { getRolesOverview } from "@/services/roles";
import type { RolesOverview } from "@/types/role";

export function useRoles() {
  const [data, setData] = useState<RolesOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getRolesOverview()
      .then((overview) => {
        if (mounted) {
          setData(overview);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const fetchRoles = useCallback(async () => {
    setLoading(true);

    try {
      const overview = await getRolesOverview();

      setData(overview);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    fetchRoles,
  };
}