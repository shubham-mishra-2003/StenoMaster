import { NextRequest, NextResponse } from "next/server";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "@/lib/actions//studentassignments.actions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const assignments = await getAssignments(id || undefined);
    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const assignment = await req.json();
    const result = await createAssignment(assignment);
    return NextResponse.json({
      message: "Assignment created successfully",
      id: result.id,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const assignment = await req.json();
    const result = await updateAssignment(assignment);
    return NextResponse.json({
      message: "Assignment updated successfully",
      id: result.id,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }
    await deleteAssignment(id);
    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
