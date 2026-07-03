import { useEffect, useRef } from "react";
import { useAether } from "@/lib/aether-state";

/** Cursor-following particle trail emitted from Aether's live viewport position.
 * Reads the position from a global set by the Aether root each frame. */
export function AetherTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { state } = useAether();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hue: string };
    const particles: P[] = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const colorFor = (emo: string) => {
      const map: Record<string, string> = {
        excited: "255,120,60",
        happy: "255,210,110",
        curious: "255,180,110",
        playful: "255,140,220",
        focused: "130,180,255",
        thoughtful: "160,210,220",
        sleepy: "150,140,200",
        surprised: "255,230,140",
        proud: "255,150,90",
        shy: "230,180,220",
      };
      return map[emo] ?? "255,200,150";
    };

    function tick() {
      if (!ctx) return;
      const pos = (window as any).__aetherPos as { x: number; y: number; escorting: boolean } | undefined;
      const escorting = pos?.escorting ?? false;
      const emit = escorting ? 6 : 1;
      if (pos) {
        const hue = colorFor(state.emotion);
        for (let i = 0; i < emit; i++) {
          particles.push({
            x: pos.x + (Math.random() - 0.5) * 10,
            y: pos.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * (escorting ? 1.5 : 0.6),
            vy: (Math.random() - 0.5) * (escorting ? 1.5 : 0.6) + (escorting ? 0.3 : 0),
            life: 0,
            max: escorting ? 70 : 40,
            r: Math.random() * (escorting ? 3.5 : 2) + 1,
            hue,
          });
        }
      }
      // fade previous frame instead of clear for a smoother trail
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        const a = 1 - p.life / p.max;
        if (a <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(${p.hue},${a * 0.55})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a + 0.4, 0, Math.PI * 2);
        ctx.fill();
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
      className="fixed inset-0 z-[90] pointer-events-none"
      aria-hidden
    />
  );
}
