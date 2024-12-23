import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value || "";
  const { pathname } = request.nextUrl;

  if (token && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
