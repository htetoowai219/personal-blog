"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (!blog) return null;

  const moodInfo = blog.mood ? MOODS[blog.mood] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-dashed border-border px-6 py-4">
        <div className="max-w-[680px] mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="font-mono text-xs uppercase tracking-[0.15em] text-muted hover:text-accent transition-colors"
          >
            &larr; All entries
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href={`/home/${blog._id}/edit`}
              className="font-mono text-xs uppercase tracking-[0.15em] text-accent hover:text-accent-hover transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => handleLogout(router)}
              className="font-mono text-xs uppercase tracking-[0.15em] text-faint hover:text-accent transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[680px] mx-auto w-full px-6 py-14">
        <article>
          <header className="mb-10">
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
              <span>{formatDate(blog.createdAt)}</span>
              <span aria-hidden>·</span>
              <span>{formatTime(blog.createdAt)}</span>
              {moodInfo && (
                <>
                  <span aria-hidden>·</span>
                  <span className={moodInfo.color}>
                    {moodInfo.emoji} {moodInfo.label}
                  </span>
                </>
              )}
            </p>
            <h1 className="font-heading text-3xl md:text-[2.5rem] leading-tight text-ink tracking-tight">
              {blog.title}
            </h1>
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 font-mono text-xs lowercase bg-input-bg border border-input-border rounded-[2px] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          <div className="prose article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </div>
          <div className="mt-14 text-center" aria-hidden>
            <span className="text-gold/60 text-lg tracking-[0.6em]">
              &#10022;&#8194;&#10022;&#8194;&#10022;
            </span>
          </div>
          <div className="mt-12 pt-6 border-t border-dashed border-border text-center">
            <Link
              href="/home"
              className="font-mono text-xs uppercase tracking-[0.15em] text-muted hover:text-accent transition-colors"
            >
              &larr; Return to entries
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
