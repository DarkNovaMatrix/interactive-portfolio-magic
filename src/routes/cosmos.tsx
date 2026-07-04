import { createFileRoute } from "@tanstack/react-router";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { SOLAR, NEAR_STARS, BLACK_HOLES, DEEP_SKY, SCENES, type Body } from "@/data/cosmos";

export const Route = createFileRoute("/cosmos")({
  head: () => ({
    meta: [
      { title: "Cosmos — Everything Humans Have Seen · Amish Kumar" },
      {
        name: "description",
        content:
          "An interactive tour of the observable universe. Fly through the solar system, nearby stars, black holes, nebulae, and beyond.",
      },
      { property: "og:title", content: "Cosmos — an interactive universe" },
      {
        property: "og:description",
        content: "Fly, land, and explore planets, stars, black holes, nebulae, and the cosmic web.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CosmosPage,
});

type SceneId = (typeof SCENES)[number]["id"];

function CosmosPage() {
  const [scene, setScene] = useState<SceneId>("solar");
  const [selected, setSelected] = useState<Body | null>(null);

  const sceneMeta = SCENES.find((s) => s.id === scene)!;

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 8, 30], fov: 55, far: 20000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#03030a"]} />
        <fog attach="fog" args={["#03030a", 60, 800]} />
        <ambientLight intensity={0.15} />
        <Suspense fallback={null}>
          <Stars radius={400} depth={120} count={8000} factor={4} saturation={0} fade speed={0.4} />
          {scene === "solar" && <SolarScene onSelect={setSelected} />}
          {scene === "stars" && <StarFieldScene bodies={NEAR_STARS} onSelect={setSelected} />}
          {scene === "galaxy" && <GalaxyScene onSelect={setSelected} />}
          {scene === "blackholes" && <BlackHoleScene bodies={BLACK_HOLES} onSelect={setSelected} />}
          {scene === "deep" && <StarFieldScene bodies={DEEP_SKY} onSelect={setSelected} large />}
          {scene === "universe" && <CosmicWebScene />}
        </Suspense>
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          zoomSpeed={0.9}
          rotateSpeed={0.6}
          minDistance={2}
          maxDistance={900}
          makeDefault
        />
        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.25} luminanceSmoothing={0.5} mipmapBlur />
          <ChromaticAberration offset={[0.0006, 0.0009] as unknown as THREE.Vector2} radialModulation={false} modulationOffset={0} />
        </EffectComposer>
      </Canvas>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <header className="pointer-events-auto flex items-center justify-between px-6 md:px-10 py-5 backdrop-blur-sm bg-black/20 border-b border-white/10">
          <a href="/" className="serif text-xl">
            ← Amish<span className="text-accent">.</span>
          </a>
          <div className="text-[10px] tracking-[0.35em] uppercase opacity-80">
            AETHER · Observatory
          </div>
          <div className="text-[10px] tracking-[0.35em] uppercase opacity-60">
            scale · {sceneMeta.scale}
          </div>
        </header>

        <div className="pointer-events-auto flex flex-wrap gap-2 px-6 md:px-10 py-4">
          {SCENES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setScene(s.id);
                setSelected(null);
              }}
              className={`text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition ${
                scene === s.id
                  ? "bg-white text-black border-white"
                  : "border-white/30 text-white/80 hover:border-white/80"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Bottom-left blurb */}
        <div className="pointer-events-none px-6 md:px-10 pb-6 max-w-md">
          <div className="serif italic text-lg leading-snug opacity-90">{sceneMeta.blurb}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-50 mt-2">
            drag · rotate · scroll · zoom · click a body to land
          </div>
        </div>
      </div>

      {/* Info card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="pointer-events-auto absolute top-24 right-6 md:right-10 w-[320px] bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest opacity-60">{selected.kind}</div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
            <h2 className="serif text-3xl leading-tight mt-2">{selected.name}</h2>
            <p className="mt-2 text-sm opacity-85 leading-relaxed">{selected.blurb}</p>
            <ul className="mt-4 space-y-1.5">
              {selected.facts.map((f) => (
                <li key={f} className="text-[13px] flex gap-2">
                  <span
                    className="mt-1.5 h-1 w-1 rounded-full shrink-0"
                    style={{ background: selected.color }}
                  />
                  <span className="opacity-85">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────  Scenes  ───────────── */

function SolarScene({ onSelect }: { onSelect: (b: Body) => void }) {
  const [sun, ...rest] = SOLAR;
  return (
    <group>
      <SunMesh body={sun} onClick={() => onSelect(sun)} />
      {rest.map((b) => (
        <Planet key={b.id} body={b} onClick={() => onSelect(b)} />
      ))}
    </group>
  );
}

function SunMesh({ body, onClick }: { body: Body; onClick: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.1;
  });
  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={3} color={body.color} distance={200} decay={1.2} />
      <mesh ref={ref} onClick={onClick}>
        <sphereGeometry args={[body.radius, 64, 64]} />
        <meshBasicMaterial color={body.color} />
      </mesh>
      <mesh scale={1.15}>
        <sphereGeometry args={[body.radius, 32, 32]} />
        <meshBasicMaterial color={body.color} transparent opacity={0.18} />
      </mesh>
      <Html position={[0, body.radius + 0.6, 0]} center distanceFactor={12}>
        <div className="text-[10px] tracking-widest uppercase text-white/70 pointer-events-none">{body.name}</div>
      </Html>
    </group>
  );
}

function Planet({ body, onClick }: { body: Body; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = useRef(Math.random() * Math.PI * 2);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    angle.current += (body.speed ?? 0.2) * dt * 0.15;
    if (ref.current) {
      ref.current.position.x = Math.cos(angle.current) * (body.orbit ?? 5);
      ref.current.position.z = Math.sin(angle.current) * (body.orbit ?? 5);
    }
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.4;
  });
  return (
    <>
      <OrbitRing radius={body.orbit ?? 5} />
      <group ref={ref}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          <sphereGeometry args={[body.radius, 48, 48]} />
          <meshStandardMaterial color={body.color} roughness={0.85} metalness={0.05} />
        </mesh>
        {body.ring && (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[body.ring.inner, body.ring.outer, 96]} />
            <meshBasicMaterial color={body.ring.color} side={THREE.DoubleSide} transparent opacity={0.55} />
          </mesh>
        )}
        <Html position={[0, body.radius + 0.4, 0]} center distanceFactor={10}>
          <div
            className={`text-[10px] tracking-widest uppercase pointer-events-none transition-opacity ${
              hover ? "opacity-100" : "opacity-60"
            }`}
            style={{ color: body.color }}
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
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return g;
  }, [radius]);
  return (
    <line>
      <primitive attach="geometry" object={geom} />
      <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
    </line>
  );
}

function StarFieldScene({
  bodies,
  onSelect,
  large,
}: {
  bodies: Body[];
  onSelect: (b: Body) => void;
  large?: boolean;
}) {
  // Distribute in a rough sphere.
  const positions = useMemo(() => {
    return bodies.map((_, i) => {
      const r = large ? 18 + Math.random() * 22 : 10 + Math.random() * 18;
      const theta = Math.acos(-1 + (2 * i) / bodies.length);
      const phi = Math.sqrt(bodies.length * Math.PI) * theta;
      return new THREE.Vector3(
        Math.cos(phi) * Math.sin(theta) * r,
        (Math.random() - 0.5) * r * 0.6,
        Math.sin(phi) * Math.sin(theta) * r,
      );
    });
  }, [bodies, large]);
  return (
    <group>
      {bodies.map((b, i) => (
        <StarBody key={b.id} body={b} pos={positions[i]} onClick={() => onSelect(b)} />
      ))}
    </group>
  );
}

function StarBody({
  body,
  pos,
  onClick,
}: {
  body: Body;
  pos: THREE.Vector3;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.2;
  });
  const emissive = body.emissive ?? 0.6;
  return (
    <group position={pos}>
      <pointLight color={body.color} intensity={emissive * 0.8} distance={12} decay={2} />
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[body.radius, 32, 32]} />
        <meshBasicMaterial color={body.color} />
      </mesh>
      <mesh scale={1.4}>
        <sphereGeometry args={[body.radius, 16, 16]} />
        <meshBasicMaterial color={body.color} transparent opacity={0.15} />
      </mesh>
      <Html position={[0, body.radius + 0.5, 0]} center distanceFactor={15}>
        <div
          className={`text-[10px] tracking-widest uppercase pointer-events-none transition-opacity ${
            hover ? "opacity-100" : "opacity-55"
          }`}
          style={{ color: body.color }}
        >
          {body.name}
        </div>
      </Html>
    </group>
  );
}

function GalaxyScene({ onSelect }: { onSelect: (b: Body) => void }) {
  // Procedural spiral of instanced points.
  const geometry = useMemo(() => {
    const N = 12000;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const arms = 4;
    const armSpread = 0.35;
    for (let i = 0; i < N; i++) {
      const t = Math.random();
      const arm = Math.floor(Math.random() * arms);
      const r = t * 30 + Math.random() * 1.2;
      const spinAngle = r * 0.4;
      const armAngle = (arm / arms) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * armSpread * (1 + t * 3);
      const angle = spinAngle + armAngle + jitter;
      positions[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (1.5 - t * 1.2);
      positions[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.4;
      // color: warm center → cool arms
      const c = new THREE.Color().lerpColors(new THREE.Color("#ffcf6e"), new THREE.Color("#6ab0ff"), t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.03;
  });
  const sgra = BLACK_HOLES[0];
  return (
    <group>
      <points ref={ref}>
        <primitive attach="geometry" object={geometry} />
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} depthWrite={false} />
      </points>
      {/* Sgr A* at the core */}
      <mesh onClick={() => onSelect(sgra)}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[0.9, 1.8, 96]} />
        <meshBasicMaterial color="#ffaa66" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>
      {/* Sun marker */}
      <group position={[16, 0, 3]}>
        <mesh onClick={() => onSelect({ ...sgra, id: "sunpos", name: "Our Sun (position)", blurb: "The Sun sits 26,000 light-years from the galactic center, in the Orion Arm.", facts: ["Orbital speed: 220 km/s", "1 galactic year: ~230 Myr", "Orion Arm resident"] })}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#ffe08a" />
        </mesh>
        <Html position={[0, 0.5, 0]} center distanceFactor={20}>
          <div className="text-[10px] tracking-widest uppercase text-yellow-200/80 pointer-events-none">You are here</div>
        </Html>
      </group>
    </group>
  );
}

function BlackHoleScene({
  bodies,
  onSelect,
}: {
  bodies: Body[];
  onSelect: (b: Body) => void;
}) {
  return (
    <group>
      {bodies.map((b, i) => {
        const angle = (i / bodies.length) * Math.PI * 2;
        const R = 14;
        return (
          <group key={b.id} position={[Math.cos(angle) * R, 0, Math.sin(angle) * R]}>
            <BlackHole body={b} onClick={() => onSelect(b)} />
          </group>
        );
      })}
    </group>
  );
}

function BlackHole({ body, onClick }: { body: Body; onClick: () => void }) {
  const disk = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (disk.current) disk.current.rotation.z += dt * 0.9;
  });
  return (
    <group>
      {/* event horizon */}
      <mesh onClick={onClick}>
        <sphereGeometry args={[body.radius, 32, 32]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* gravitational lensing halo */}
      <mesh scale={1.05}>
        <sphereGeometry args={[body.radius, 32, 32]} />
        <meshBasicMaterial color={body.color} transparent opacity={0.12} />
      </mesh>
      {/* accretion disk */}
      <mesh ref={disk} rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[body.radius * 1.4, body.radius * 3.2, 128]} />
        <meshBasicMaterial color={body.color} side={THREE.DoubleSide} transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[body.radius * 3.2, body.radius * 4.0, 128]} />
        <meshBasicMaterial color={body.color} side={THREE.DoubleSide} transparent opacity={0.25} />
      </mesh>
      <Html position={[0, body.radius + 1.2, 0]} center distanceFactor={16}>
        <div className="text-[10px] tracking-widest uppercase text-white/80 pointer-events-none">{body.name}</div>
      </Html>
    </group>
  );
}

function CosmicWebScene() {
  const geom = useMemo(() => {
    const N = 6000;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    // Filamentary structure — cluster nodes with sparse strands.
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < 40; i++) {
      nodes.push(new THREE.Vector3((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80));
    }
    for (let i = 0; i < N; i++) {
      const n = nodes[Math.floor(Math.random() * nodes.length)];
      const spread = Math.pow(Math.random(), 2.2) * 12;
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const p = n.clone().addScaledVector(dir, spread);
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
      const c = new THREE.Color().lerpColors(new THREE.Color("#4ea8ff"), new THREE.Color("#ffb8f0"), Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <group>
      <points ref={ref}>
        <primitive attach="geometry" object={geom} />
        <pointsMaterial size={0.35} vertexColors transparent opacity={0.85} depthWrite={false} />
      </points>
      <Html position={[0, 0, 0]} center distanceFactor={40}>
        <div className="text-[10px] tracking-widest uppercase text-white/50 pointer-events-none whitespace-nowrap">
          ~93,000,000,000 light-years across
        </div>
      </Html>
    </group>
  );
}
