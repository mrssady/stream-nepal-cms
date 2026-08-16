const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

const ORIGIN = API_URL.replace(
  /\/api\/?$/,
  "",
);

export function resolveMediaUrl(
  path?: string | null,
): string {
  if (!path) return "";

  if (
    /^https?:\/\//i.test(path) ||
    path.startsWith("data:")
  ) {
    return path;
  }

  return `${ORIGIN}${path}`;
}
