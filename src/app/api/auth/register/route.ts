import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/actions/user.action";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import User from "@/lib/database/models/user.model";

interface RegisterRequestBody {
  email: string;
  fullName?: string;
  photo?: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body: RegisterRequestBody = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    let existingUser;
    try {
      existingUser = await User.findOne({ email: body.email });
    } catch (error) {
      existingUser = null;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      email: body.email,
      fullName: body.fullName,
      photo: body.photo,
      password: body.password,
    });

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
