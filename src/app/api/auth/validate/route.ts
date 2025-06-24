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
    const body: ValidateRequestBody = await request.json();

    if (!body.token) {
      return NextResponse.json(
        { status: "error", message: "Token is required" },
        { status: 400 }
      );
    }

    const user = await validateSessionToken(body.token);

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
      { status: 200 }
    );
  } catch (error: any) {
    handleError(error);
    return NextResponse.json(
      { status: "error", message: error.message || "Invalid session" },
      { status: 401 }
    );
  }
}
