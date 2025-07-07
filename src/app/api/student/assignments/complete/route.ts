import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { markAssignmentCompleted } from "@/lib/actions/studentAssignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, studentId, token } = body;

    if (!assignmentId || !studentId || !token) {
      return NextResponse.json(
        {
          status: "error",
          message: "assignmentId, studentId, and token are required",
        },
        { status: 400 }
      );
    }

    const updatedStudentAssignment = await markAssignmentCompleted(
      assignmentId,
      studentId,
      token
    );
    return NextResponse.json(
      {
        status: "success",
        message: "Assignment marked as completed successfully",
        data: updatedStudentAssignment,
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
