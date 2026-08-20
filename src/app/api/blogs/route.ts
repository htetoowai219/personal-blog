import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/lib/models";

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { db } = await connectToDatabase();
  const blogs = db.collection<Blog>("blogs");

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const query: Record<string, unknown> = { userId: user.userId };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const result = await blogs
    .find(query)
    .sort({ pinned: -1, updatedAt: -1 })
    .toArray();

  return NextResponse.json(
    result.map((b) => ({
      ...b,
      _id: b._id!.toString(),
    }))
  );
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, content, mood, tags } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const blogs = db.collection<Blog>("blogs");

  const now = new Date();
  const result = await blogs.insertOne({
    userId: user.userId,
    title,
    content,
    mood: mood || undefined,
    tags: tags || [],
    pinned: false,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    _id: result.insertedId.toString(),
    userId: user.userId,
    title,
    content,
    mood,
    tags: tags || [],
    pinned: false,
    createdAt: now,
    updatedAt: now,
  });
}
