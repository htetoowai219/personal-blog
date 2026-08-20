"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pin, PinOff, Pencil, Trash2 } from "lucide-react";
import { Blog, MOODS, formatDate, handleLogout } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchBlogs = useCallback(async (searchQuery?: string) => {
    try {
      const url = searchQuery ? `/api/blogs?search=${encodeURIComponent(searchQuery)}` : "/api/blogs";
      const res = await fetch(url);
      if (res.status === 401) {
        router.replace("/auth");
        return;
      }
      const data = await res.json();
      setBlogs(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/auth");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUsername(data.username);
      });
    fetchBlogs();
  }, [fetchBlogs, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchBlogs]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b._id !== id));
        setShowDeleteConfirm(null);
      }
    } catch {
      // silent
    }
  };

  const handleTogglePin = async (blog: Blog) => {
    try {
      const res = await fetch(`/api/blogs/${blog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !blog.pinned }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBlogs((prev) =>
          prev.map((b) => (b._id === updated._id ? updated : b))
        );
      }
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Personal Blog</h1>
          <span className="text-xs text-muted">·</span>
          <span className="text-sm text-muted">{username}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/home/new"
            className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-md transition-colors"
          >
            + New Entry
          </Link>
          <button
            onClick={() => handleLogout()}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted/50 focus:border-accent transition-colors"
          />
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-2">
              {search ? "No entries match your search" : "No entries yet"}
            </p>
            <p className="text-muted/60 text-sm">
              {search
                ? "Try a different search term"
                : "Start your first entry to begin reflecting"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => {
              const moodInfo = blog.mood ? MOODS[blog.mood] : null;
              return (
                <div
                  key={blog._id}
                  className="group block bg-card hover:bg-card-hover border border-border rounded-xl p-5 transition-all cursor-pointer"
                  onClick={() => router.push(`/home/${blog._id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {blog.pinned && (
                          <Pin size={14} className="text-accent shrink-0" />
                        )}
                        <h2 className="text-lg font-semibold truncate">
                          {blog.title}
                        </h2>
                      </div>
                      <p className="text-muted text-sm line-clamp-2 mb-2">
                        {blog.content.replace(/[#*`>\-\[\]]/g, "").slice(0, 160)}
                        {blog.content.length > 160 ? "..." : ""}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted/70">
                        <span>{formatDate(blog.updatedAt)}</span>
                        {moodInfo && (
                          <span className={moodInfo.color}>
                            {moodInfo.emoji} {moodInfo.label}
                          </span>
                        )}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex gap-1">
                            {blog.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-input-bg rounded text-[10px]"
                              >
                                {tag}
                              </span>
                            ))}
                            {blog.tags.length > 3 && (
                              <span className="text-muted/50">
                                +{blog.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePin(blog); }}
                        className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-input-bg transition-colors"
                        title={blog.pinned ? "Unpin" : "Pin"}
                      >
                        {blog.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                      </button>
                      <Link
                        href={`/home/${blog._id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-input-bg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(blog._id); }}
                        className="p-1.5 text-muted hover:text-danger rounded-md hover:bg-input-bg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {showDeleteConfirm === blog._id && (
                    <div
                      className="mt-3 pt-3 border-t border-border flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-sm text-muted">
                        Delete this entry?
                      </span>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="text-sm bg-danger hover:bg-danger-hover text-white px-3 py-1 rounded-md transition-colors"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="text-sm text-muted hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted/50">
        A space for your thoughts
      </footer>
    </div>
  );
}
