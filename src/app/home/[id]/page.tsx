"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { Blog, MOODS, formatDate, formatTime, handleLogout } from "@/lib/utils";

export default function ReadEntryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blogs/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.replace("/auth");
          return null;
        }
        if (!res.ok) {
          router.replace("/home");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setBlog(data);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!blog) return null;

  const moodInfo = blog.mood ? MOODS[blog.mood] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link
          href="/home"
          className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/home/${blog._id}/edit`}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => handleLogout(router)}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <article>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-3">{blog.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span>{formatDate(blog.createdAt)}</span>
              <span>·</span>
              <span>{formatTime(blog.createdAt)}</span>
              {moodInfo && (
                <>
                  <span>·</span>
                  <span className={moodInfo.color}>
                    {moodInfo.emoji} {moodInfo.label}
                  </span>
                </>
              )}
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-input-bg text-muted rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}
