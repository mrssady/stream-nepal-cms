"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createService,
  CreateServiceDto,
  deleteService,
  getServices,
  Service,
  updateService,
  UpdateServiceDto,
} from "@/services/service";

export function useServices() {
  const [services, setServices] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getServices();

      setServices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  async function addService(
    data: CreateServiceDto,
  ) {
    await createService(data);
    await fetchServices();
  }

  async function editService(
    id: string,
    data: UpdateServiceDto,
  ) {
    await updateService(id, data);
    await fetchServices();
  }

  async function removeService(id: string) {
    await deleteService(id);
    await fetchServices();
  }

  return {
    services,
    loading,
    fetchServices,
    addService,
    editService,
    removeService,
  };
}