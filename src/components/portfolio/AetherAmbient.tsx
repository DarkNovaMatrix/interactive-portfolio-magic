import { useEffect, useRef } from "react";
import { useAether } from "@/lib/aether-state";

/**
 * Living ambient background — a subtle particle field on a canvas whose
 * density and color respond to AETHER's mood. Sits under all content.
 */
export function AetherAmbient() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { state } = useAether();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.floor((w * h) / 22000);
      pts = Array.from({ length: target }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const emo = state.emotion;
      const speed = emo === "excited" ? 2.2 : emo === "sleepy" ? 0.3 : emo === "playful" ? 1.6 : 1;
      const link = emo === "focused" ? 130 : emo === "sleepy" ? 60 : 100;
      const isDark = document.documentElement.classList.contains("dark");
      const stroke = isDark ? "255,255,255" : "20,20,20";

      for (const p of pts) {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${stroke},0.35)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // links
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < link) {
            ctx.strokeStyle = `rgba(${stroke},${(1 - d / link) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [state.emotion]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 -z-10 pointer-events-none opacity-70"
      aria-hidden
    />
  );
}
