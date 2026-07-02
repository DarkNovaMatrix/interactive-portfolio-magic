import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

/**
 * EnvBot — a small floating companion that reacts to the environment:
 * cursor position (eyes track), scroll velocity (wobble), theme (moon/sun mood),
 * time of day (greeting), idle time (yawns), and section context (via [data-bot-hint]).
 */
export function EnvBot() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [mood, setMood] = useState<"idle" | "happy" | "sleepy" | "spin">("idle");

  // eye tracking
  const ex = useMotionValue(0);
  const ey = useMotionValue(0);
  const sx = useSpring(ex, { stiffness: 200, damping: 20 });
  const sy = useSpring(ey, { stiffness: 200, damping: 20 });

  // wobble on scroll
  const wobble = useMotionValue(0);
  const wobbleS = useSpring(wobble, { stiffness: 120, damping: 12 });

  const botRef = useRef<HTMLDivElement>(null);
  const lastMove = useRef(Date.now());
  const lastScroll = useRef({ y: 0, t: Date.now() });

  useEffect(() => setMounted(true), []);

  // greet based on time of day, once
  useEffect(() => {
    if (!mounted) return;
    const h = new Date().getHours();
    const greet =
      h < 5 ? "Burning the midnight oil?" :
      h < 12 ? "Good morning — coffee first." :
      h < 17 ? "Afternoon. Poke around." :
      h < 21 ? "Evening. Best time to design." :
      "Late night sessions — my favourite.";
    setMessage(greet);
    setOpen(true);
    const t = setTimeout(() => setOpen(false), 4200);
    return () => clearTimeout(t);
  }, [mounted]);

  // cursor tracking
  useEffect(() => {
    function onMove(e: MouseEvent) {
      lastMove.current = Date.now();
      if (mood === "sleepy") setMood("idle");
      const rect = botRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const max = 4;
      ex.set((dx / dist) * max);
      ey.set((dy / dist) * max);

      // hover hints
      const t = e.target as HTMLElement;
      const hint = t.closest<HTMLElement>("[data-bot-hint]")?.dataset.botHint;
      if (hint && !open) {
        setMessage(hint);
        setOpen(true);
      }
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [ex, ey, mood, open]);

  // scroll velocity → wobble
  useEffect(() => {
    function onScroll() {
      const now = Date.now();
      const dy = window.scrollY - lastScroll.current.y;
      const dt = Math.max(1, now - lastScroll.current.t);
      const v = dy / dt;
      lastScroll.current = { y: window.scrollY, t: now };
      wobble.set(Math.max(-15, Math.min(15, v * 40)));
      setTimeout(() => wobble.set(0), 120);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [wobble]);

  // idle → sleepy
  useEffect(() => {
    const iv = setInterval(() => {
      if (Date.now() - lastMove.current > 12000 && mood !== "sleepy") {
        setMood("sleepy");
        setMessage("Zzz… tap me.");
        setOpen(true);
        setTimeout(() => setOpen(false), 3000);
      }
    }, 4000);
    return () => clearInterval(iv);
  }, [mood]);

  function onClick() {
    setMood("spin");
    const lines = [
      theme === "dark" ? "Dark mode — I see better in here." : "Light mode — squint-friendly.",
      "Try hovering the project cards.",
      "The cursor is a real dot, promise.",
      "Scroll fast, I'll wobble.",
      "Amish built me in an afternoon.",
    ];
    setMessage(lines[Math.floor(Math.random() * lines.length)]);
    setOpen(true);
    setTimeout(() => setMood("happy"), 600);
    setTimeout(() => setOpen(false), 3500);
  }

  if (!mounted) return null;

  return (
    <motion.div
      ref={botRef}
      drag
      dragMomentum={false}
      dragElastic={0.15}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      style={{ rotate: wobbleS }}
      className="fixed bottom-6 right-6 z-[90] select-none cursor-grab active:cursor-grabbing"
    >
      <AnimatePresence>
        {open && message && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-3 w-56 bg-ink text-paper serif italic text-lg px-4 py-3 rounded-lg shadow-xl leading-snug"
          >
            {message}
            <span className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-ink" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={mood === "spin" ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.6 }}
        className="relative h-16 w-16 rounded-full bg-accent grid place-items-center shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)] border-2 border-ink"
        aria-label="Ami — your guide"
      >
        {/* face */}
        <div className="relative h-10 w-10">
          {/* eyes */}
          <motion.div
            style={{ x: sx, y: sy }}
            className="absolute inset-0 flex items-center justify-between px-1"
          >
            <Eye sleepy={mood === "sleepy"} />
            <Eye sleepy={mood === "sleepy"} />
          </motion.div>
          {/* mouth */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0.5">
            {mood === "sleepy" ? (
              <div className="h-0.5 w-4 bg-ink rounded-full" />
            ) : mood === "happy" || mood === "spin" ? (
              <div className="h-2 w-4 border-b-2 border-l-2 border-r-2 border-ink rounded-b-full" />
            ) : (
              <div className="h-1 w-3 bg-ink rounded-full" />
            )}
          </div>
        </div>

        {/* mode chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle();
            setMessage(theme === "dark" ? "Lights on." : "Lights off.");
            setOpen(true);
            setTimeout(() => setOpen(false), 2000);
          }}
          aria-label="Toggle theme"
          className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-paper text-ink text-[11px] grid place-items-center border border-ink hover:scale-110 transition-transform"
        >
          {theme === "dark" ? "☾" : "☀"}
        </button>
      </motion.button>
    </motion.div>
  );
}

function Eye({ sleepy }: { sleepy: boolean }) {
  if (sleepy) return <div className="h-0.5 w-2.5 bg-ink rounded-full" />;
  return <div className="h-2.5 w-2.5 rounded-full bg-ink" />;
}
