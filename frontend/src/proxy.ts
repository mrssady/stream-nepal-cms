import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "access_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    const { pathname } = request.nextUrl;
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/projects/:path*",
    "/events/:path*",
    "/event-series/:path*",
    "/gallery/:path*",
    "/sponsors/:path*",
    "/settings/:path*",
    "/players/:path*",
  ],
};
