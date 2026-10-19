import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command as CommandIcon, CornerDownLeft, TriangleAlert } from "lucide-react";
import { COMMANDS, matchCommand, type Command } from "@/lib/aether-commands";
import { useCommandRunner } from "@/lib/use-aether-command";

/**
 * Universal AETHER command palette — Cmd/Ctrl+K anywhere.
 * Quick actions filter as you type; destructive/navigation-changing
 * commands ask for confirmation first.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Command | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const run = useCommandRunner();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setPending(null);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COMMANDS.slice(0, 9);
    const exact = matchCommand(q);
    const filtered = COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.patterns.some((p) => p.test(q)),
    );
    if (exact && !filtered.includes(exact)) filtered.unshift(exact);
    return filtered.slice(0, 9);
  }, [query]);

  const execute = (cmd: Command) => {
    if (cmd.confirm && pending?.id !== cmd.id) {
      setPending(cmd);
      return;
    }
    run(cmd);
    setOpen(false);
    setPending(null);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-start justify-center pt-[14vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: -16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-[92vw] max-w-[540px] rounded-2xl border border-white/15 bg-[#0a0d18]/95 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(90,212,255,0.35)] overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/10">
              <CommandIcon size={14} className="text-[#5ad4ff]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPending(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results[0]) execute(results[0]);
                }}
                placeholder="Tell AETHER what to do…"
                className="flex-1 bg-transparent outline-none text-[14px] placeholder-white/35"
              />
              <kbd className="text-[10px] text-white/40 border border-white/15 rounded px-1.5 py-0.5">esc</kbd>
            </div>

            {pending && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-400/10 border-b border-amber-300/20 text-[12px] text-amber-200">
                <TriangleAlert size={13} />
                <span className="flex-1">
                  {pending.label} — sure?
                </span>
                <button
                  onClick={() => execute(pending)}
                  className="px-2.5 py-1 rounded-full bg-amber-300 text-black text-[11px] font-semibold uppercase tracking-wider"
                >
                  Yes
                </button>
                <button
                  onClick={() => setPending(null)}
                  className="px-2.5 py-1 rounded-full border border-white/20 text-[11px] uppercase tracking-wider"
                >
                  No
                </button>
              </div>
            )}

            <div className="max-h-[46vh] overflow-y-auto py-1.5">
              {results.length === 0 && (
                <div className="px-4 py-6 text-center text-[12px] text-white/40">
                  No command matches — ask in the chat instead.
                </div>
              )}
              {results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => execute(c)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition"
                >
                  <span className="flex-1 text-[13.5px]">{c.label}</span>
                  <span className="text-[11px] text-white/40 truncate max-w-[40%]">{c.hint}</span>
                  {c.confirm ? (
                    <span className="text-[10px] uppercase tracking-widest text-amber-300/80">asks first</span>
                  ) : (
                    <CornerDownLeft size={12} className="text-white/30" />
                  )}
                </button>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-white/10 text-[10px] uppercase tracking-widest text-white/35 flex justify-between">
              <span>aether command interface</span>
              <span>⌘K / Ctrl+K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
