import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { getAssignments } from "@/lib/actions/assignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, classId } = body;

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Token is required" },
        { status: 400 }
      );
    }

    const assignments = await getAssignments(token, classId);
    return NextResponse.json(
      {
        status: "success",
        message: "Assignments retrieved successfully",
        data: assignments,
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
