import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/portfolio/SiteNav";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Amish Kumar" },
      { name: "description", content: "Owner sign-in for Amish Kumar's portfolio." },
      { property: "og:title", content: "Sign in — Amish Kumar" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(path: string | undefined): string {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return "/now/share";
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage({ kind: "info", text: "Check your email to confirm your account, then sign in." });
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: safeRedirect(redirect) });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-8"
        >
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">owner access</div>
          <h1 className="serif italic text-4xl mt-2">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is private — it powers the live location on the Now page.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            {message && (
              <p className={`text-[13px] ${message.kind === "error" ? "text-red-500" : "text-emerald-500"}`}>
                {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-foreground text-background py-2.5 text-sm font-medium uppercase tracking-widest disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setMessage(null);
            }}
            className="mt-4 text-[12px] text-muted-foreground hover:text-foreground transition"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have one? Sign in"}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
