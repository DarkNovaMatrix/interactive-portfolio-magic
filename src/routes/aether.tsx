import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, ArrowLeft, Zap } from "lucide-react";
import { aetherChat } from "@/lib/aether-brain.functions";
import { useTheme } from "@/lib/theme";
import { AetherAvatar3D, type AetherForm, type AetherMood } from "@/components/aether/AetherAvatar3D";

export const Route = createFileRoute("/aether")({
  head: () => ({
    meta: [
      { title: "AETHER — Amish Kumar's AI" },
      {
        name: "description",
        content:
          "AETHER is Amish Kumar's autonomous AI companion. Ask anything, watch it think, and see it transform between realistic forms in real time.",
      },
      { property: "og:title", content: "AETHER — Amish Kumar's AI" },
      { property: "og:description", content: "The cockpit of a JARVIS-style AI living inside a portfolio." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AetherCockpit,
});

type Msg = { role: "user" | "assistant"; content: string; ts: number };

const FORMS: AetherForm[] = ["orb", "rocket", "satellite", "drone", "crystal", "brain"];
const MOODS: AetherMood[] = ["curious", "focused", "excited", "playful", "thoughtful", "proud", "calm"];

const NAV_ALLOWED = new Set(["/", "/about", "/projects", "/cosmos", "/links", "/aether"]);

function applyMarkers(
  markers: string[],
  ctx: {
    navigate: (to: string) => void;
    theme: "dark" | "light";
    toggleTheme: () => void;
    setForm: (f: AetherForm) => void;
    setMood: (m: AetherMood) => void;
  },
) {
  for (const raw of markers) {
    const [k, v] = raw.split(":", 2).map((s) => s?.trim());
    if (!k || !v) continue;
    if (k === "nav" && NAV_ALLOWED.has(v)) ctx.navigate(v);
    else if (k === "theme") {
      if (v === "toggle") ctx.toggleTheme();
      else if (v === "dark" && ctx.theme !== "dark") ctx.toggleTheme();
      else if (v === "light" && ctx.theme !== "light") ctx.toggleTheme();
    } else if (k === "form" && FORMS.includes(v as AetherForm)) ctx.setForm(v as AetherForm);
    else if (k === "mood" && MOODS.includes(v as AetherMood)) ctx.setMood(v as AetherMood);
  }
}

function RichText({ text }: { text: string }) {
  const parts = useMemo(() => {
    const out: Array<{ kind: "code" | "text"; lang?: string; body: string }> = [];
    const re = /```(\w+)?\n?([\s\S]*?)```/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ kind: "text", body: text.slice(last, m.index) });
      out.push({ kind: "code", lang: m[1] || "", body: m[2].trimEnd() });
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ kind: "text", body: text.slice(last) });
    if (!out.length) out.push({ kind: "text", body: text });
    return out;
  }, [text]);
  return (
    <div className="space-y-2 text-[14px] leading-relaxed">
      {parts.map((p, i) =>
        p.kind === "code" ? (
          <pre
            key={i}
            className="rounded-md bg-black/70 border border-[#5ad4ff]/25 text-[#c5e5ff] p-3 text-[12.5px] overflow-x-auto font-mono"
          >
            {p.lang && <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{p.lang}</div>}
            <code>{p.body}</code>
          </pre>
        ) : (
          <p key={i} className="whitespace-pre-wrap">
            {p.body.split(/(`[^`]+`)/g).map((seg, j) =>
              seg.startsWith("`") && seg.endsWith("`") ? (
                <code key={j} className="px-1 py-0.5 rounded bg-white/10 text-[#c5e5ff] font-mono text-[12px]">
                  {seg.slice(1, -1)}
                </code>
              ) : (
                <span key={j}>{seg}</span>
              ),
            )}
          </p>
        ),
      )}
    </div>
  );
}

function AetherCockpit() {
  const navigate = useNavigate();
  const chat = useServerFn(aetherChat);
  const { theme, toggle } = useTheme();

  const [form, setForm] = useState<AetherForm>("orb");
  const [mood, setMood] = useState<AetherMood>("curious");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Welcome to my cockpit. This is where I live between the pixels of Amish's site. Type anything — questions, code requests, commands like *transform into a satellite* or *open cosmos*. I'll think out loud between your prompts.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [thought, setThought] = useState<string>("initializing…");
  const [uptime, setUptime] = useState(0);
  const startedAt = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setUptime(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  // Autonomous "think" loop — every ~22–35s the bot generates its own thought.
  const scheduleThink = useCallback(() => {
    const delay = 22000 + Math.random() * 12000;
    thinkTimer.current = setTimeout(async () => {
      try {
        const res = await chat({
          data: { messages: [], mode: "think", route: "/aether", form, mood },
        });
        const t = (res?.text ?? "").trim();
        if (t) setThought(t);
        applyMarkers(res?.markers ?? [], {
          navigate: (to) => navigate({ to: to as any }),
          theme,
          toggleTheme: toggle,
          setForm,
          setMood,
        });
      } catch {}
      scheduleThink();
    }, delay);
  }, [chat, form, mood, navigate, theme, toggle]);

  useEffect(() => {
    // first thought quickly, then loop
    const first = setTimeout(async () => {
      try {
        const res = await chat({
          data: { messages: [], mode: "think", route: "/aether", form, mood },
        });
        const t = (res?.text ?? "").trim();
        if (t) setThought(t);
      } catch {}
      scheduleThink();
    }, 3500);
    return () => {
      clearTimeout(first);
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setInput("");
      const next: Msg[] = [...messages, { role: "user", content: trimmed, ts: Date.now() }];
      setMessages(next);
      setBusy(true);
      try {
        const res = await chat({
          data: {
            messages: next.map((m) => ({ role: m.role, content: m.content })),
            mode: "chat",
            route: "/aether",
            form,
            mood,
          },
        });
        setMessages((prev) => [...prev, { role: "assistant", content: res?.text ?? "…", ts: Date.now() }]);
        applyMarkers(res?.markers ?? [], {
          navigate: (to) => navigate({ to: to as any }),
          theme,
          toggleTheme: toggle,
          setForm,
          setMood,
        });
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Signal dropped. Try again.", ts: Date.now() },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, chat, form, messages, mood, navigate, theme, toggle],
  );

  const knowledge = [
    { label: "Dravik", desc: "AI travel platform" },
    { label: "Nirbhay AI", desc: "Emergency response AI" },
    { label: "SmartAid", desc: "Medical triage" },
    { label: "OptiTask", desc: "Productivity engine" },
    { label: "SRM Ramapuram", desc: "B.Tech CS · 2024" },
  ];

  const uptimeStr = `${String(Math.floor(uptime / 60)).padStart(2, "0")}:${String(uptime % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 bg-[#03060d] text-white overflow-hidden font-sans">
      {/* animated grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#5ad4ff22 1px, transparent 1px), linear-gradient(90deg, #5ad4ff22 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 55%, black 30%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(90,212,255,0.18), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,120,60,0.10), transparent 50%)",
        }}
      />

      {/* top bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link
          to="/"
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white"
        >
          <ArrowLeft size={14} /> back to Amish
        </Link>
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.25em]">
          <div className="text-white/50">
            <span className="text-[#5ad4ff]">●</span> aether/core
          </div>
          <div className="text-white/50">uptime {uptimeStr}</div>
          <div className="text-white/50">v1.0</div>
        </div>
      </div>

      {/* Layout: left status | center avatar | right chat */}
      <div className="absolute inset-0 pt-16 pb-4 grid grid-cols-1 lg:grid-cols-[260px_1fr_400px] gap-4 px-4 z-10">
        {/* Left column: status */}
        <div className="hidden lg:flex flex-col gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur p-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#5ad4ff] mb-2">System</div>
            <div className="grid grid-cols-2 gap-y-1 text-[12px]">
              <span className="text-white/50">form</span>
              <span>{form}</span>
              <span className="text-white/50">mood</span>
              <span>{mood}</span>
              <span className="text-white/50">route</span>
              <span>/aether</span>
              <span className="text-white/50">brain</span>
              <span>gemini-3-flash</span>
              <span className="text-white/50">theme</span>
              <span>{theme}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur p-4 flex-1 overflow-hidden flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#5ad4ff] mb-2">Manual override</div>
            <div className="mb-3">
              <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Form</div>
              <div className="flex flex-wrap gap-1">
                {FORMS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setForm(f)}
                    className={`text-[10px] px-2 py-1 rounded border transition ${
                      form === f
                        ? "bg-[#5ad4ff]/20 border-[#5ad4ff] text-white"
                        : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Mood</div>
              <div className="flex flex-wrap gap-1">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`text-[10px] px-2 py-1 rounded border transition ${
                      mood === m
                        ? "bg-[#5ad4ff]/20 border-[#5ad4ff] text-white"
                        : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: avatar + thought */}
        <div className="relative flex flex-col items-center justify-center min-h-0">
          <div className="relative">
            <div className="absolute -inset-16 rounded-full bg-[#5ad4ff]/10 blur-3xl animate-pulse pointer-events-none" />
            {/* ring */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-[420px] h-[420px] -translate-x-[150px] -translate-y-[150px] opacity-70 pointer-events-none"
            >
              <circle
                cx="100" cy="100" r="96"
                fill="none" stroke="#5ad4ff" strokeOpacity="0.25" strokeWidth="0.5"
                strokeDasharray="2 4"
              />
              <circle
                cx="100" cy="100" r="88"
                fill="none" stroke="#5ad4ff" strokeOpacity="0.15" strokeWidth="0.4"
              >
                <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="60s" repeatCount="indefinite" />
              </circle>
            </svg>
            <div className="relative">
              <AetherAvatar3D form={form} mood={mood} size={280} variant="large" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={thought}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-6 max-w-xl text-center px-4"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#5ad4ff] flex items-center justify-center gap-1 mb-2">
                <Zap size={10} /> thinking
              </div>
              <div className="serif italic text-lg text-white/90 leading-relaxed">{thought}</div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl">
            {knowledge.map((k) => (
              <button
                key={k.label}
                onClick={() => send(`Tell me about ${k.label}.`)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-[#5ad4ff]/40 hover:bg-[#5ad4ff]/5 transition"
              >
                <span className="text-[#5ad4ff]">◉</span> {k.label}{" "}
                <span className="text-white/40">· {k.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: chat */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden min-h-0">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#5ad4ff]">terminal</div>
            <div className="text-[10px] text-white/40">enter to send</div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-xl rounded-br-md bg-[#5ad4ff]/15 border border-[#5ad4ff]/30 px-3 py-2 text-[13.5px]"
                      : "max-w-[92%] rounded-xl rounded-bl-md bg-white/5 border border-white/10 px-3 py-2.5"
                  }
                >
                  {m.role === "assistant" ? <RichText text={m.content} /> : <span>{m.content}</span>}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-xl rounded-bl-md bg-white/5 border border-white/10 px-3 py-2.5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ad4ff] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ad4ff] animate-pulse [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ad4ff] animate-pulse [animation-delay:240ms]" />
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
            className="border-t border-white/10 px-3 py-2.5 flex items-center gap-2"
          >
            <span className="text-[#5ad4ff] font-mono text-[13px] pl-1">›</span>
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="speak to aether…"
              className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder-white/35 font-mono"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              className="rounded-full bg-[#5ad4ff] text-[#08131c] w-8 h-8 flex items-center justify-center disabled:opacity-40 hover:scale-105 transition"
              aria-label="Send"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
