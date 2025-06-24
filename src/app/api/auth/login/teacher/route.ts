import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import User from "@/lib/database/models/user.model";

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body: LoginRequestBody = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: body.email, userType: "teacher" });
    if (!user) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    if (user.password !== body.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { _id, userId, email, fullName, __v } = user;
    return NextResponse.json(
      {
        message: "Teacher login successful",
        user: { _id, userId, email, fullName, __v },
      },
      { status: 200 }
    );
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
