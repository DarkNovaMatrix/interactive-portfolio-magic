import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Emotion, Form } from "@/lib/aether-state";

/**
 * AETHER body — a TARS-style articulated monolith that can reconfigure
 * into a Rocky-style multi-limbed crawler. No smooth blob morphs; every
 * shape is made of the same 4 rigid slabs, rearranged.
 */

const SCREEN_COLOR: Record<Emotion, string> = {
  curious: "#f0b060",
  happy: "#ffd06a",
  excited: "#ff5a3c",
  focused: "#7ec4ff",
  sleepy: "#5a5470",
  playful: "#ff7ad4",
  thoughtful: "#7fc7c7",
  surprised: "#ffd460",
  proud: "#ff9040",
  shy: "#c898b8",
};

// Segment dimensions
const SEG_W = 0.9;
const SEG_H = 0.55;
const SEG_D = 0.55;
const SEG_COUNT = 4;

function Slab({
  index,
  offset,
  rotation,
  screenColor,
  isFace,
  glyph,
}: {
  index: number;
  offset: [number, number, number];
  rotation: [number, number, number];
  screenColor: string;
  isFace: boolean;
  glyph: number;
}) {
  const grpRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(...offset));
  const targetRot = useRef(new THREE.Euler(...rotation));

  useFrame(() => {
    if (!grpRef.current) return;
    targetPos.current.set(...offset);
    targetRot.current.set(...rotation);
    grpRef.current.position.lerp(targetPos.current, 0.14);
    grpRef.current.rotation.x = THREE.MathUtils.lerp(grpRef.current.rotation.x, targetRot.current.x, 0.14);
    grpRef.current.rotation.y = THREE.MathUtils.lerp(grpRef.current.rotation.y, targetRot.current.y, 0.14);
    grpRef.current.rotation.z = THREE.MathUtils.lerp(grpRef.current.rotation.z, targetRot.current.z, 0.14);
  });

  return (
    <group ref={grpRef} position={offset} rotation={rotation}>
      {/* main slab */}
      <mesh castShadow>
        <boxGeometry args={[SEG_W, SEG_H, SEG_D]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* emissive seam along the top and bottom edges */}
      <mesh position={[0, SEG_H / 2 + 0.001, 0]}>
        <boxGeometry args={[SEG_W * 0.98, 0.02, SEG_D * 0.98]} />
        <meshStandardMaterial color={screenColor} emissive={screenColor} emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, -SEG_H / 2 - 0.001, 0]}>
        <boxGeometry args={[SEG_W * 0.98, 0.02, SEG_D * 0.98]} />
        <meshStandardMaterial color={screenColor} emissive={screenColor} emissiveIntensity={0.5} />
      </mesh>
      {/* screen face on the front of the top slab */}
      {isFace && (
        <group position={[0, 0, SEG_D / 2 + 0.002]}>
          <mesh>
            <planeGeometry args={[SEG_W * 0.72, SEG_H * 0.7]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
          <ScreenGlyphs color={screenColor} glyph={glyph} />
        </group>
      )}
      {/* tiny bolt accents */}
      <mesh position={[SEG_W / 2 - 0.05, 0, SEG_D / 2 + 0.001]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color="#333" metalness={1} roughness={0.4} />
      </mesh>
      <mesh position={[-SEG_W / 2 + 0.05, 0, SEG_D / 2 + 0.001]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color="#333" metalness={1} roughness={0.4} />
      </mesh>
      {/* segment index tag (subtle) */}
      <mesh position={[SEG_W / 2 - 0.08, SEG_H / 2 - 0.08, SEG_D / 2 + 0.003]}>
        <planeGeometry args={[0.05, 0.05]} />
        <meshBasicMaterial color={screenColor} opacity={0.4 + index * 0.05} transparent />
      </mesh>
    </group>
  );
}

function ScreenGlyphs({ color, glyph }: { color: string; glyph: number }) {
  // 5x3 grid of dots; pattern shifts with glyph state
  const dots = useMemo(() => {
    const arr: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 5; x++) {
        arr.push({ x: (x - 2) * 0.11, y: (1 - y) * 0.11 });
      }
    }
    return arr;
  }, []);
  return (
    <group position={[0, 0, 0.001]}>
      {dots.map((d, i) => {
        const on = ((glyph >> (i % 8)) & 1) === 1 || (i + glyph) % 3 === 0;
        return (
          <mesh key={i} position={[d.x, d.y, 0]}>
            <circleGeometry args={[0.028, 12]} />
            <meshBasicMaterial color={on ? color : "#0f0f10"} />
          </mesh>
        );
      })}
    </group>
  );
}

function computeLayout(form: Form, emotion: Emotion, t: number) {
  // returns per-slab offsets and rotations
  const layouts: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [];
  const walk = Math.sin(t * 6);
  const walk2 = Math.sin(t * 6 + Math.PI);
  const excited = emotion === "excited" || emotion === "playful";
  const sleepy = emotion === "sleepy";
  const focused = emotion === "focused";

  if (form === "arrow") {
    // crawler-mode: legs splayed, body low → forward stance
    layouts.push({ pos: [0, 0.15, 0], rot: [0, 0, 0] }); // head
    layouts.push({ pos: [-0.6, -0.1 + walk * 0.15, 0.15], rot: [0, 0.4, walk * 0.5] });
    layouts.push({ pos: [0.6, -0.1 + walk2 * 0.15, 0.15], rot: [0, -0.4, walk2 * 0.5] });
    layouts.push({ pos: [0, -0.55, -0.2], rot: [walk * 0.3, 0, 0] });
    return layouts;
  }

  if (form === "spark" || form === "constellation") {
    // Rocky-style crab: four legs radiating from a low central body
    const legAmp = excited ? 0.35 : 0.2;
    layouts.push({ pos: [0, 0, 0], rot: [0, t * 0.4, 0] }); // core
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + t * 0.2;
      const cyc = Math.sin(t * (excited ? 8 : 4) + i * 2);
      layouts.push({
        pos: [Math.cos(a) * 0.7, cyc * legAmp - 0.1, Math.sin(a) * 0.7],
        rot: [cyc * 0.5, a, 0],
      });
    }
    return layouts;
  }

  if (form === "cube") {
    // compact cube — 4 slabs collapsed into a tight block
    const gap = 0.02;
    const s = SEG_H + gap;
    layouts.push({ pos: [0, 1.5 * s, 0], rot: [0, 0, 0] });
    layouts.push({ pos: [0, 0.5 * s, 0], rot: [0, 0, 0] });
    layouts.push({ pos: [0, -0.5 * s, 0], rot: [0, 0, 0] });
    layouts.push({ pos: [0, -1.5 * s, 0], rot: [0, 0, 0] });
    return layouts;
  }

  if (form === "blob" || sleepy) {
    // low resting pile — slabs slouched
    layouts.push({ pos: [0.05, 0.35, 0], rot: [0, 0.1, 0.05] });
    layouts.push({ pos: [-0.05, 0.05, 0.02], rot: [0, -0.15, -0.05] });
    layouts.push({ pos: [0.03, -0.25, -0.03], rot: [0.05, 0.1, 0.03] });
    layouts.push({ pos: [-0.02, -0.55, 0.01], rot: [0, -0.05, -0.02] });
    return layouts;
  }

  // Default TARS monolith — stacked slabs, subtle hinge sway
  const sway = focused ? 0 : Math.sin(t * 1.6) * 0.04;
  const gap = 0.06;
  const step = SEG_H + gap;
  layouts.push({ pos: [0, 1.5 * step, 0], rot: [0, sway, 0] });
  layouts.push({ pos: [0, 0.5 * step, 0], rot: [0, sway * 0.5, 0] });
  layouts.push({ pos: [0, -0.5 * step, 0], rot: [0, -sway * 0.5, 0] });
  layouts.push({ pos: [0, -1.5 * step, 0], rot: [0, -sway, 0] });
  return layouts;
}

function AetherBody({
  form,
  emotion,
  active,
}: {
  form: Form;
  emotion: Emotion;
  active: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const glyphRef = useRef(1);
  const tickRef = useRef(0);
  const layoutRef = useRef(computeLayout(form, emotion, 0));

  useFrame((_, dt) => {
    tickRef.current += dt;
    layoutRef.current = computeLayout(form, emotion, tickRef.current);
    // idle glyph blink cadence
    const cadence = emotion === "excited" ? 0.08 : emotion === "sleepy" ? 1.2 : 0.35;
    if (Math.floor(tickRef.current / cadence) !== Math.floor((tickRef.current - dt) / cadence)) {
      glyphRef.current = Math.floor(Math.random() * 255);
    }
    if (root.current) {
      // whole-body idle: gentle head-scan when active, dead-still when focused
      const yaw = active ? Math.sin(tickRef.current * 0.9) * 0.25 : Math.sin(tickRef.current * 0.3) * 0.08;
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, yaw, 0.06);
    }
  });

  const color = SCREEN_COLOR[emotion];
  const slabs = Array.from({ length: SEG_COUNT }).map((_, i) => {
    const l = layoutRef.current[i] ?? { pos: [0, 0, 0] as [number, number, number], rot: [0, 0, 0] as [number, number, number] };
    return (
      <Slab
        key={i}
        index={i}
        offset={l.pos}
        rotation={l.rot}
        screenColor={color}
        isFace={i === 0}
        glyph={glyphRef.current}
      />
    );
  });

  return <group ref={root}>{slabs}</group>;
}

export function AetherForm3D({
  form,
  emotion,
  active,
  size = 120,
}: {
  form: Form;
  emotion: Emotion;
  active: boolean;
  size?: number;
}) {
  const color = SCREEN_COLOR[emotion];
  return (
    <div style={{ width: size, height: size }} className="pointer-events-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [1.8, 0.8, 3.4], fov: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 4]} intensity={1.4} color="#ffffff" />
        <pointLight position={[-2, -1, 3]} intensity={1.1} color={color} distance={10} />
        <AetherBody form={form} emotion={emotion} active={active} />
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.35} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
