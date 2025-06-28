import { NextRequest, NextResponse } from "next/server";
import { createClass } from "@/lib/actions/class.actions";
import { handleError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const classData = await createClass(body);
    return NextResponse.json(
      {
        status: "success",
        message: "Class created successfully",
        data: classData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    handleError(error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
