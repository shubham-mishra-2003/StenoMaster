// api/student/scores/fetch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { getStudentScores } from "@/lib/actions/studentAssignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, studentId } = body;

    if (!token || !studentId) {
      return NextResponse.json(
        { status: "error", message: "Token and studentId are required" },
        { status: 400 }
      );
    }

    const scores = await getStudentScores(token, studentId);
    return NextResponse.json(
      {
        status: "success",
        message: "Scores retrieved successfully",
        data: scores,
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
