"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pin, PinOff, Pencil, Trash2 } from "lucide-react";
import { Blog, Profile, MOODS, formatDate, handleLogout } from "@/lib/utils";

const EMPTY_FORM = { displayName: "", location: "", bio: "" };

export default function HomePage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(EMPTY_FORM);
  const [savingProfile, setSavingProfile] = useState(false);
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
      .then((data: Profile | null) => {
        if (data) {
          setProfile(data);
          setProfileForm({
            displayName: data.displayName || "",
            location: data.location || "",
            bio: data.bio || "",
          });
        }
      });
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs(search);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, fetchBlogs]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...data } : data));
        setEditingProfile(false);
      }
    } catch {
      // silent
    } finally {
      setSavingProfile(false);
    }
  };

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
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="pt-14 pb-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl text-ink tracking-tight">
              Personal Blog
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-muted">
              Quiet reflections &amp; unhurried thoughts
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between border-b border-dashed border-border pb-3">
            <span className="text-sm italic text-muted">
              Kept by {profile?.displayName?.trim() || profile?.username || "..."}
            </span>
            <nav className="flex items-center gap-5">
              <Link
                href="/home/new"
                className="font-mono text-xs uppercase tracking-[0.15em] bg-accent hover:bg-accent-hover text-[#fdfbf7] px-4 py-2 rounded-[3px] shadow-[3px_3px_0_rgba(44,37,35,0.15)] hover:-translate-y-[1px] hover:shadow-[4px_5px_0_rgba(44,37,35,0.18)] transition-all"
              >
                + New Entry
              </Link>
              <button
                onClick={() => handleLogout(router)}
                className="font-mono text-xs uppercase tracking-[0.15em] text-faint hover:text-accent transition-colors"
              >
                Sign out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pb-16">
        <div className="grid gap-10 md:grid-cols-[230px_1fr] items-start">
          <aside className="md:sticky md:top-8">
            <div className="bg-card border border-border rounded-[3px] p-6 shadow-[3px_3px_0_rgba(44,37,35,0.05)]">
              {editingProfile ? (
                <div className="space-y-4">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    Edit profile
                  </p>
                  <div>
                    <label className="block font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                      maxLength={60}
                      placeholder="Your name"
                      className="w-full px-2.5 py-2 bg-input-bg border border-input-border rounded-[3px] text-sm placeholder:text-faint/70 focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      maxLength={60}
                      placeholder="Where you write from"
                      className="w-full px-2.5 py-2 bg-input-bg border border-input-border rounded-[3px] text-sm placeholder:text-faint/70 focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted mb-1.5">
                      About
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      maxLength={280}
                      rows={4}
                      placeholder="A line or two about yourself"
                      className="w-full px-2.5 py-2 bg-input-bg border border-input-border rounded-[3px] text-sm resize-none placeholder:text-faint/70 focus:border-accent transition-colors leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="font-mono text-xs uppercase tracking-[0.15em] bg-accent hover:bg-accent-hover text-[#fdfbf7] px-3 py-1.5 rounded-[3px] transition-colors disabled:opacity-50"
                    >
                      {savingProfile ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="font-mono text-xs uppercase tracking-[0.15em] text-faint hover:text-accent transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-3">
                    The Keeper
                  </p>
                  <h2 className="font-heading text-xl leading-snug text-ink break-words">
                    {profile?.displayName?.trim() || profile?.username || "..."}
                  </h2>
                  {profile?.bio && (
                    <p className="mt-3 text-sm italic text-muted leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                  <dl className="mt-5 pt-4 border-t border-dashed border-border space-y-3 font-mono text-xs">
                    <div>
                      <dt className="uppercase tracking-[0.15em] text-faint">Location</dt>
                      <dd className="mt-0.5 text-muted lowercase">
                        {profile?.location || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.15em] text-faint">
                        Journaling since
                      </dt>
                      <dd className="mt-0.5 text-muted">
                        {profile?.joined ? formatDate(profile.joined) : "—"}
                      </dd>
                    </div>
                  </dl>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-faint hover:text-accent transition-colors"
                  >
                    &#9998; Edit profile
                  </button>
                </>
              )}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-8">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries..."
                className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-[3px] font-mono text-sm placeholder:text-faint/70 focus:border-accent transition-colors"
              />
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gold text-2xl mb-4" aria-hidden>
                  &#10086;
                </p>
                <p className="font-heading text-xl italic text-muted mb-2">
                  {search ? "No entries match your search" : "No entries yet"}
                </p>
                <p className="text-sm text-faint">
                  {search
                    ? "Try a different search term"
                    : "Start your first entry to begin reflecting"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {blogs.map((blog) => {
                  const moodInfo = blog.mood ? MOODS[blog.mood] : null;
                  return (
                    <article
                      key={blog._id}
                      className="group relative bg-card hover:bg-card-hover border border-border rounded-[3px] p-6 shadow-[3px_3px_0_rgba(44,37,35,0.05)] hover:-translate-y-[2px] hover:shadow-[4px_6px_0_rgba(44,37,35,0.08)] transition-all cursor-pointer"
                      onClick={() => router.push(`/home/${blog._id}`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-accent mb-2">
                            {blog.pinned && <Pin size={12} aria-label="Pinned" />}
                            {formatDate(blog.updatedAt)}
                          </p>
                          <h2 className="font-heading text-2xl leading-snug text-ink group-hover:text-accent transition-colors mb-2">
                            {blog.title}
                          </h2>
                          <p className="text-muted text-[0.95rem] leading-relaxed line-clamp-2 mb-4">
                            {blog.content.replace(/[#*`>\-\[\]]/g, "").slice(0, 160)}
                            {blog.content.length > 160 ? "..." : ""}
                          </p>
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 font-mono text-xs text-faint">
                            {moodInfo && (
                              <span className={moodInfo.color}>
                                {moodInfo.emoji} {moodInfo.label}
                              </span>
                            )}
                            {moodInfo && blog.tags && blog.tags.length > 0 && (
                              <span aria-hidden>·</span>
                            )}
                            {blog.tags && blog.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {blog.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.5 bg-input-bg border border-input-border rounded-[2px] lowercase"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {blog.tags.length > 3 && (
                                  <span>+{blog.tags.length - 3}</span>
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
                            className="p-1.5 text-faint hover:text-accent rounded-[3px] hover:bg-input-bg transition-colors"
                            title={blog.pinned ? "Unpin" : "Pin"}
                          >
                            {blog.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                          </button>
                          <Link
                            href={`/home/${blog._id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-faint hover:text-accent rounded-[3px] hover:bg-input-bg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(blog._id); }}
                            className="p-1.5 text-faint hover:text-danger rounded-[3px] hover:bg-input-bg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {showDeleteConfirm === blog._id && (
                        <div
                          className="mt-4 pt-4 border-t border-dashed border-border flex items-center gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-sm italic text-muted">
                            Remove this entry from the record?
                          </span>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="ml-auto text-xs font-mono uppercase tracking-wider bg-danger hover:bg-danger-hover text-[#fdfbf7] px-3 py-1.5 rounded-[3px] transition-colors"
                          >
                            Yes, remove
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="text-sm text-muted hover:text-foreground transition-colors"
                          >
                            Keep
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="pb-12 pt-2 text-center">
        <p className="text-gold/60 text-lg mb-2" aria-hidden>
          &#10022;&nbsp;&nbsp;&#10022;&nbsp;&nbsp;&#10022;
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
          A space for your thoughts
        </p>
      </footer>
    </div>
  );
}
