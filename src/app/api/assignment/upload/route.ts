import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { createAssignment } from "@/lib/actions/assignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, deadline, imageUrl, correctText, classId, token } = body;

    if (!title || !deadline || !correctText || !classId || !token) {
      return NextResponse.json(
        { status: "error", message: "All fields and token are required" },
        { status: 400 }
      );
    }

    const assignment = await createAssignment({
      title,
      deadline,
      imageUrl,
      correctText,
      classId,
      token,
    });
    return NextResponse.json(
      {
        status: "success",
        message: "Assignment created successfully",
        data: assignment,
      },
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
