import api from "@/services/api";

import {
  UpdateWebsiteSetting,
  WebsiteSetting,
} from "@/types/settings";

function unwrap<T>(response: any): T {
  return (
    response?.data?.data?.data ??
    response?.data?.data ??
    response?.data
  );
}

export async function getSettings(): Promise<WebsiteSetting> {
  const response = await api.get("/settings");

  return unwrap<WebsiteSetting>(response);
}

export async function createSettings(
  data: UpdateWebsiteSetting,
): Promise<WebsiteSetting> {
  const response = await api.post("/settings", data);

  return unwrap<WebsiteSetting>(response);
}

export async function updateSettings(
  data: UpdateWebsiteSetting,
): Promise<WebsiteSetting> {
  const response = await api.patch("/settings", data);

  return unwrap<WebsiteSetting>(response);
}