import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import { getStudentsByTeacherId } from "@/lib/actions/user.action";

interface FetchStudentRequestBody {
  teacherId: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body: FetchStudentRequestBody = await request.json();

    // Check required fields
    if (!body.teacherId) {
      return NextResponse.json(
        {
          status: "error",
          message: "teacherId is required",
        },
        { status: 400 }
      );
    }

    const students = await getStudentsByTeacherId(body.teacherId);

    return NextResponse.json(
      {
        status: "success",
        message: `Successfully fetched ${students.length} student(s)`,
        data: {
          students: students.map((student) => ({
            _id: student._id,
            userId: student.userId,
            email: student.email,
            fullName: student.fullName,
            userType: student.userType,
            photo: student.photo,
            teacherId: student.teacherId,
          })),
        },
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
