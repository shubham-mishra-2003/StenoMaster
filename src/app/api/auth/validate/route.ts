import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import { validateSessionToken } from "@/lib/actions/user.action";

interface ValidateRequestBody {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    let body: ValidateRequestBody;
    try {
      body = await request.json();
    } catch (error) {
      console.error("[validate] JSON parsing error:", error);
      return NextResponse.json(
        { status: "error", message: "Invalid or empty request body" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (
      !body.token ||
      typeof body.token !== "string" ||
      body.token.trim() === ""
    ) {
      //console.log("[validate] Missing or invalid token:", body.token);
      return NextResponse.json(
        { status: "error", message: "Valid token is required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await validateSessionToken(body.token);
    if (!user || !user._id || !user.userId || !user.email || !user.userType) {
      // console.log(
      //   "[validate] Invalid user data from validateSessionToken:",
      //   user
      // );
      return NextResponse.json(
        { status: "error", message: "Invalid or expired token" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    //console.log("[validate] Session validated for user:", user.userId);
    return NextResponse.json(
      {
        status: "success",
        message: "Session is valid",
        data: {
          user: {
            _id: user._id,
            userId: user.userId,
            email: user.email,
            fullName: user.fullName,
            userType: user.userType,
            photo: user.photo,
          },
        },
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[validate] Error in POST /api/auth/validate:", error);
    handleError(error);
    const message =
      typeof error.message === "string" ? error.message : "Invalid session";
    return NextResponse.json(
      { status: "error", message },
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}
