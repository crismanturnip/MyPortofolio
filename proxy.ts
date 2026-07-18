import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PUBLIC_CONTENT_RELEASED } from "@/lib/content-release";

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

  const contentType = pathname.startsWith("/novel") || pathname.startsWith("/api/public/novels")
    ? "novel"
    : pathname.startsWith("/blog") || pathname.startsWith("/api/public/blogs")
      ? "blog"
      : null;

  if (!PUBLIC_CONTENT_RELEASED && contentType) {
    if (pathname.startsWith("/api/public/")) {
      return NextResponse.json({ message: "Konten belum tersedia." }, { status: 404 });
    }

    const comingSoonUrl = new URL("/coming-soon", request.url);
    comingSoonUrl.searchParams.set("type", contentType);
    comingSoonUrl.searchParams.set("title", contentType === "blog" ? "Blog" : "Series");
    return NextResponse.redirect(comingSoonUrl);
  }

  if (isAdminPage && !isLoginPage && !sessionToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminApi && !isAuthApi && !sessionToken) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/blog/:path*",
    "/novel/:path*",
    "/api/public/blogs/:path*",
    "/api/public/novels/:path*"
  ]
};
