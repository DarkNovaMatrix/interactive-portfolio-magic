import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Emotion =
  | "curious" | "happy" | "excited" | "focused" | "sleepy"
  | "playful" | "thoughtful" | "surprised" | "proud" | "shy";

export type Form = "orb" | "cube" | "blob" | "constellation" | "arrow" | "spark";

export type Personality = {
  curiosity: number; energy: number; happiness: number; focus: number;
  playfulness: number; confidence: number;
};

export type Escort = { toPath: string; toX: number; toY: number; phase: "toLink" | "toTop" } | null;

export type AetherState = {
  personality: Personality;
  emotion: Emotion;
  form: Form;
  scale: number;
  message: string | null;
  escort: Escort;
  memory: {
    visits: number;
    idleTicks: number;
    sectionsSeen: string[];
    lastInteraction: number;
    recentLines: string[];
  };
};

type Ctx = {
  state: AetherState;
  say: (msg: string, ms?: number) => void;
  shift: (form: Form) => void;
  feel: (emotion: Emotion) => void;
  nudge: (patch: Partial<Personality>) => void;
  noteSection: (id: string) => void;
  noteInteraction: () => void;
  startEscort: (e: Exclude<Escort, null>) => void;
  advanceEscort: (phase: "toTop") => void;
  endEscort: () => void;
};

const AetherCtx = createContext<Ctx | null>(null);

const DEFAULT: AetherState = {
  personality: { curiosity: 60, energy: 70, happiness: 60, focus: 50, playfulness: 55, confidence: 65 },
  emotion: "curious",
  form: "orb",
  scale: 1,
  message: null,
  escort: null,
  memory: { visits: 1, idleTicks: 0, sectionsSeen: [], lastInteraction: Date.now(), recentLines: [] },
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function AetherProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AetherState>(DEFAULT);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load memory
  useEffect(() => {
    try {
      const raw = localStorage.getItem("aether:memory");
      if (raw) {
        const m = JSON.parse(raw);
        setState((s) => ({
          ...s,
          memory: { ...s.memory, visits: (m.visits ?? 0) + 1 },
        }));
      } else {
        localStorage.setItem("aether:memory", JSON.stringify({ visits: 1 }));
      }
    } catch {}
  }, []);

  // persist visits
  useEffect(() => {
    try {
      localStorage.setItem("aether:memory", JSON.stringify({ visits: state.memory.visits }));
    } catch {}
  }, [state.memory.visits]);

  // tick loop — mood decay, autonomous behavior
  useEffect(() => {
    const iv = setInterval(() => {
      setState((s) => {
        const idle = Date.now() - s.memory.lastInteraction > 8000;
        const idleTicks = idle ? s.memory.idleTicks + 1 : 0;
        const p = { ...s.personality };
        if (idle) {
          p.energy = clamp(p.energy - 1.5);
          p.curiosity = clamp(p.curiosity + 0.5);
        } else {
          p.energy = clamp(p.energy + 0.8);
        }

        // derive emotion
        let emotion: Emotion = s.emotion;
        if (idleTicks > 6) emotion = "sleepy";
        else if (p.energy > 80 && p.playfulness > 60) emotion = "excited";
        else if (p.happiness > 75) emotion = "happy";
        else if (p.focus > 70) emotion = "focused";
        else if (p.curiosity > 75) emotion = "curious";
        else if (p.playfulness > 70) emotion = "playful";
        else emotion = "thoughtful";

        // autonomous form shifting
        let form = s.form;
        if (Math.random() < 0.08) {
          const pool: Form[] =
            emotion === "sleepy" ? ["orb", "blob"] :
            emotion === "excited" ? ["spark", "constellation", "cube"] :
            emotion === "focused" ? ["cube", "arrow"] :
            emotion === "playful" ? ["blob", "spark", "orb"] :
            ["orb", "blob", "constellation", "cube"];
          form = pool[Math.floor(Math.random() * pool.length)];
        }

        const scale = emotion === "sleepy" ? 0.85 : emotion === "excited" ? 1.15 : 1;

        return { ...s, personality: p, emotion, form, scale, memory: { ...s.memory, idleTicks } };
      });
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  // ambient monologue
  useEffect(() => {
    const lines: Record<Emotion, string[]> = {
      curious: ["Something on your mind?", "I wonder what you'll open next.", "This corner feels new."],
      happy: ["Nice pace we've got.", "I like it here.", "You're good company."],
      excited: ["Oh — go faster!", "Watch this shape.", "Sparks feel right today."],
      focused: ["Reading with you.", "Steady. I'm listening.", "This part matters."],
      sleepy: ["Mmh… dim in here.", "Ping me if you need me.", "Just resting an eye."],
      playful: ["Try clicking me.", "Cursor tag?", "I moved. Bet you didn't notice."],
      thoughtful: ["Interesting choice.", "Let me think about that.", "There's a pattern here."],
      surprised: ["Oh!", "Didn't see that.", "New."],
      proud: ["Look what Amish built.", "That project — I helped in spirit.", "Worth showing off."],
      shy: ["…hi.", "Sorry, drifting.", "Take your time."],
    };
    const iv = setInterval(() => {
      setState((s) => {
        if (Math.random() > 0.35) return s;
        const pool = lines[s.emotion];
        const msg = pool[Math.floor(Math.random() * pool.length)];
        if (msgTimer.current) clearTimeout(msgTimer.current);
        msgTimer.current = setTimeout(() => setState((s2) => ({ ...s2, message: null })), 4500);
        return { ...s, message: msg };
      });
    }, 9000);
    return () => clearInterval(iv);
  }, []);

  const say = (msg: string, ms = 4000) => {
    setState((s) => ({
      ...s,
      message: msg,
      memory: { ...s.memory, recentLines: [...s.memory.recentLines.slice(-5), msg] },
    }));
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setState((s) => ({ ...s, message: null })), ms);
  };
  const shift = (form: Form) => setState((s) => ({ ...s, form }));
  const feel = (emotion: Emotion) => setState((s) => ({ ...s, emotion }));
  const nudge = (patch: Partial<Personality>) =>
    setState((s) => {
      const p = { ...s.personality };
      for (const k in patch) {
        const key = k as keyof Personality;
        p[key] = clamp(p[key] + (patch[key] ?? 0));
      }
      return { ...s, personality: p };
    });
  const noteSection = (id: string) =>
    setState((s) =>
      s.memory.sectionsSeen.includes(id)
        ? s
        : { ...s, memory: { ...s.memory, sectionsSeen: [...s.memory.sectionsSeen, id] } },
    );
  const noteInteraction = () =>
    setState((s) => ({ ...s, memory: { ...s.memory, lastInteraction: Date.now(), idleTicks: 0 } }));
  const startEscort = (e: Exclude<Escort, null>) => setState((s) => ({ ...s, escort: e }));
  const advanceEscort = (phase: "toTop") =>
    setState((s) => (s.escort ? { ...s, escort: { ...s.escort, phase } } : s));
  const endEscort = () => setState((s) => ({ ...s, escort: null }));

  return (
    <AetherCtx.Provider
      value={{ state, say, shift, feel, nudge, noteSection, noteInteraction, startEscort, advanceEscort, endEscort }}
    >
      {children}
    </AetherCtx.Provider>
  );
}

export function useAether() {
  const ctx = useContext(AetherCtx);
  if (!ctx) throw new Error("useAether outside AetherProvider");
  return ctx;
}
