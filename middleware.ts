import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get("StenoMaster-user")?.value;
  const isAuthenticated = !!userCookie;
  const { pathname } = request.nextUrl;

  // Allow access to static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      // Redirect to landing page with login open
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("showLogin", "true");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Redirect authenticated users from landing page to their dashboard
  if (pathname === "/" && isAuthenticated) {
    try {
      const user = JSON.parse(userCookie);
      const dashboardPath =
        user.userType === "teacher"
          ? "/dashboard/teacher"
          : "/dashboard/student";
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    } catch {
      // If cookie is invalid, clear it and proceed to landing page
      const response = NextResponse.next();
      response.cookies.delete("StenoMaster-user");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
