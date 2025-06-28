import { NextRequest, NextResponse } from "next/server";
import { assignStudentToClass } from "@/lib/actions/class.actions";
import { handleError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await assignStudentToClass(body.classId, body.studentId, body.token);
    return NextResponse.json(
      {
        status: "success",
        message: "Student assigned to class successfully",
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
