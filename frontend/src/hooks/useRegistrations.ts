"use client";

import { useEffect, useState } from "react";

import {
  createRegistration,
  deleteRegistration,
  getRegistrations,
  updateRegistration,
} from "@/services/registrations";

import type {
  CreateRegistrationDto,
  Registration,
  UpdateRegistrationDto,
} from "@/types/registration";

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRegistrations()
      .then((data) => setRegistrations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function addRegistration(data: CreateRegistrationDto) {
    const created = await createRegistration(data);

    setRegistrations((current) => [created, ...current]);
  }

  async function editRegistration(id: string, data: UpdateRegistrationDto) {
    const updated = await updateRegistration(id, data);

    setRegistrations((current) =>
      current.map((item) => (item.id === id ? updated : item)),
    );
  }

  async function removeRegistration(id: string) {
    await deleteRegistration(id);

    setRegistrations((current) => current.filter((item) => item.id !== id));
  }

  return {
    registrations,
    loading,
    addRegistration,
    editRegistration,
    removeRegistration,
  };
}