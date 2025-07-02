import { NextRequest, NextResponse } from "next/server";
import { getStudentsInClass } from "@/lib/actions/class.actions";
import { handleError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, token } = body;

    if (!classId || !token) {
      return NextResponse.json(
        { status: "error", message: "classId and token are required" },
        { status: 400 }
      );
    }

    const students = await getStudentsInClass(classId, token);
    return NextResponse.json(
      {
        status: "success",
        message: "Students retrieved successfully",
        data: students,
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
