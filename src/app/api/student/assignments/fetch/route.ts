// api/student/assignment/fetch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { getAvailableAssignments } from "@/lib/actions/studentAssignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, classId } = body;

    if (!token || !classId) {
      return NextResponse.json(
        { status: "error", message: "Token and classId are required" },
        { status: 400 }
      );
    }

    const assignments = await getAvailableAssignments(token, classId);
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
