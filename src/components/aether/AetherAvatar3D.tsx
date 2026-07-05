import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type AetherForm = "orb" | "rocket" | "satellite" | "drone" | "crystal" | "brain";
export type AetherMood = "curious" | "focused" | "excited" | "playful" | "thoughtful" | "proud" | "calm";

const MOOD_COLOR: Record<AetherMood, string> = {
  curious: "#7fd0ff",
  focused: "#5aa9ff",
  excited: "#ff7a3c",
  playful: "#ff6ad5",
  thoughtful: "#a5c8c8",
  proud: "#ffb347",
  calm: "#9be7c4",
};

/** A group that fades in/out its opacity based on `active` prop. */
function FormGroup({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const opacity = useRef(0);
  useFrame(() => {
    const target = active ? 1 : 0;
    opacity.current = THREE.MathUtils.lerp(opacity.current, target, 0.08);
    if (ref.current) {
      ref.current.visible = opacity.current > 0.02;
      ref.current.scale.setScalar(0.6 + opacity.current * 0.4);
      ref.current.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (!m) return;
        const mats = Array.isArray(m) ? m : [m];
        for (const mat of mats) {
          (mat as any).transparent = true;
          (mat as any).opacity = opacity.current;
        }
      });
    }
  });
  return <group ref={ref}>{children}</group>;
}

function Orb({ color, active }: { color: string; active: boolean }) {
  const inner = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (inner.current) inner.current.rotation.y += dt * 0.4;
    if (outer.current) {
      outer.current.rotation.x += dt * 0.15;
      outer.current.rotation.y -= dt * 0.1;
    }
  });
  return (
    <FormGroup active={active}>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.9}
          metalness={0.7}
          roughness={0.15}
          wireframe
        />
      </mesh>
      <mesh ref={outer}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshPhysicalMaterial
          color="#0a0d14"
          metalness={0.9}
          roughness={0.05}
          transmission={0.4}
          thickness={0.5}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
      <pointLight color={color} intensity={2.5} distance={6} />
    </FormGroup>
  );
}

function Rocket({ color, active }: { color: string; active: boolean }) {
  const grp = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (grp.current) {
      grp.current.rotation.y += dt * 0.3;
      grp.current.position.y = Math.sin(performance.now() * 0.002) * 0.08;
    }
    if (flame.current) {
      const s = 0.9 + Math.sin(performance.now() * 0.03) * 0.25;
      flame.current.scale.set(s * 0.7, s, s * 0.7);
    }
  });
  return (
    <FormGroup active={active}>
      <group ref={grp} rotation={[0, 0, 0]}>
        {/* body */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 1.4, 24]} />
          <meshStandardMaterial color="#e6e6ea" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* nose cone */}
        <mesh position={[0, 1.0, 0]}>
          <coneGeometry args={[0.28, 0.55, 24]} />
          <meshStandardMaterial color="#cfd2d8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* window */}
        <mesh position={[0, 0.4, 0.28]}>
          <sphereGeometry args={[0.11, 20, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </mesh>
        {/* fins */}
        {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((a, i) => (
          <mesh key={i} position={[Math.sin(a) * 0.28, -0.55, Math.cos(a) * 0.28]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.02, 0.35, 0.32]} />
            <meshStandardMaterial color="#b03028" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* engine bell */}
        <mesh position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.16, 0.28, 0.22, 20]} />
          <meshStandardMaterial color="#3a3a40" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* flame */}
        <mesh ref={flame} position={[0, -1.05, 0]}>
          <coneGeometry args={[0.18, 0.55, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
      <pointLight color={color} intensity={2} distance={5} position={[0, -1, 0]} />
    </FormGroup>
  );
}

function Satellite({ color, active }: { color: string; active: boolean }) {
  const grp = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (grp.current) {
      grp.current.rotation.y += dt * 0.5;
      grp.current.rotation.x = Math.sin(performance.now() * 0.001) * 0.15;
    }
  });
  return (
    <FormGroup active={active}>
      <group ref={grp}>
        {/* core body */}
        <mesh>
          <boxGeometry args={[0.55, 0.55, 0.8]} />
          <meshStandardMaterial color="#dcdce0" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* solar panels */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.9, 0, 0]}>
            <boxGeometry args={[1.1, 0.5, 0.03]} />
            <meshStandardMaterial color="#0d1a3a" emissive="#1b3a8a" emissiveIntensity={0.4} metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
        {/* dish */}
        <mesh position={[0, 0.45, 0.25]} rotation={[-Math.PI / 3, 0, 0]}>
          <sphereGeometry args={[0.28, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f1f1f4" side={THREE.DoubleSide} metalness={0.8} roughness={0.3} />
        </mesh>
        {/* antenna */}
        <mesh position={[0, 0.55, 0.4]}>
          <cylinderGeometry args={[0.01, 0.01, 0.35, 6]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0, 0.75, 0.4]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
      </group>
      <pointLight color={color} intensity={1.5} distance={4} />
    </FormGroup>
  );
}

function Drone({ color, active }: { color: string; active: boolean }) {
  const grp = useRef<THREE.Group>(null);
  const rotors = useRef<THREE.Group[]>([]);
  useFrame((_, dt) => {
    if (grp.current) {
      grp.current.position.y = Math.sin(performance.now() * 0.004) * 0.08;
      grp.current.rotation.y += dt * 0.4;
    }
    for (const r of rotors.current) if (r) r.rotation.y += dt * 30;
  });
  const arms = [
    [0.55, 0, 0.55],
    [-0.55, 0, 0.55],
    [0.55, 0, -0.55],
    [-0.55, 0, -0.55],
  ] as const;
  return (
    <FormGroup active={active}>
      <group ref={grp}>
        {/* chassis */}
        <mesh>
          <boxGeometry args={[0.5, 0.15, 0.5]} />
          <meshStandardMaterial color="#1c1c22" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* underslung camera */}
        <mesh position={[0, -0.13, 0.05]}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} metalness={0.6} roughness={0.2} />
        </mesh>
        {arms.map((p, i) => (
          <group key={i} position={p as unknown as [number, number, number]}>
            {/* arm */}
            <mesh position={[-p[0] * 0.35, 0, -p[2] * 0.35]} rotation={[0, Math.atan2(-p[2], -p[0]), 0]}>
              <boxGeometry args={[0.7, 0.05, 0.05]} />
              <meshStandardMaterial color="#2a2a30" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* motor */}
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
              <meshStandardMaterial color="#404048" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* rotor */}
            <group ref={(el) => { if (el) rotors.current[i] = el; }} position={[0, 0.14, 0]}>
              <mesh>
                <boxGeometry args={[0.55, 0.01, 0.04]} />
                <meshStandardMaterial color="#111" transparent opacity={0.75} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[0.55, 0.01, 0.04]} />
                <meshStandardMaterial color="#111" transparent opacity={0.75} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
      <pointLight color={color} intensity={1.4} distance={4} position={[0, -0.2, 0]} />
    </FormGroup>
  );
}

function Crystal({ color, active }: { color: string; active: boolean }) {
  const grp = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (grp.current) {
      grp.current.rotation.y += dt * 0.35;
      grp.current.rotation.z = Math.sin(performance.now() * 0.0015) * 0.1;
    }
  });
  return (
    <FormGroup active={active}>
      <group ref={grp}>
        <mesh>
          <octahedronGeometry args={[1.05, 0]} />
          <meshPhysicalMaterial
            color="#c7e8ff"
            metalness={0.1}
            roughness={0.05}
            transmission={0.9}
            thickness={1.2}
            ior={1.6}
            emissive={color}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh scale={0.5}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
      </group>
      <pointLight color={color} intensity={2} distance={5} />
    </FormGroup>
  );
}

function Brain({ color, active }: { color: string; active: boolean }) {
  const grp = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const arr: Array<[number, number, number]> = [];
    for (let i = 0; i < 60; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 0.85 + Math.random() * 0.15;
      arr.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]);
    }
    return arr;
  }, []);
  const edges = useMemo(() => {
    const e: Array<[number, number]> = [];
    for (let i = 0; i < nodes.length; i++) {
      let closest = -1, dmin = Infinity;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const d = dx * dx + dy * dy + dz * dz;
        if (d < dmin) { dmin = d; closest = j; }
      }
      if (closest > i) e.push([i, closest]);
    }
    return e;
  }, [nodes]);
  const lineGeo = useMemo(() => {
    const positions: number[] = [];
    for (const [a, b] of edges) {
      positions.push(...nodes[a], ...nodes[b]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [edges, nodes]);
  useFrame((_, dt) => {
    if (grp.current) grp.current.rotation.y += dt * 0.25;
  });
  return (
    <FormGroup active={active}>
      <group ref={grp}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshPhysicalMaterial color="#0a0d18" transmission={0.5} thickness={1} roughness={0.1} emissive={color} emissiveIntensity={0.4} />
        </mesh>
        {nodes.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
        ))}
        <lineSegments geometry={lineGeo}>
          <lineBasicMaterial color={color} transparent opacity={0.55} />
        </lineSegments>
      </group>
      <pointLight color={color} intensity={2} distance={5} />
    </FormGroup>
  );
}

function Scene({ form, mood, size }: { form: AetherForm; mood: AetherMood; size: "hud" | "large" }) {
  const color = MOOD_COLOR[mood] ?? "#7fd0ff";
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} />
      <Orb color={color} active={form === "orb"} />
      <Rocket color={color} active={form === "rocket"} />
      <Satellite color={color} active={form === "satellite"} />
      <Drone color={color} active={form === "drone"} />
      <Crystal color={color} active={form === "crystal"} />
      <Brain color={color} active={form === "brain"} />
      <EffectComposer>
        <Bloom intensity={size === "large" ? 1.4 : 0.9} luminanceThreshold={0.3} luminanceSmoothing={0.35} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export function AetherAvatar3D({
  form,
  mood,
  size = 96,
  variant = "hud",
}: {
  form: AetherForm;
  mood: AetherMood;
  size?: number;
  variant?: "hud" | "large";
}) {
  return (
    <div style={{ width: size, height: size }} className="pointer-events-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 3.6], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <Scene form={form} mood={mood} size={variant} />
      </Canvas>
    </div>
  );
}
