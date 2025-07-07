// api/score/fetch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { getStudentScores } from "@/lib/actions/score.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, token } = body;

    if (!studentId || !token) {
      return NextResponse.json(
        { status: "error", message: "studentId and token are required" },
        { status: 400 }
      );
    }

    const scores = await getStudentScores(studentId, token);
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
