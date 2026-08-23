"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MOODS, handleLogout } from "@/lib/utils";

export default function NewEntryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, mood, tags }),
      });
      if (res.ok) {
        const newBlog = await res.json();
        router.push(`/home/${newBlog._id}`);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-dashed border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="font-mono text-xs uppercase tracking-[0.15em] text-muted hover:text-accent transition-colors"
          >
            &larr; Discard
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreview(!preview)}
              className={`font-mono text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-[3px] border transition-colors ${
                preview
                  ? "bg-card-hover text-accent border-border"
                  : "text-muted hover:text-accent border-border"
              }`}
            >
              {preview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className="font-mono text-xs uppercase tracking-[0.15em] bg-accent hover:bg-accent-hover text-[#fdfbf7] px-4 py-1.5 rounded-[3px] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Publish"}
            </button>
            <button
              onClick={() => handleLogout(router)}
              className="font-mono text-xs uppercase tracking-[0.15em] text-faint hover:text-accent transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your thoughts a title..."
          className="w-full font-heading text-3xl md:text-4xl text-ink bg-transparent border-b border-dashed border-border focus:border-accent pb-4 mb-6 placeholder:text-faint/60 transition-colors"
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted">Mood</span>
            <div className="flex gap-1">
              {Object.entries(MOODS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMood(mood === key ? "" : key)}
                  className={`px-1.5 py-1 rounded-[3px] text-sm transition-all ${
                    mood === key
                      ? `${val.color} bg-input-bg ring-1 ring-current`
                      : "opacity-50 hover:opacity-100"
                  }`}
                  title={val.label}
                >
                  {val.emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-1 min-w-[220px]">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted whitespace-nowrap">Tags</span>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="comma separated"
              className="flex-1 bg-transparent border-b border-dashed border-border focus:border-accent pb-1 font-mono text-sm placeholder:text-faint/60 lowercase transition-colors"
            />
          </div>
        </div>
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
            className="w-full min-h-[50vh] bg-transparent border-none resize-none placeholder:text-faint/60 focus:outline-none text-[1.0625rem] leading-loose"
          />
        )}
      </main>
    </div>
  );
}
