import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Send, ChevronDown, Sparkles, Volume2, VolumeX } from "lucide-react";
import { aetherChat } from "@/lib/aether-brain.functions";
import { useTheme } from "@/lib/theme";
import { matchCommand, type Command } from "@/lib/aether-commands";
import { useCommandRunner } from "@/lib/use-aether-command";
import { AetherAvatar3D, type AetherForm, type AetherMood } from "./AetherAvatar3D";
import { CommandPalette } from "./CommandPalette";

export type ChatMsg = { role: "user" | "assistant"; content: string; ts: number };

const NAV_ALLOWED = new Set(["/", "/about", "/projects", "/cosmos", "/links", "/aether", "/now"]);

/** Parse marker tokens like "nav:/projects" into typed actions and apply them. */
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
    } else if (k === "form") {
      if (["orb", "rocket", "satellite", "drone", "crystal", "brain"].includes(v)) {
        ctx.setForm(v as AetherForm);
      }
    } else if (k === "mood") {
      if (["curious", "focused", "excited", "playful", "thoughtful", "proud", "calm"].includes(v)) {
        ctx.setMood(v as AetherMood);
      }
    }
  }
}

/** Render text with support for ```code``` fenced blocks and inline `code`. */
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
    <div className="space-y-2 text-[13.5px] leading-relaxed">
      {parts.map((p, i) =>
        p.kind === "code" ? (
          <pre
            key={i}
            className="rounded-md bg-black/60 border border-white/10 text-[#c5e5ff] p-2.5 text-[12px] overflow-x-auto font-mono"
          >
            {p.lang && (
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{p.lang}</div>
            )}
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

/**
 * AETHER site-wide HUD:
 * - Fixed bottom-right holographic core (click to open chat)
 * - Full chat panel with realistic transformable avatar, streaming replies,
 *   inline code rendering, and site-command actions.
 */
export function AetherCore() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { theme, toggle } = useTheme();
  const chat = useServerFn(aetherChat);
  const runCommand = useCommandRunner();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState(false);
  const [form, setForm] = useState<AetherForm>("orb");
  const [mood, setMood] = useState<AetherMood>("curious");
  const [input, setInput] = useState("");
  const [pendingCmd, setPendingCmd] = useState<Command | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      role: "assistant",
      content:
        "AETHER online. I know Amish inside-out — his projects, live coding stats, this whole site. Ask me anything, or tell me to *open cosmos*, *go dark*, *write code*, *transform into a rocket*.",
      ts: Date.now(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Browser TTS — cleaned of markdown/code fences before speaking.
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const clean = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[\[[^\]]+\]\]/g, "")
      .replace(/[*_#>]/g, "")
      .trim();
    if (!clean) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean.slice(0, 500));
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find((v) => /Daniel|Google UK English Male|Microsoft Guy|Alex/i.test(v.name)) ??
      voices.find((v) => v.lang?.startsWith("en"));
    if (pick) u.voice = pick;
    u.rate = 1.05;
    u.pitch = 0.95;
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    if (open) {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [open, messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setInput("");
      const next: ChatMsg[] = [...messages, { role: "user", content: trimmed, ts: Date.now() }];
      setMessages(next);

      // Fast-path: imperative requests ("open dravik", "take off") run as
      // commands instead of going to the AI brain.
      const cmd = matchCommand(trimmed);
      if (cmd) {
        if (cmd.confirm) {
          setPendingCmd(cmd);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Ready to **${cmd.label}** — confirm below.`, ts: Date.now() },
          ]);
        } else {
          runCommand(cmd);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `On it — ${cmd.label.toLowerCase()}.`, ts: Date.now() },
          ]);
        }
        return;
      }

      setBusy(true);
      try {
        const res = await chat({
          data: {
            messages: next.map((m) => ({ role: m.role, content: m.content })),
            mode: "chat",
            route: routerState.location.pathname,
            form,
            mood,
          },
        });
        const reply = res?.text ?? "…";
        setMessages((prev) => [...prev, { role: "assistant", content: reply, ts: Date.now() }]);
        if (voice) speak(reply);
        applyMarkers(res?.markers ?? [], {
          navigate: (to) => navigate({ to: to as any }),
          theme,
          toggleTheme: toggle,
          setForm,
          setMood,
        });
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Signal dropped. Try that again.", ts: Date.now() },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, chat, form, messages, mood, navigate, routerState.location.pathname, theme, toggle, voice, speak],
  );

  // Hide the HUD on the /aether cockpit page — the bot has its own house there.
  if (routerState.location.pathname === "/aether") return null;

  return (
    <>
      <CommandPalette />
      {/* Floating core */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="core"
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-[95] group"
            aria-label="Open AETHER"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#5ad4ff]/20 blur-2xl animate-pulse" />
              <div className="relative w-[76px] h-[76px] rounded-full border border-white/20 bg-[#0a0d18]/85 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(90,212,255,0.5)] overflow-hidden flex items-center justify-center">
                <AetherAvatar3D form={form} mood={mood} size={76} />
              </div>
              <div className="absolute -top-1 -right-1 rounded-full bg-[#5ad4ff] w-2.5 h-2.5 shadow-[0_0_10px_#5ad4ff] animate-pulse" />
            </div>
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-[10px] uppercase tracking-widest text-white bg-black/70 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
              ask aether
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed bottom-5 right-5 z-[95] w-[92vw] max-w-[420px] h-[min(640px,80vh)] rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#0a0d18]/95 to-[#050710]/95 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(90,212,255,0.35)] flex flex-col text-white"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-2.5 border-b border-white/10">
              <div className="rounded-full bg-black/40 border border-white/10 overflow-hidden">
                <AetherAvatar3D form={form} mood={mood} size={44} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#5ad4ff]">Aether · online</div>
                <div className="text-[11px] text-white/50 truncate">
                  form: {form} · mood: {mood}
                </div>
              </div>
              <button
                onClick={() => {
                  setVoice((v) => {
                    if (v && typeof window !== "undefined") window.speechSynthesis?.cancel();
                    return !v;
                  });
                }}
                className={`rounded-md p-1.5 border transition ${voice ? "border-[#5ad4ff] text-[#5ad4ff] bg-[#5ad4ff]/10" : "border-white/10 text-white/60 hover:text-white"}`}
                title={voice ? "Mute voice" : "Enable voice"}
                aria-label="Toggle voice"
              >
                {voice ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button
                onClick={() => navigate({ to: "/aether" })}
                className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white px-2 py-1 rounded border border-white/10"
                title="Open cockpit"
              >
                cockpit
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-white/60 hover:text-white hover:bg-white/10"
                aria-label="Close"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-md bg-[#5ad4ff]/15 border border-[#5ad4ff]/30 text-white px-3 py-2 text-[13.5px]"
                        : "max-w-[92%] rounded-2xl rounded-bl-md bg-white/5 border border-white/10 px-3 py-2.5"
                    }
                  >
                    {m.role === "assistant" ? <RichText text={m.content} /> : <span>{m.content}</span>}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-white/5 border border-white/10 px-3 py-2.5 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5ad4ff] animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5ad4ff] animate-pulse [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5ad4ff] animate-pulse [animation-delay:240ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Command confirmation chip */}
            {pendingCmd && (
              <div className="px-3 pb-2">
                <div className="flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-[12px] text-amber-200">
                  <span className="flex-1">{pendingCmd.label}?</span>
                  <button
                    onClick={() => {
                      runCommand(pendingCmd);
                      setMessages((prev) => [
                        ...prev,
                        { role: "assistant", content: `Done — ${pendingCmd.label.toLowerCase()}.`, ts: Date.now() },
                      ]);
                      setPendingCmd(null);
                    }}
                    className="px-2.5 py-1 rounded-full bg-amber-300 text-black text-[11px] font-semibold uppercase tracking-wider"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      setMessages((prev) => [
                        ...prev,
                        { role: "assistant", content: "Cancelled. Staying put.", ts: Date.now() },
                      ]);
                      setPendingCmd(null);
                    }}
                    className="px-2.5 py-1 rounded-full border border-white/20 text-[11px] uppercase tracking-wider text-white/70"
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {[
                  "Tell me about Dravik",
                  "Open the cosmos",
                  "Write a quick React hook",
                  "Transform into a rocket",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] px-2 py-1 rounded-full border border-white/15 text-white/75 hover:bg-white/10 transition"
                  >
                    <Sparkles size={10} className="inline mr-1 opacity-70" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(e) => { e.preventDefault(); void send(input); }}
              className="border-t border-white/10 px-3 py-2.5 flex items-center gap-2"
            >
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AETHER anything…"
                className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder-white/35"
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
