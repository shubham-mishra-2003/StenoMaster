import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import User, { IUser } from "@/lib/database/models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateUserType } from "@/lib/actions/user.action";

interface LoginRequestBody {
  email: string;
  password: string;
  userType: "teacher" | "student";
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body: LoginRequestBody = await request.json();

    // Normalize email
    body.email = body.email.toLowerCase();

    // Check required fields
    if (!body.email || !body.password || !body.userType) {
      return NextResponse.json(
        {
          status: "error",
          message: "email, password, and userType are required",
        },
        { status: 400 }
      );
    }

    // Validate userType
    validateUserType(body.userType);

    //console.log("Login query:", { email: body.email, userType: body.userType });

    const user: IUser | null = await User.findOne({
      email: body.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: `${
            body.userType.charAt(0).toUpperCase() + body.userType.slice(1)
          } not found`,
        },
        { status: 404 }
      );
    }

    //console.log("Found user:", user);

    // Check userType match, with fallback for undefined
    if (!user.userType) {
      await User.updateOne(
        { _id: user._id },
        { $set: { userType: body.userType } }
      );
      user.userType = body.userType;
      //console.log("Updated userType to:", body.userType);
    } else if (user.userType !== body.userType) {
      return NextResponse.json(
        {
          status: "error",
          message: `User is registered as ${user.userType}, not ${body.userType}`,
        },
        { status: 400 }
      );
    }

    if (!(await bcrypt.compare(body.password, user.password))) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT and store in database
    const token = jwt.sign(
      { userId: user.userId, userType: user.userType },
      process.env.JWT_SECRET || ""
    );

    // Update user with new session token, invalidating previous sessions
    await User.updateOne({ _id: user._id }, { $set: { sessionToken: token } });

    return NextResponse.json(
      {
        status: "success",
        message: `${
          user.userType.charAt(0).toUpperCase() + user.userType.slice(1)
        } login successful`,
        data: {
          user: {
            _id: user._id,
            userId: user.userId,
            email: user.email,
            fullName: user.fullName,
            userType: user.userType,
            photo: user.photo,
          },
          token,
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
