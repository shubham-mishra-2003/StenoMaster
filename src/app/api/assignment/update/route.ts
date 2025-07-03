import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils";
import { updateAssignment } from "@/lib/actions/assignment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      assignmentId,
      title,
      deadline,
      imageUrl,
      correctText,
      classId,
      token,
    } = body;

    if (!assignmentId || !token) {
      return NextResponse.json(
        { status: "error", message: "assignmentId and token are required" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (title) updates.title = title;
    if (deadline) updates.deadline = deadline;
    if (imageUrl) updates.imageUrl = imageUrl;
    if (correctText) updates.correctText = correctText;
    if (classId) updates.classId = classId;

    const updatedAssignment = await updateAssignment(
      assignmentId,
      updates,
      token
    );
    return NextResponse.json(
      {
        status: "success",
        message: "Assignment updated successfully",
        data: updatedAssignment,
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
