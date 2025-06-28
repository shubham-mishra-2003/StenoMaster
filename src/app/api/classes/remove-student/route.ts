import { NextRequest, NextResponse } from "next/server";
import { removeStudentFromClass } from "@/lib/actions/class.actions";
import { handleError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await removeStudentFromClass(body.classId, body.studentId, body.token);
    return NextResponse.json(
      {
        status: "success",
        message: "Student removed from class successfully",
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
