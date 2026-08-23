import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models";

function clean(value: unknown, max: number): string | null | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length ? trimmed : null;
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { db } = await connectToDatabase();
  const users = db.collection<User>("users");
  const found = await users.findOne({ _id: new ObjectId(user.userId) });

  if (!found) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    username: found.username,
    userId: found._id!.toString(),
    displayName: found.displayName ?? null,
    bio: found.bio ?? null,
    location: found.location ?? null,
    joined: found.createdAt,
  });
}

export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const update: Record<string, string | null> = {};
  const displayName = clean(body.displayName, 60);
  const location = clean(body.location, 60);
  const bio = clean(body.bio, 280);
  if (displayName !== undefined) update.displayName = displayName;
  if (location !== undefined) update.location = location;
  if (bio !== undefined) update.bio = bio;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const users = db.collection<User>("users");

  try {
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(user.userId) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      displayName: result.displayName ?? null,
      bio: result.bio ?? null,
      location: result.location ?? null,
      joined: result.createdAt,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
