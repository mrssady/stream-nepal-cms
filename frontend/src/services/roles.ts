import api from "./api";
import type { RolesOverview } from "@/types/role";

export async function getRolesOverview(): Promise<RolesOverview> {
  const response = await api.get("/roles");
  return response.data.data;
}