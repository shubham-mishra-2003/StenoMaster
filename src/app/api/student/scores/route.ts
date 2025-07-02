import { NextRequest, NextResponse } from "next/server";
import {
  getScores,
  createScore,
} from "@/lib/actions/studentassignments.actions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const scores = await getScores(studentId || undefined);
    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const score = await req.json();
    const result = await createScore(score);
    return NextResponse.json({
      message: "Score created successfully",
      id: result.id,
    });
  } catch (error) {
    console.error("Error creating score:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
