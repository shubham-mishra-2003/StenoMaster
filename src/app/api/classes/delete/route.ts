import { NextRequest, NextResponse } from "next/server";
import { deleteClass } from "@/lib/actions/class.actions";
import { handleError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await deleteClass(body.classId, body.token);
    return NextResponse.json(
      { status: "success", message: "Class deleted successfully" },
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
