import { NextRequest, NextResponse } from "next/server";
import { getClasses, getStudentClasses } from "@/lib/actions/class.actions";
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

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    if (action === "getStudentClasses") {
      const token = request.headers
        .get("authorization")
        ?.replace("Bearer ", "");
      if (!token) {
        return NextResponse.json(
          { status: "error", message: "Token is required" },
          { status: 400 }
        );
      }
      const classes = await getStudentClasses(token);
      return NextResponse.json(
        {
          status: "success",
          message: "Student classes retrieved successfully",
          data: classes,
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    handleError(error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
