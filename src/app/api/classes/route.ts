import { NextRequest, NextResponse } from "next/server";
import { getClasses } from "@/lib/actions/class.actions";
import { handleError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Token is required" },
        { status: 400 }
      );
    }
    const classes = await getClasses(token);
    return NextResponse.json(
      {
        status: "success",
        message: "Classes retrieved successfully",
        data: classes,
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
