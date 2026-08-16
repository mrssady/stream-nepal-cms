import type { Media } from "@/types/media";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export async function getPublicMedia(): Promise<
  Media[]
> {
  const response = await fetch(
    `${API_URL}/public/media`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  const result =
    (await response.json()) as ApiResponse<
      Media[]
    >;

  return result.data ?? [];
}
