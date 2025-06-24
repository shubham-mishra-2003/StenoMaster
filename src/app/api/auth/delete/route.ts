import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import User from "@/lib/database/models/user.model";
import { deleteUser } from "@/lib/actions/user.action";

interface DeleteRequestBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body: DeleteRequestBody = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: body.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password !== body.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await deleteUser(user.userId);

    return NextResponse.json(
      { message: "Account deleted successfully" },
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
