// api/score/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { createScore } from "@/lib/actions/score.actions";

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
      completedAt,
      token,
    } = body;

    if (
      !id ||
      !studentId ||
      !assignmentId ||
      !typedText ||
      !accuracy ||
      !wpm ||
      !timeElapsed ||
      !completedAt
    ) {
      return NextResponse.json(
        { status: "error", message: "All fields are required" },
        { status: 400 }
      );
    }

    const score = await createScore(
      {
        id,
        studentId,
        assignmentId,
        typedText,
        accuracy,
        wpm,
        timeElapsed,
        completedAt: new Date(completedAt),
      },
      token
    );
    return NextResponse.json(
      {
        status: "success",
        message: "Score saved successfully",
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
