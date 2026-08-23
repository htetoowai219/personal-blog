"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((res) => {
      if (res.ok) router.replace("/home");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.replace("/home");
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl text-ink tracking-tight mb-3">
            Personal Blog
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            A quiet space for self-reflection
          </p>
        </div>

        <div className="bg-card border border-border rounded-[3px] p-8 shadow-[4px_4px_0_rgba(44,37,35,0.06)]">
          <div className="flex mb-7 border-b border-border">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-2.5 font-mono text-xs uppercase tracking-[0.15em] transition-colors border-b-2 -mb-px ${
                isLogin
                  ? "border-accent text-accent"
                  : "border-transparent text-faint hover:text-muted"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-2.5 font-mono text-xs uppercase tracking-[0.15em] transition-colors border-b-2 -mb-px ${
                !isLogin
                  ? "border-accent text-accent"
                  : "border-transparent text-faint hover:text-muted"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs uppercase tracking-[0.15em] text-muted mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 bg-input-bg border border-input-border rounded-[3px] text-foreground placeholder:text-faint/70 focus:border-accent transition-colors"
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-[0.15em] text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-input-bg border border-input-border rounded-[3px] text-foreground placeholder:text-faint/70 focus:border-accent transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p className="text-sm italic text-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-[#fdfbf7] font-medium rounded-[3px] tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-gold text-lg" aria-hidden>
          &#10086;
        </p>
      </div>
    </div>
  );
}
