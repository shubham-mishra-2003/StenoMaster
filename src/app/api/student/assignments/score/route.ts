// api/student/assignment/score/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { submitAssignmentScore } from "@/lib/actions/studentAssignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      assignmentId,
      typedText,
      accuracy,
      wpm,
      timeElapsed,
      token,
      isTypingTest,
    } = body;

    if (
      !studentId ||
      !assignmentId ||
      !typedText ||
      !accuracy ||
      !wpm ||
      !timeElapsed ||
      !token
    ) {
      return NextResponse.json(
        { status: "error", message: "All fields and token are required" },
        { status: 400 }
      );
    }

    const score = await submitAssignmentScore({
      studentId,
      assignmentId,
      typedText,
      accuracy,
      wpm,
      timeElapsed,
      token,
      isTypingTest,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Score submitted successfully",
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
