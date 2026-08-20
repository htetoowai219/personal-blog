import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/lib/models";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { db } = await connectToDatabase();
  const blogs = db.collection<Blog>("blogs");

  try {
    const blog = await blogs.findOne({ _id: new ObjectId(id), userId: user.userId });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json({ ...blog, _id: blog._id!.toString() });
  } catch {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { title, content, mood, tags, pinned } = await request.json();

  const { db } = await connectToDatabase();
  const blogs = db.collection<Blog>("blogs");

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) update.title = title;
  if (content !== undefined) update.content = content;
  if (mood !== undefined) update.mood = mood;
  if (tags !== undefined) update.tags = tags;
  if (pinned !== undefined) update.pinned = pinned;

  try {
    const result = await blogs.findOneAndUpdate(
      { _id: new ObjectId(id), userId: user.userId },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ ...result, _id: result._id!.toString() });
  } catch {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { db } = await connectToDatabase();
  const blogs = db.collection<Blog>("blogs");

  try {
    const result = await blogs.deleteOne({ _id: new ObjectId(id), userId: user.userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }
}
