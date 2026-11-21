export interface Profile {
  username: string;
  displayName?: string | null;
  bio?: string | null;
  location?: string | null;
  joined?: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MOODS: Record<string, { emoji: string; label: string; color: string }> = {
  reflective: { emoji: "🪞", label: "Reflective", color: "text-[var(--mood-reflect)]" },
  grateful: { emoji: "🙏", label: "Grateful", color: "text-[var(--mood-grateful)]" },
  anxious: { emoji: "🌊", label: "Anxious", color: "text-[var(--mood-anxious)]" },
  calm: { emoji: "🧘", label: "Calm", color: "text-[var(--mood-calm)]" },
  inspired: { emoji: "✨", label: "Inspired", color: "text-[var(--mood-inspired)]" },
  sad: { emoji: "🌧", label: "Sad", color: "text-[var(--mood-sad)]" },
};

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function handleLogout(router: { replace: (href: string) => void }) {
  await fetch("/api/auth/logout", { method: "POST" });
  router.replace("/auth");
}

export function getReadingStats(content: string) {
  const trimmed = content.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars = content.length;
  const minutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  return {
    words,
    chars,
    minutes,
    wordsText: `${words.toLocaleString()} ${words === 1 ? "word" : "words"}`,
    charsText: `${chars.toLocaleString()} ${chars === 1 ? "char" : "chars"}`,
    readTimeText: `~${minutes} min read`,
  };
}
