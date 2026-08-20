"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Pin, PinOff, Pencil, Trash2, Plus } from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

const MOODS: Record<string, { emoji: string; label: string; color: string }> = {
  reflective: { emoji: "🪞", label: "Reflective", color: "text-[var(--mood-reflect)]" },
  grateful: { emoji: "🙏", label: "Grateful", color: "text-[var(--mood-grateful)]" },
  anxious: { emoji: "🌊", label: "Anxious", color: "text-[var(--mood-anxious)]" },
  calm: { emoji: "🧘", label: "Calm", color: "text-[var(--mood-calm)]" },
  inspired: { emoji: "✨", label: "Inspired", color: "text-[var(--mood-inspired)]" },
  sad: { emoji: "🌧", label: "Sad", color: "text-[var(--mood-sad)]" },
};

export default function HomePage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "create" | "edit" | "read">("list");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [preview, setPreview] = useState(false);
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

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (view === "edit" && selectedBlog) {
        const res = await fetch(`/api/blogs/${selectedBlog._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, mood, tags }),
        });
        if (res.ok) {
          const updated = await res.json();
          setBlogs((prev) =>
            prev.map((b) => (b._id === updated._id ? updated : b))
          );
        }
      } else {
        const res = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, mood, tags }),
        });
        if (res.ok) {
          const newBlog = await res.json();
          setBlogs((prev) => [newBlog, ...prev]);
        }
      }
      resetForm();
      setView("list");
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b._id !== id));
        setShowDeleteConfirm(null);
        if (view === "read" && selectedBlog?._id === id) {
          setView("list");
          setSelectedBlog(null);
        }
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

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMood("");
    setTagsInput("");
    setSelectedBlog(null);
    setPreview(false);
  };

  const startEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setMood(blog.mood || "");
    setTagsInput(blog.tags?.join(", ") || "");
    setPreview(false);
    setView("edit");
  };

  const startRead = (blog: Blog) => {
    setSelectedBlog(blog);
    setView("read");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/auth");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted animate-pulse">Loading...</p>
      </div>
    );
  }

  // ─── READ VIEW ──────────────────────────────────────────────────
  if (view === "read" && selectedBlog) {
    const moodInfo = selectedBlog.mood ? MOODS[selectedBlog.mood] : null;
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => { setView("list"); setSelectedBlog(null); }}
            className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => startEdit(selectedBlog)}
              className="text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
          <article>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-3">{selectedBlog.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted">
                <span>{formatDate(selectedBlog.createdAt)}</span>
                <span>·</span>
                <span>{formatTime(selectedBlog.createdAt)}</span>
                {moodInfo && (
                  <>
                    <span>·</span>
                    <span className={moodInfo.color}>
                      {moodInfo.emoji} {moodInfo.label}
                    </span>
                  </>
                )}
              </div>
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedBlog.tags.map((tag) => (
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
                {selectedBlog.content}
              </ReactMarkdown>
            </div>
          </article>
        </main>
      </div>
    );
  }

  // ─── CREATE / EDIT VIEW ──────────────────────────────────────────
  if (view === "create" || view === "edit") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => { setView("list"); resetForm(); }}
            className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreview(!preview)}
              className={`text-sm px-3 py-1 rounded-md transition-colors ${
                preview
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground border border-border"
              }`}
            >
              {preview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : view === "edit" ? "Update" : "Publish"}
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your thoughts a title..."
            className="w-full text-3xl font-bold bg-transparent border-none placeholder:text-muted/40 mb-4 focus:outline-none"
          />
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted">Mood:</span>
              <div className="flex gap-1">
                {Object.entries(MOODS).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMood(mood === key ? "" : key)}
                    className={`px-2 py-0.5 rounded-md text-xs transition-all ${
                      mood === key
                        ? `${val.color} bg-input-bg ring-1 ring-current`
                        : "text-muted hover:text-foreground"
                    }`}
                    title={val.label}
                  >
                    {val.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-muted whitespace-nowrap">Tags:</span>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="comma separated"
                className="flex-1 bg-transparent border-none text-sm placeholder:text-muted/40 focus:outline-none"
              />
            </div>
          </div>
          <hr className="border-border mb-6" />
          {preview ? (
            <div className="prose min-h-[50vh]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || "*Nothing to preview...*"}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing... (Markdown supported)"
              className="w-full min-h-[50vh] bg-transparent border-none resize-none placeholder:text-muted/30 focus:outline-none text-base leading-relaxed"
            />
          )}
        </main>
      </div>
    );
  }

  // ─── LIST VIEW ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Personal Blog</h1>
          <span className="text-xs text-muted">·</span>
          <span className="text-sm text-muted">{username}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { resetForm(); setView("create"); }}
            className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-md transition-colors"
          >
            + New Entry
          </button>
          <button
            onClick={handleLogout}
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
                  className="group bg-card hover:bg-card-hover border border-border rounded-xl p-5 transition-all cursor-pointer"
                  onClick={() => startRead(blog)}
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
                        onClick={() => handleTogglePin(blog)}
                        className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-input-bg transition-colors"
                        title={blog.pinned ? "Unpin" : "Pin"}
                      >
                        {blog.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                      </button>
                      <button
                        onClick={() => startEdit(blog)}
                        className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-input-bg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(blog._id)}
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
