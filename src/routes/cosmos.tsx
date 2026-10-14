import { createFileRoute, Link } from "@tanstack/react-router";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { evaluateTouchdown, stabilityOf, type Stability } from "@/lib/landing";
import { getDeepDive } from "@/data/projects";
import { COSMOS_EVENT } from "@/lib/aether-commands";

export const Route = createFileRoute("/cosmos")({
  head: () => ({
    meta: [
      { title: "Cosmos — Fly through Amish's universe" },
      { name: "description", content: "Pilot a rocket through a real-scale universe. Land on planets tagged with Amish's projects, then zoom out through the galaxy to the cosmic web." },
      { property: "og:title", content: "Cosmos — drivable universe" },
      { property: "og:description", content: "WASD + mouse. Land on project-planets. Zoom out until you see the cosmic web." },
    ],
  }),
  component: CosmosPage,
});

/* ═══════════════════════════════ Data ═══════════════════════════════ */

type Body = {
  id: string;
  name: string;
  radius: number;
  orbit: number;
  speed: number;
  color: string;
  emissive?: number;
  ring?: { inner: number; outer: number; color: string };
  project?: { title: string; blurb: string; tag: string };
};

const SUN: Body = {
  id: "sun", name: "Aether Prime", radius: 3.8, orbit: 0, speed: 0,
  color: "#ffb347", emissive: 2.5,
};

// Amish's projects mapped onto planet-sized worlds around the sun.
const PLANETS: Body[] = [
  { id: "dravik",    name: "Dravik",       radius: 1.1, orbit: 10,  speed: 0.14, color: "#5aa9ff",
    project: { title: "Dravik", tag: "AI TRAVEL SAFETY",   blurb: "Flutter + Node + Mongo. AI assistant, SOS, group sync, weather-risk, route safety." } },
  { id: "smartaid",  name: "SmartAid",     radius: 0.95,orbit: 15,  speed: 0.10, color: "#9be7c4",
    project: { title: "SmartAid", tag: "HEALTHCARE AI",    blurb: "Voice-note → medical record with LLM + RAG. Explainable clinical decisions." } },
  { id: "anubhav",   name: "Anubhav",      radius: 1.4, orbit: 21,  speed: 0.07, color: "#ff7a3c",
    ring: { inner: 1.8, outer: 2.6, color: "#ffcf8a" },
    project: { title: "Anubhav", tag: "TOURISM · JHARKHAND", blurb: "AI itinerary + AR/VR + blockchain + multilingual chatbot." } },
  { id: "nirbhay",   name: "Nirbhay AI",   radius: 1.0, orbit: 28,  speed: 0.05, color: "#ff6ad5",
    project: { title: "Nirbhay AI", tag: "EMERGENCY DISPATCH", blurb: "AI 911. Transcribes calls, prioritizes incidents, powers response." } },
  { id: "tor",       name: "Threat-Attr.", radius: 0.8, orbit: 34,  speed: 0.04, color: "#c8a2ff",
    project: { title: "TOR Threat Attribution", tag: "RESEARCH", blurb: "Behavioral analysis + cyber threat attribution. Proposal to TN Police." } },
  { id: "optitask",  name: "OptiTask",     radius: 0.7, orbit: 40,  speed: 0.032,color: "#ffe08a",
    project: { title: "OptiTask", tag: "PRODUCTIVITY", blurb: "First shipped product. Task engine, end-to-end." } },
  { id: "library",   name: "LibrarySys",   radius: 0.6, orbit: 46,  speed: 0.026,color: "#a5c8c8",
    project: { title: "Library System", tag: "FOUNDATIONS", blurb: "Early full-stack. Where the discipline started." } },
];

/* ═══════════════════════════════ Page ═══════════════════════════════ */

type Telemetry = { alt: number; vspeed: number; tilt: number; stab: Stability; near: string } | null;

function CosmosPage() {
  const [selected, setSelected] = useState<Body | null>(null);
  const [scaleLabel, setScaleLabel] = useState("SOLAR");
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [landing, setLanding] = useState<Body | null>(null);
  const [landed, setLanded] = useState<Body | null>(null);
  const [tele, setTele] = useState<Telemetry>(null);
  const [mobile, setMobile] = useState({ f: 0, s: 0, u: 0 });
  /** Live planet world positions, written every frame by OrbitingPlanet. */
  const planetPos = useRef(new Map<string, THREE.Vector3>());
  /** Bridge so DOM buttons / AETHER commands can steer the pilot. */
  const controls = useRef<{ takeoff: () => void; assist: (on: boolean) => void }>({
    takeoff: () => {},
    assist: () => {},
  });

  // AETHER commands: "take off" / "land" arrive as window events.
  useEffect(() => {
    const onCmd = (e: Event) => {
      const action = (e as CustomEvent).detail;
      if (action === "takeoff") controls.current.takeoff();
      else if (action === "land") controls.current.assist(true);
    };
    window.addEventListener(COSMOS_EVENT, onCmd);
    return () => window.removeEventListener(COSMOS_EVENT, onCmd);
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden select-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 8, 45], fov: 65, near: 0.1, far: 200000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#02030a"]} />
        <fog attach="fog" args={["#02030a", 200, 4500]} />
        <ambientLight intensity={0.12} />
        <Suspense fallback={null}>
          <Universe onScaleChange={setScaleLabel} />
          <SolarSystem
            onSelect={setSelected}
            onLandingChange={setLanding}
            planetPos={planetPos.current}
            landed={landed}
          />
          <PilotCamera
            onSpeed={setSpeed}
            onDistance={setDistance}
            mobile={mobile}
            planetPos={planetPos.current}
            landed={landed}
            setLanded={setLanded}
            onTelemetry={setTele}
            controls={controls.current}
          />
        </Suspense>
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.2} luminanceThreshold={0.3} luminanceSmoothing={0.5} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.85} />
        </EffectComposer>
      </Canvas>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <header className="pointer-events-auto flex items-center justify-between px-6 md:px-10 py-4 bg-gradient-to-b from-black/60 to-transparent">
          <Link to="/" className="serif text-xl">← Amish<span className="text-accent">.</span></Link>
          <div className="text-[10px] tracking-[0.35em] uppercase opacity-80 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ad4ff] animate-pulse" />
            AETHER · Observatory
          </div>
          <div className="text-[10px] tracking-[0.35em] uppercase opacity-60">scale · {scaleLabel}</div>
        </header>

        {/* Crosshair */}
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-40">
            <circle cx="40" cy="40" r="26" fill="none" stroke="#5ad4ff" strokeWidth="0.5" />
            <line x1="40" y1="12" x2="40" y2="26" stroke="#5ad4ff" strokeWidth="0.7" />
            <line x1="40" y1="54" x2="40" y2="68" stroke="#5ad4ff" strokeWidth="0.7" />
            <line x1="12" y1="40" x2="26" y2="40" stroke="#5ad4ff" strokeWidth="0.7" />
            <line x1="54" y1="40" x2="68" y2="40" stroke="#5ad4ff" strokeWidth="0.7" />
            <circle cx="40" cy="40" r="1.5" fill="#5ad4ff" />
          </svg>
        </div>

        {/* Bottom HUD */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 px-6 md:px-10 pb-6">
          {/* Left: telemetry */}
          <div className="pointer-events-none font-mono text-[11px] uppercase tracking-widest text-[#a8d8ff] space-y-1">
            <div className="opacity-70">— telemetry —</div>
            <div>velocity <span className="text-white">{speed.toFixed(1)}</span> u/s</div>
            <div>distance <span className="text-white">{formatDist(distance)}</span></div>
            <div>frame     <span className="text-white">{scaleLabel}</span></div>
            {tele && (
              <>
                <div className="opacity-70 mt-2">— approach · {tele.near} —</div>
                <div>altitude  <span className="text-white">{tele.alt.toFixed(2)} u</span></div>
                <div>v-speed   <span className="text-white">{tele.vspeed.toFixed(1)} m/s</span></div>
                <div>tilt      <span className="text-white">{tele.tilt.toFixed(0)}°</span></div>
                <div>
                  stability{" "}
                  <span
                    className={
                      tele.stab === "stable"
                        ? "text-emerald-300"
                        : tele.stab === "marginal"
                          ? "text-amber-300"
                          : "text-red-400"
                    }
                  >
                    ● {tele.stab}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right: controls legend */}
          <div className="pointer-events-none font-mono text-[10px] uppercase tracking-widest text-white/60 text-right space-y-0.5 hidden md:block">
            <div><kbd>W A S D</kbd> thrust · strafe</div>
            <div><kbd>Space</kbd> up · <kbd>Shift</kbd> down</div>
            <div><kbd>Mouse</kbd> look · <kbd>Q E</kbd> roll</div>
            <div><kbd>F</kbd> assisted landing · <kbd>T</kbd> take off</div>
            <div><kbd>R</kbd> return home</div>
          </div>
        </div>

        {/* Mobile joystick */}
        <MobileControls onChange={setMobile} />

        {/* Landing prompt */}
        <AnimatePresence>
          {landing && !landed && (
            <motion.button
              key="land"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => controls.current.assist(true)}
              className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-32 px-4 py-2 rounded-full bg-[#5ad4ff]/15 border border-[#5ad4ff] text-[11px] uppercase tracking-widest text-[#5ad4ff] hover:bg-[#5ad4ff]/25"
            >
              [F] assisted landing on {landing.name}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Deep-dive panel after touchdown */}
        <AnimatePresence>
          {landed && (
            <DeepDivePanel
              key={`dive-${landed.id}`}
              body={landed}
              onTakeoff={() => controls.current.takeoff()}
            />
          )}
        </AnimatePresence>

        {/* Info card */}
        <AnimatePresence>
          {selected && (
            <motion.aside
              key={selected.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="pointer-events-auto absolute top-24 right-4 md:right-8 w-[340px] bg-black/75 backdrop-blur-md border border-white/15 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest" style={{ color: selected.color }}>
                  {selected.project?.tag ?? "STELLAR BODY"}
                </div>
                <button onClick={() => setSelected(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
              </div>
              <h2 className="serif italic text-3xl mt-2">{selected.project?.title ?? selected.name}</h2>
              <p className="text-sm opacity-85 mt-2 leading-relaxed">
                {selected.project?.blurb ?? `A body in Amish's cosmos, ${selected.name}.`}
              </p>
              <div className="mt-4 text-[11px] text-white/50 uppercase tracking-widest">
                orbit · {selected.orbit}u &nbsp;·&nbsp; radius · {selected.radius}u
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/projects" className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-white/25 rounded-full hover:bg-white hover:text-black transition">
                  all projects →
                </Link>
                <Link to="/about" className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-white/25 rounded-full hover:bg-white hover:text-black transition">
                  about
                </Link>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatDist(d: number) {
  if (d < 1e3) return `${d.toFixed(0)} u`;
  if (d < 1e6) return `${(d / 1e3).toFixed(1)} ku`;
  if (d < 1e9) return `${(d / 1e6).toFixed(1)} Mu`;
  return `${(d / 1e9).toFixed(2)} Gu`;
}

/* ═══════════════════════════════ Universe layers ═══════════════════════════════ */

function Universe({ onScaleChange }: { onScaleChange: (s: string) => void }) {
  const { camera } = useThree();
  const galaxyRef = useRef<THREE.Points>(null);
  const webRef = useRef<THREE.Points>(null);
  const solarStars = useRef<THREE.Group>(null);
  const galaxies = useRef<THREE.Group>(null);

  // Galaxy — milky way spiral (visible mid-range)
  const galaxyGeo = useMemo(() => {
    const N = 25000;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const arms = 4;
    for (let i = 0; i < N; i++) {
      const t = Math.random();
      const arm = Math.floor(Math.random() * arms);
      const r = t * 3500 + Math.random() * 40;
      const angle = r * 0.006 + (arm / arms) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      positions[i*3]   = Math.cos(angle) * r + (Math.random() - 0.5) * 30;
      positions[i*3+1] = (Math.random() - 0.5) * (60 - t * 40);
      positions[i*3+2] = Math.sin(angle) * r + (Math.random() - 0.5) * 30;
      const c = new THREE.Color().lerpColors(new THREE.Color("#ffd48a"), new THREE.Color("#6ab0ff"), t);
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  // Cosmic web — nodes + filaments at extreme distance
  const webGeo = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < 90; i++) {
      nodes.push(new THREE.Vector3(
        (Math.random() - 0.5) * 60000,
        (Math.random() - 0.5) * 60000,
        (Math.random() - 0.5) * 60000,
      ));
    }
    const N = 30000;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const n = nodes[Math.floor(Math.random() * nodes.length)];
      const spread = Math.pow(Math.random(), 2.4) * 8000;
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const p = n.clone().addScaledVector(dir, spread);
      positions[i*3] = p.x; positions[i*3+1] = p.y; positions[i*3+2] = p.z;
      const c = new THREE.Color().lerpColors(new THREE.Color("#4ea8ff"), new THREE.Color("#ffb8f0"), Math.random());
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  // Nearby galaxies scattered mid-range
  const galaxyPositions = useMemo(() => {
    const arr: Array<[number, number, number, string, number]> = [];
    const palette = ["#ffcf6e", "#6ab0ff", "#ff9bd0", "#c0ffea", "#ffe08a"];
    for (let i = 0; i < 24; i++) {
      arr.push([
        (Math.random() - 0.5) * 8000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 8000,
        palette[i % palette.length],
        60 + Math.random() * 200,
      ]);
    }
    return arr;
  }, []);

  useFrame(() => {
    const d = camera.position.length();
    // Fade layers based on distance so the universe feels seamless.
    const sMat = solarStars.current?.children[0] as any;
    const gMat = galaxyRef.current?.material as any;
    const wMat = webRef.current?.material as any;

    if (sMat?.opacity !== undefined) sMat.opacity = THREE.MathUtils.clamp(1 - (d - 400) / 800, 0, 1);
    if (gMat?.opacity !== undefined) gMat.opacity = THREE.MathUtils.clamp((d - 150) / 400 * (1 - (d - 5000) / 5000), 0, 0.95);
    if (galaxies.current) galaxies.current.visible = d > 1500;
    if (wMat?.opacity !== undefined) wMat.opacity = THREE.MathUtils.clamp((d - 8000) / 8000, 0, 0.9);
    if (galaxyRef.current) galaxyRef.current.rotation.y += 0.00005;
    if (webRef.current) webRef.current.rotation.y += 0.00002;

    // Scale label
    if (d < 120) onScaleChange("SOLAR");
    else if (d < 800) onScaleChange("STELLAR");
    else if (d < 5000) onScaleChange("GALACTIC");
    else if (d < 25000) onScaleChange("LOCAL GROUP");
    else onScaleChange("COSMIC WEB");
  });

  return (
    <>
      <group ref={solarStars}>
        <Stars radius={600} depth={200} count={9000} factor={4} saturation={0.1} fade speed={0.3} />
      </group>

      <points ref={galaxyRef}>
        <primitive attach="geometry" object={galaxyGeo} />
        <pointsMaterial size={0.9} vertexColors transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>

      <group ref={galaxies}>
        {galaxyPositions.map(([x, y, z, color, r], i) => (
          <group key={i} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[r * 0.35, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.55} />
            </mesh>
            <mesh rotation={[Math.PI / 2.3, Math.random() * Math.PI, 0]}>
              <ringGeometry args={[r * 0.4, r * 1.2, 48]} />
              <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.18} />
            </mesh>
          </group>
        ))}
      </group>

      <points ref={webRef}>
        <primitive attach="geometry" object={webGeo} />
        <pointsMaterial size={40} vertexColors transparent opacity={0} depthWrite={false} sizeAttenuation />
      </points>
    </>
  );
}

/* ═══════════════════════════════ Solar system ═══════════════════════════════ */

function SolarSystem({
  onSelect,
  onLandingChange,
}: {
  onSelect: (b: Body) => void;
  onLandingChange: (b: Body | null) => void;
}) {
  const planetRefs = useRef<Record<string, THREE.Group | null>>({});
  const { camera } = useThree();

  // Landing detection — nearest planet within radius+3
  useFrame(() => {
    let nearest: { b: Body; d: number } | null = null;
    for (const p of PLANETS) {
      const g = planetRefs.current[p.id];
      if (!g) continue;
      const d = g.position.distanceTo(camera.position);
      if (d < p.radius + 4 && (!nearest || d < nearest.d)) nearest = { b: p, d };
    }
    onLandingChange(nearest?.b ?? null);
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={4} color={SUN.color} distance={800} decay={1.2} />
      <SunMesh body={SUN} />
      {PLANETS.map((b) => (
        <OrbitingPlanet
          key={b.id}
          body={b}
          groupRef={(el) => { planetRefs.current[b.id] = el; }}
          onClick={() => onSelect(b)}
        />
      ))}
    </group>
  );
}

function SunMesh({ body }: { body: Body }) {
  const ref = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.06;
    if (halo.current) {
      const s = 1 + Math.sin(performance.now() * 0.001) * 0.03;
      halo.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[body.radius, 64, 64]} />
        <meshBasicMaterial color={body.color} />
      </mesh>
      <mesh ref={halo} scale={1.35}>
        <sphereGeometry args={[body.radius, 32, 32]} />
        <meshBasicMaterial color={body.color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function OrbitingPlanet({
  body, groupRef, onClick,
}: {
  body: Body;
  groupRef: (el: THREE.Group | null) => void;
  onClick: () => void;
}) {
  const inner = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Group | null>(null);
  const angle = useRef(Math.random() * Math.PI * 2);
  const [hover, setHover] = useState(false);

  useFrame((_, dt) => {
    angle.current += body.speed * dt * 0.4;
    if (outer.current) {
      outer.current.position.x = Math.cos(angle.current) * body.orbit;
      outer.current.position.z = Math.sin(angle.current) * body.orbit;
    }
    if (inner.current) inner.current.rotation.y += dt * 0.3;
  });

  return (
    <>
      <OrbitRing radius={body.orbit} />
      <group
        ref={(el) => {
          outer.current = el;
          groupRef(el);
        }}
      >
        <mesh
          ref={inner}
          onClick={onClick}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          <sphereGeometry args={[body.radius, 48, 48]} />
          <meshStandardMaterial
            color={body.color}
            roughness={0.75}
            metalness={0.1}
            emissive={body.color}
            emissiveIntensity={0.15}
          />
        </mesh>
        {body.ring && (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[body.ring.inner, body.ring.outer, 128]} />
            <meshBasicMaterial color={body.ring.color} side={THREE.DoubleSide} transparent opacity={0.55} />
          </mesh>
        )}
        <Html position={[0, body.radius + 0.6, 0]} center distanceFactor={14}>
          <div
            className={`text-[10px] tracking-widest uppercase pointer-events-none transition-opacity ${hover ? "opacity-100" : "opacity-70"}`}
            style={{ color: body.color, textShadow: "0 0 6px rgba(0,0,0,0.8)" }}
          >
            {body.name}
          </div>
        </Html>
      </group>
    </>
  );
}

function OrbitRing({ radius }: { radius: number }) {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 192; i++) {
      const a = (i / 192) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);
  return (
    <line>
      <primitive attach="geometry" object={geom} />
      <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
    </line>
  );
}

/* ═══════════════════════════════ Pilot camera ═══════════════════════════════ */

function PilotCamera({
  onSpeed,
  onDistance,
  mobile,
}: {
  onSpeed: (s: number) => void;
  onDistance: (d: number) => void;
  mobile: { f: number; s: number; u: number };
}) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const yaw = useRef(0);
  const pitch = useRef(-0.15);
  const roll = useRef(0);
  const home = useRef(new THREE.Vector3(0, 8, 45));
  const pointerLocked = useRef(false);

  useEffect(() => {
    const dom = gl.domElement;
    const onKey = (e: KeyboardEvent, down: boolean) => {
      keys.current[e.code] = down;
      if (down && e.code === "KeyR") {
        camera.position.copy(home.current);
        yaw.current = 0; pitch.current = -0.15; roll.current = 0;
        velocity.current.set(0, 0, 0);
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);

    const onClick = () => {
      if (!pointerLocked.current) dom.requestPointerLock();
    };
    const onLock = () => {
      pointerLocked.current = document.pointerLockElement === dom;
    };
    const onMove = (e: MouseEvent) => {
      if (!pointerLocked.current) return;
      yaw.current   -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;
      pitch.current = THREE.MathUtils.clamp(pitch.current, -1.4, 1.4);
    };

    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    dom.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLock);
    document.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      dom.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("mousemove", onMove);
    };
  }, [camera, gl]);

  useFrame((_, dt) => {
    const k = keys.current;
    // Roll
    if (k["KeyQ"]) roll.current += dt * 1.2;
    if (k["KeyE"]) roll.current -= dt * 1.2;
    roll.current *= 0.96;

    // Build rotation
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch.current, yaw.current, roll.current, "YXZ"));
    camera.quaternion.slerp(q, 0.25);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right   = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up      = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

    // Speed scales with distance from origin so we can cross the universe.
    const dist = camera.position.length();
    const baseSpeed = 15 + dist * 0.08;
    const boost = (k["ShiftLeft"] && k["KeyW"]) ? 4 : 1;

    const accel = new THREE.Vector3();
    if (k["KeyW"]) accel.addScaledVector(forward, baseSpeed * boost);
    if (k["KeyS"]) accel.addScaledVector(forward, -baseSpeed);
    if (k["KeyA"]) accel.addScaledVector(right, -baseSpeed);
    if (k["KeyD"]) accel.addScaledVector(right, baseSpeed);
    if (k["Space"]) accel.addScaledVector(up, baseSpeed);
    if (k["ShiftLeft"] && !k["KeyW"]) accel.addScaledVector(up, -baseSpeed);

    // Mobile touch input
    if (mobile.f) accel.addScaledVector(forward, baseSpeed * mobile.f);
    if (mobile.s) accel.addScaledVector(right, baseSpeed * mobile.s);
    if (mobile.u) accel.addScaledVector(up, baseSpeed * mobile.u);

    velocity.current.addScaledVector(accel, dt);
    velocity.current.multiplyScalar(0.92); // drag
    camera.position.addScaledVector(velocity.current, dt);

    onSpeed(velocity.current.length());
    onDistance(camera.position.length());
  });

  return null;
}

/* ═══════════════════════════════ Mobile controls ═══════════════════════════════ */

function MobileControls({ onChange }: { onChange: (v: { f: number; s: number; u: number }) => void }) {
  const [isTouch, setIsTouch] = useState(false);
  const state = useRef({ f: 0, s: 0, u: 0 });

  useEffect(() => {
    setIsTouch(matchMedia("(pointer: coarse)").matches);
  }, []);

  const set = (patch: Partial<typeof state.current>) => {
    Object.assign(state.current, patch);
    onChange({ ...state.current });
  };

  if (!isTouch) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Left joystick — forward/strafe */}
      <div className="pointer-events-auto absolute left-4 bottom-6 w-32 h-32 rounded-full border border-white/25 bg-black/40 backdrop-blur-sm">
        <Joystick onMove={(x, y) => set({ s: x, f: -y })} onRelease={() => set({ s: 0, f: 0 })} />
      </div>
      {/* Right: up/down */}
      <div className="pointer-events-auto absolute right-4 bottom-6 flex flex-col gap-2">
        <button
          onTouchStart={() => set({ u: 1 })}
          onTouchEnd={() => set({ u: 0 })}
          className="w-14 h-14 rounded-full bg-black/40 border border-white/25 backdrop-blur text-white text-lg"
        >↑</button>
        <button
          onTouchStart={() => set({ u: -1 })}
          onTouchEnd={() => set({ u: 0 })}
          className="w-14 h-14 rounded-full bg-black/40 border border-white/25 backdrop-blur text-white text-lg"
        >↓</button>
      </div>
    </div>
  );
}

function Joystick({ onMove, onRelease }: { onMove: (x: number, y: number) => void; onRelease: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const active = useRef(false);

  const setKnob = (x: number, y: number) => {
    if (knob.current) {
      knob.current.style.transform = `translate(${x * 40}px, ${y * 40}px)`;
    }
    onMove(x, y);
  };

  return (
    <div
      ref={ref}
      className="w-full h-full relative"
      onTouchStart={(e) => {
        active.current = true;
        const rect = ref.current!.getBoundingClientRect();
        const t = e.touches[0];
        const x = (t.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (t.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        setKnob(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
      }}
      onTouchMove={(e) => {
        if (!active.current) return;
        const rect = ref.current!.getBoundingClientRect();
        const t = e.touches[0];
        const x = (t.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (t.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        setKnob(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
      }}
      onTouchEnd={() => {
        active.current = false;
        setKnob(0, 0);
        onRelease();
      }}
    >
      <div
        ref={knob}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#5ad4ff]/50 border border-[#5ad4ff] transition-transform"
      />
    </div>
  );
}
