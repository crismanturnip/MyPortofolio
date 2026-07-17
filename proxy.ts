import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("admin_session")?.value;

  const isAdminPage = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAuthApi =
    pathname.startsWith("/api/admin/auth/login") ||
    pathname.startsWith("/api/admin/auth/logout") ||
    pathname.startsWith("/api/admin/auth/me");

  if (isAdminPage && !isLoginPage && !sessionToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (isAdminApi && !isAuthApi && !sessionToken) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
