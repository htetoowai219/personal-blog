import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { signToken } from "@/lib/auth";
import { User } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection<User>("users");

    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await users.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const token = signToken({ userId: result.insertedId.toString(), username });

    const response = NextResponse.json({ username, userId: result.insertedId.toString() });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
