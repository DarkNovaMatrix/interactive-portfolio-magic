import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useAether, type Form } from "@/lib/aether-state";
import { useTheme } from "@/lib/theme";

/**
 * AETHER — an autonomous shape-shifting companion.
 * Roams the viewport, tracks the cursor, shifts form based on emotion,
 * whispers ambient thoughts, and reacts to scroll, sections, and idle time.
 */
export function Aether() {
  const { state, say, shift, feel, nudge, noteSection, noteInteraction } = useAether();
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);

  // roaming position (viewport coords), sprung
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 40, damping: 18, mass: 1.2 });
  const sy = useSpring(ry, { stiffness: 40, damping: 18, mass: 1.2 });

  const cursor = useRef({ x: 0, y: 0, moving: false, movedAt: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const w = window.innerWidth;
    const h = window.innerHeight;
    rx.set(w - 140);
    ry.set(h - 160);
    target.current = { x: w - 140, y: h - 160 };
    // greeting
    const h24 = new Date().getHours();
    const returning = state.memory.visits > 1;
    const greet = returning
      ? `Back again. Visit №${state.memory.visits}.`
      : h24 < 5 ? "You're up late. So am I."
      : h24 < 12 ? "Morning. I'm AETHER — I live here."
      : h24 < 17 ? "Hey. I've been exploring while you were away."
      : h24 < 21 ? "Evening light suits this place."
      : "Late session. My favourite time.";
    setTimeout(() => say(greet, 5000), 900);
  }, []);

  // cursor tracking
  useEffect(() => {
    function onMove(e: MouseEvent) {
      cursor.current = { x: e.clientX, y: e.clientY, moving: true, movedAt: Date.now() };
      noteInteraction();
      // hover hints from decorated elements
      const t = e.target as HTMLElement;
      const el = t.closest<HTMLElement>("[data-aether-hint]");
      if (el?.dataset.aetherHint) {
        say(el.dataset.aetherHint, 3000);
        nudge({ curiosity: 2 });
      }
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [noteInteraction, nudge, say]);

  // scroll → excitement
  useEffect(() => {
    let last = window.scrollY;
    let lastT = Date.now();
    function onScroll() {
      const dy = Math.abs(window.scrollY - last);
      const dt = Math.max(1, Date.now() - lastT);
      const v = dy / dt;
      last = window.scrollY;
      lastT = Date.now();
      noteInteraction();
      if (v > 3) nudge({ playfulness: 1, energy: 1 });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [noteInteraction, nudge]);

  // watch sections labeled [data-aether-section="Name"]
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-aether-section]"));
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.4) {
            const name = (e.target as HTMLElement).dataset.aetherSection!;
            if (!state.memory.sectionsSeen.includes(name)) {
              noteSection(name);
              say(`New: ${name}. I'll take notes.`, 3200);
              nudge({ curiosity: 4, happiness: 2 });
              shift(name.toLowerCase().includes("work") ? "cube" : "constellation");
            }
          }
        }
      },
      { threshold: [0.4, 0.7] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [noteSection, nudge, say, shift, state.memory.sectionsSeen]);

  // roaming loop: pick a new target every few seconds, drift toward cursor when playful
  useEffect(() => {
    const iv = setInterval(() => {
      if (dragging) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const emo = state.emotion;
      const c = cursor.current;
      const cursorFresh = Date.now() - c.movedAt < 1500;

      let tx: number;
      let ty: number;

      if (emo === "sleepy") {
        tx = w - 130 + (Math.random() - 0.5) * 20;
        ty = h - 130 + (Math.random() - 0.5) * 20;
      } else if (emo === "playful" && cursorFresh) {
        // chase cursor with offset
        const angle = Math.random() * Math.PI * 2;
        tx = c.x + Math.cos(angle) * 90;
        ty = c.y + Math.sin(angle) * 90;
      } else if (emo === "excited") {
        tx = Math.random() * (w - 160) + 80;
        ty = Math.random() * (h * 0.6) + 80;
      } else if (emo === "focused" && cursorFresh) {
        // hover near cursor, above
        tx = c.x + 70;
        ty = Math.max(60, c.y - 100);
      } else {
        // curious drift
        tx = Math.random() * (w - 200) + 100;
        ty = Math.random() * (h - 240) + 120;
      }

      tx = Math.max(60, Math.min(w - 80, tx));
      ty = Math.max(60, Math.min(h - 80, ty));
      target.current = { x: tx, y: ty };
      rx.set(tx);
      ry.set(ty);
    }, 3800);
    return () => clearInterval(iv);
  }, [dragging, rx, ry, state.emotion]);

  function onClick() {
    noteInteraction();
    nudge({ happiness: 6, playfulness: 4, energy: 5 });
    feel("excited");
    const forms: Form[] = ["orb", "cube", "blob", "constellation", "arrow", "spark"];
    shift(forms[Math.floor(Math.random() * forms.length)]);
    const lines = [
      "You pressed me. Bold.",
      `Mood: ${state.emotion}. Adjusting.`,
      `I've seen ${state.memory.sectionsSeen.length || "no"} sections so far.`,
      "Try scrolling fast — I like the wind.",
      theme === "dark" ? "Dim world. I glow better." : "Bright world. I squint less.",
    ];
    say(lines[Math.floor(Math.random() * lines.length)], 3600);
  }

  if (!mounted) return null;

  const emotionColor: Record<string, string> = {
    curious: "oklch(0.75 0.18 55)",
    happy: "oklch(0.78 0.16 90)",
    excited: "oklch(0.72 0.22 25)",
    focused: "oklch(0.7 0.15 220)",
    sleepy: "oklch(0.55 0.05 260)",
    playful: "oklch(0.78 0.2 340)",
    thoughtful: "oklch(0.65 0.1 200)",
    surprised: "oklch(0.85 0.2 60)",
    proud: "oklch(0.7 0.2 40)",
    shy: "oklch(0.75 0.08 320)",
  };
  const color = emotionColor[state.emotion] ?? "var(--color-accent)";

  return (
    <motion.div
      ref={rootRef}
      style={{ x: sx, y: sy, scale: state.scale }}
      className="fixed left-0 top-0 z-[95] pointer-events-none"
    >
      {/* speech */}
      <AnimatePresence>
        {state.message && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full left-1/2 -top-4 w-[220px]"
          >
            <div className="serif italic text-base bg-ink text-paper px-3 py-2 rounded-xl leading-snug shadow-2xl text-center">
              {state.message}
              <div className="text-[10px] not-italic tracking-widest uppercase opacity-50 mt-1 font-sans">
                aether · {state.emotion}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* body */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={(_, info) => {
          setDragging(false);
          rx.set(rx.get() + info.offset.x);
          ry.set(ry.get() + info.offset.y);
        }}
        onClick={onClick}
        onDoubleClick={() => {
          toggle();
          say(theme === "dark" ? "Let there be light." : "Dimming the room.", 2200);
        }}
        whileHover={{ scale: 1.1 }}
        className="pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
        aria-label="AETHER — autonomous companion"
      >
        <div
          className="relative"
          style={{
            filter: `drop-shadow(0 0 22px ${color}) drop-shadow(0 6px 18px rgba(0,0,0,0.35))`,
          }}
        >
          <FormSVG form={state.form} color={color} emotion={state.emotion} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- shape-shifting SVG ---------- */

function FormSVG({ form, color, emotion }: { form: Form; color: string; emotion: string }) {
  const size = 72;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="agrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="70%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="alin" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="oklch(0.15 0 0)" />
        </linearGradient>
      </defs>

      {/* aura */}
      <motion.circle
        cx="50" cy="50" r="48" fill="url(#agrad)"
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      <AnimatePresence mode="wait">
        {form === "orb" && (
          <motion.g key="orb" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
            <circle cx="50" cy="50" r="20" fill="url(#alin)" />
            <circle cx="44" cy="44" r="5" fill={color} opacity="0.9" />
            <Eyes emotion={emotion} />
          </motion.g>
        )}
        {form === "cube" && (
          <motion.g key="cube" initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 30 }} style={{ transformOrigin: "50px 50px" }}>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "50px 50px" }}
            >
              <rect x="34" y="34" width="32" height="32" fill="url(#alin)" stroke={color} strokeWidth="1.5" />
              <rect x="30" y="30" width="32" height="32" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
            </motion.g>
            <Eyes emotion={emotion} />
          </motion.g>
        )}
        {form === "blob" && (
          <motion.g key="blob" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.path
              fill="url(#alin)"
              animate={{
                d: [
                  "M50,28 C68,28 74,44 72,56 C70,68 60,76 50,74 C40,72 28,66 30,52 C32,38 32,28 50,28 Z",
                  "M50,30 C70,30 76,50 68,62 C60,74 46,74 40,66 C34,58 26,44 34,36 C42,28 30,30 50,30 Z",
                  "M50,28 C68,28 74,44 72,56 C70,68 60,76 50,74 C40,72 28,66 30,52 C32,38 32,28 50,28 Z",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <Eyes emotion={emotion} />
          </motion.g>
        )}
        {form === "constellation" && (
          <motion.g key="con" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[
              [30, 40], [50, 28], [70, 42], [62, 62], [40, 66], [50, 50],
            ].map(([x, y], i) => (
              <motion.circle
                key={i}
                cx={x} cy={y} r="2.5" fill={color}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
            <path d="M30,40 L50,28 L70,42 L62,62 L40,66 Z M50,50 L30,40 M50,50 L70,42 M50,50 L40,66"
              stroke={color} strokeWidth="0.6" fill="none" opacity="0.6" />
          </motion.g>
        )}
        {form === "arrow" && (
          <motion.g key="arrow" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <motion.path
              d="M25,50 L65,50 M55,38 L70,50 L55,62"
              stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </motion.g>
        )}
        {form === "spark" && (
          <motion.g key="spark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <circle cx="50" cy="50" r="10" fill={color} />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const x1 = 50 + Math.cos(a) * 16;
              const y1 = 50 + Math.sin(a) * 16;
              const x2 = 50 + Math.cos(a) * 30;
              const y2 = 50 + Math.sin(a) * 30;
              return (
                <motion.line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color} strokeWidth="2" strokeLinecap="round"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, delay: i * 0.1, repeat: Infinity }}
                />
              );
            })}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function Eyes({ emotion }: { emotion: string }) {
  const sleepy = emotion === "sleepy";
  const excited = emotion === "excited";
  return (
    <g fill="oklch(0.1 0 0)">
      {sleepy ? (
        <>
          <rect x="42" y="49" width="4" height="1.5" rx="0.5" />
          <rect x="54" y="49" width="4" height="1.5" rx="0.5" />
        </>
      ) : (
        <>
          <circle cx="44" cy="50" r={excited ? 2.4 : 1.6} />
          <circle cx="56" cy="50" r={excited ? 2.4 : 1.6} />
        </>
      )}
    </g>
  );
}
