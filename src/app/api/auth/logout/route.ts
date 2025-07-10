import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import User from "@/lib/database/models/user.model";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface LogoutRequestBody {
  userId: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body: LogoutRequestBody = await request.json();
    if (!body.userId || !body.token) {
      return NextResponse.json(
        { status: "error", message: "userId and token are required" },
        { status: 400 }
      );
    }
    const decoded = jwt.verify(
      body.token,
      process.env.JWT_SECRET || ""
    ) as { userId: string; userType: string };
    if (decoded.userId !== body.userId) {
      return NextResponse.json(
        { status: "error", message: "Invalid token" },
        { status: 401 }
      );
    }

    // Invalidate session by unsetting sessionToken
    await User.updateOne(
      { userId: body.userId, sessionToken: body.token },
      { $unset: { sessionToken: "" } }
    );

    return NextResponse.json(
      { status: "success", message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    handleError(error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
