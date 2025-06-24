import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URL = process.env.MONGODB_URL!;
const mongoClient = new MongoClient(MONGODB_URL);

class AuthProvider {
  async getUser(userId: string) {
    await mongoClient.connect();
    const db = mongoClient.db("stenomaster");
    const user = await db.collection("users").findOne({ clerkId: userId });
    if (!user) throw new Error("User not found");
    return {
      id: user.clerkId,
      type: user.type,
      name: user.name,
      email: user.email,
      classIds: user.classIds
    };
  }
}

export async function middleware(request: NextRequest) {
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
        "[Middleware] No user cookie, redirecting to /?showLogin=true"
      );
      const url = new URL("/?showLogin=true", request.url);
      return NextResponse.redirect(url);
    }

    try {
      const user = JSON.parse(userCookie);
      console.log("[Middleware] Parsed user:", user);
      const authProvider = new AuthProvider();
      const dbUser = await authProvider.getUser(user.id);
      if (!dbUser || !["student", "teacher"].includes(dbUser.type)) {
        console.log(
          "[Middleware] Invalid user, redirecting to /?showLogin=true"
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
      console.log("[Middleware] Error validating user, redirecting:", error);
      const response = NextResponse.redirect(
        new URL("/?showLogin=true", request.url)
      );
      response.cookies.delete("StenoMaster-user");
      return response;
    }
  }

  // Check for landing page
  if (pathname === "/") {
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        console.log("[Middleware] Parsed user on /:", user);
        const authProvider = new AuthProvider();
        const dbUser = await authProvider.getUser(user.id);
        if (dbUser && ["student", "teacher"].includes(dbUser.type)) {
          const dashboardPath =
            dbUser.type === "teacher"
              ? "/dashboard/teacher"
              : "/dashboard/student";
          console.log("[Middleware] Redirecting to:", dashboardPath);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        } else {
          console.log("[Middleware] Invalid user data, clearing cookie");
          const response = NextResponse.next();
          response.cookies.delete("StenoMaster-user");
          return response;
        }
      } catch (error) {
        console.log(
          "[Middleware] Error parsing cookie, clearing cookie:",
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
  matcher: ["/", "/dashboard/:path*"]
};
