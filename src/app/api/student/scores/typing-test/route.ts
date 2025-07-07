import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { createScore } from "@/lib/actions/studentAssignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      studentId,
      assignmentId,
      typedText,
      accuracy,
      wpm,
      timeElapsed,
      token,
    } = body;

    if (!id || !studentId || !assignmentId || !typedText || !token) {
      return NextResponse.json(
        {
          status: "error",
          message: "All required fields and token are required",
        },
        { status: 400 }
      );
    }

    const score = await createScore({
      id,
      studentId,
      assignmentId,
      typedText,
      accuracy,
      wpm,
      timeElapsed,
      token,
      isTypingTest: true,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Typing test score created successfully",
        data: score,
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
