import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { deleteAssignment } from "@/lib/actions/assignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, token } = body;

    if (!assignmentId || !token) {
      return NextResponse.json(
        { status: "error", message: "assignmentId and token are required" },
        { status: 400 }
      );
    }

    await deleteAssignment(assignmentId, token);
    return NextResponse.json(
      {
        status: "success",
        message: "Assignment deleted successfully",
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
