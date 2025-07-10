import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import User from "@/lib/database/models/user.model";
import { deleteUser } from "@/lib/actions/user.action";
import jwt from "jsonwebtoken";

interface DeleteRequestBody {
  userId: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body: DeleteRequestBody = await request.json();

    if (!body.userId || !body.token) {
      return NextResponse.json(
        { status: "error", message: "userId and token are required" },
        { status: 400 }
      );
    }

    // Verify token
    const decoded = jwt.verify(
      body.token,
      process.env.JWT_SECRET || ""
    ) as { userId: string; userType: string };

    // Authenticate the requester
    const requester = await User.findOne({
      userId: decoded.userId,
      sessionToken: body.token,
    });
    if (!requester) {
      return NextResponse.json(
        { status: "error", message: "Invalid or expired session token" },
        { status: 401 }
      );
    }

    // If the requester is deleting their own account
    if (decoded.userId === body.userId) {
      await deleteUser(body.userId);
      return NextResponse.json(
        { status: "success", message: "Account deleted successfully" },
        { status: 200 }
      );
    }

    // If the requester is a teacher, allow deleting any student account
    if (decoded.userType === "teacher") {
      const userToDelete = await User.findOne({
        userId: body.userId,
        userType: "student",
      });
      if (!userToDelete) {
        return NextResponse.json(
          { status: "error", message: "Student not found" },
          { status: 404 }
        );
      }
      await deleteUser(body.userId);
      return NextResponse.json(
        { status: "success", message: "Student account deleted successfully" },
        { status: 200 }
      );
    }

    // If neither self-deletion nor teacher, deny access
    return NextResponse.json(
      { status: "error", message: "Unauthorized to delete this account" },
      { status: 403 }
    );
  } catch (error: any) {
    handleError(error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
