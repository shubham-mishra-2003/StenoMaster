import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { deleteScoresByStudent } from "@/lib/database/models/score.model";

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json();
    await deleteScoresByStudent(studentId);

    return NextResponse.json(
      { status: "success", message: "Scores deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    handleError(error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
