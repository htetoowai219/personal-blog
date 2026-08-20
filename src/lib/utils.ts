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

export async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/auth";
}
