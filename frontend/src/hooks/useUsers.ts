"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/users";

import {
  User,
  CreateUserDto,
  UpdateUserDto,
} from "@/types/user";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function addUser(data: CreateUserDto) {
    await createUser(data);
    await fetchUsers();
  }

  async function editUser(
    id: string,
    data: UpdateUserDto,
  ) {
    await updateUser(id, data);
    await fetchUsers();
  }

  async function removeUser(id: string) {
    await deleteUser(id);
    await fetchUsers();
  }

  return {
    users,
    loading,
    fetchUsers,
    addUser,
    editUser,
    removeUser,
  };
}