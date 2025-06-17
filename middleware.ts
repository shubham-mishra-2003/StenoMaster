import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("[Middleware] Request URL:", request.url);
  console.log("[Middleware] Request Pathname:", request.nextUrl.pathname);
  console.log("[Middleware] Cookies:", request.cookies.getAll());

  const userCookie = request.cookies.get("StenoMaster-user")?.value;
  console.log("[Middleware] StenoMaster-user cookie:", userCookie);

  const { pathname } = request.nextUrl;

  // Allow static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(.*)$/)
  ) {
    console.log("[Middleware] Allowing static/API route:", pathname);
    return NextResponse.next();
  }

  // Check for dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!userCookie) {
      console.log(
        "[Middleware] No user cookie found, redirecting to /?showLogin=true from:",
        pathname
      );
      const url = new URL("/?showLogin=true", request.url);
      return NextResponse.redirect(url);
    }

    try {
      const user = JSON.parse(userCookie);
      console.log("[Middleware] Parsed user:", user);
      if (!user || !user.type || !["student", "teacher"].includes(user.type)) {
        console.log(
          "[Middleware] Invalid user data, redirecting to /?showLogin=true from:",
          pathname
        );
        const response = NextResponse.redirect(
          new URL("/?showLogin=true", request.url)
        );
        response.cookies.delete("StenoMaster-user");
        return response;
      }
      console.log(
        "[Middleware] User authenticated, allowing access to:",
        pathname
      );
      return NextResponse.next();
    } catch (error) {
      console.log(
        "[Middleware] Error parsing cookie, redirecting to /?showLogin=true from:",
        pathname,
        "Error:",
        error
      );
      const response = NextResponse.redirect(
        new URL("/?showLogin=true", request.url)
      );
      response.cookies.delete("StenoMaster-user");
      return response;
    }
  }

  // Check for landing page (/)
  if (pathname === "/") {
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        console.log("[Middleware] Parsed user on /:", user);
        if (user && user.type && ["student", "teacher"].includes(user.type)) {
          const dashboardPath =
            user.type === "teacher"
              ? "/dashboard/teacher"
              : "/dashboard/student";
          console.log(
            "[Middleware] User authenticated, redirecting from / to:",
            dashboardPath
          );
          const url = new URL(dashboardPath, request.url);
          return NextResponse.redirect(url);
        } else {
          console.log("[Middleware] Invalid user data on /, clearing cookie");
          const response = NextResponse.next();
          response.cookies.delete("StenoMaster-user");
          return response;
        }
      } catch (error) {
        console.log(
          "[Middleware] Error parsing cookie on /, clearing cookie. Error:",
          error
        );
        const response = NextResponse.next();
        response.cookies.delete("StenoMaster-user");
        return response;
      }
    }
    console.log("[Middleware] No user cookie, allowing access to /");
    return NextResponse.next();
  }

  console.log("[Middleware] Allowing other route:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
