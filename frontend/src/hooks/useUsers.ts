"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/services/users";

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();

        console.log("Users API Response:", data);

        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return {
    users,
    loading,
  };
}