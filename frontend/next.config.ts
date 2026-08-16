import type { NextConfig } from "next";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

const apiBase = apiUrl.replace(
  /\/api\/?$/,
  "",
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
