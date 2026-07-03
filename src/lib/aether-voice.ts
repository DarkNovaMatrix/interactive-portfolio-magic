import { useCallback, useEffect, useRef, useState } from "react";

type SpeakOpts = { emotion?: string; onEnd?: () => void };

/** Browser SpeechSynthesis wrapper with emotion → pitch/rate mapping. */
export function useAetherTTS() {
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      // prefer softer/neural english voices
      voiceRef.current =
        voices.find((v) => /Google UK English Female|Samantha|Karen|Serena|Neural/i.test(v.name)) ||
        voices.find((v) => v.lang?.startsWith("en")) ||
        voices[0] ||
        null;
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  const speak = useCallback(
    (text: string, opts: SpeakOpts = {}) => {
      if (!enabled || !text) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (voiceRef.current) u.voice = voiceRef.current;
        const emo = opts.emotion ?? "curious";
        // map emotion → prosody
        const table: Record<string, { rate: number; pitch: number; vol: number }> = {
          excited: { rate: 1.15, pitch: 1.25, vol: 1 },
          happy: { rate: 1.05, pitch: 1.15, vol: 1 },
          curious: { rate: 1.0, pitch: 1.05, vol: 0.95 },
          playful: { rate: 1.1, pitch: 1.35, vol: 0.95 },
          focused: { rate: 0.95, pitch: 0.95, vol: 0.9 },
          thoughtful: { rate: 0.9, pitch: 0.9, vol: 0.9 },
          sleepy: { rate: 0.75, pitch: 0.8, vol: 0.75 },
          surprised: { rate: 1.2, pitch: 1.4, vol: 1 },
          proud: { rate: 0.95, pitch: 1.05, vol: 1 },
          shy: { rate: 0.9, pitch: 1.1, vol: 0.7 },
        };
        const p = table[emo] ?? table.curious;
        u.rate = p.rate;
        u.pitch = p.pitch;
        u.volume = p.vol;
        u.onstart = () => setSpeaking(true);
        u.onend = () => {
          setSpeaking(false);
          opts.onEnd?.();
        };
        u.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
      } catch {}
    },
    [enabled],
  );

  const toggle = useCallback(() => {
    setEnabled((e) => {
      const next = !e;
      if (!next && typeof window !== "undefined") window.speechSynthesis.cancel();
      return next;
    });
  }, []);

  return { enabled, speaking, speak, toggle };
}

/** Browser SpeechRecognition (webkit) wrapper. */
export function useAetherSTT(onResult: (transcript: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const t = e.results?.[0]?.[0]?.transcript?.trim();
      if (t) onResult(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {}
    };
  }, [onResult]);

  const start = useCallback(() => {
    if (!recRef.current || listening) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {}
  }, [listening]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}
