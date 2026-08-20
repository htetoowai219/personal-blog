"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
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
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link
          href="/home"
          className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Back
        </Link>
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
            {saving ? "Saving..." : "Publish"}
          </button>
          <button
            onClick={() => handleLogout()}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Sign out
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
