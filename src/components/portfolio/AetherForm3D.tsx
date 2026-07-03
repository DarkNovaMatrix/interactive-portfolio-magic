import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Icosahedron, Box, Torus, MeshDistortMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Emotion, Form } from "@/lib/aether-state";

const EMOTION_COLOR: Record<Emotion, string> = {
  curious: "#f0a060",
  happy: "#ffcf6e",
  excited: "#ff5a3c",
  focused: "#6ab0ff",
  sleepy: "#7d70b0",
  playful: "#ff7ad4",
  thoughtful: "#7fc7c7",
  surprised: "#ffd460",
  proud: "#ff8a3d",
  shy: "#e7b5d8",
};

function EntityMesh({ form, emotion, active }: { form: Form; emotion: Emotion; active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<any>(null);
  const color = EMOTION_COLOR[emotion];

  useFrame((_, dt) => {
    if (!ref.current) return;
    const rot = form === "cube" ? 1.2 : form === "arrow" ? 0.4 : 0.6;
    ref.current.rotation.y += dt * rot;
    ref.current.rotation.x += dt * rot * 0.4;
    const s = active ? 1.05 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.08);
    if (matRef.current && "distort" in matRef.current) {
      const target =
        emotion === "excited" ? 0.55 :
        emotion === "playful" ? 0.5 :
        emotion === "sleepy" ? 0.15 :
        emotion === "focused" ? 0.1 : 0.32;
      matRef.current.distort = THREE.MathUtils.lerp(matRef.current.distort, target, 0.05);
    }
  });

  const mat = (
    <MeshDistortMaterial
      ref={matRef}
      color={color}
      emissive={color}
      emissiveIntensity={1.1}
      roughness={0.15}
      metalness={0.55}
      distort={0.32}
      speed={2}
    />
  );

  return (
    <group ref={ref}>
      {form === "orb" && <Icosahedron args={[1, 4]}>{mat}</Icosahedron>}
      {form === "blob" && <Icosahedron args={[1.05, 5]}>{mat}</Icosahedron>}
      {form === "cube" && <Box args={[1.4, 1.4, 1.4]}>{mat}</Box>}
      {form === "spark" && (
        <>
          <Icosahedron args={[0.55, 3]}>{mat}</Icosahedron>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0]}
                rotation={[0, 0, a]}
              >
                <coneGeometry args={[0.12, 0.6, 6]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} />
              </mesh>
            );
          })}
        </>
      )}
      {form === "arrow" && (
        <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <coneGeometry args={[0.42, 0.7, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
          </mesh>
        </group>
      )}
      {form === "constellation" && <ConstellationForm color={color} />}
      {form !== "constellation" && form !== "spark" && form !== "arrow" && form !== "cube" && (
        // decorative ring
        <Torus args={[1.6, 0.02, 8, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.5} />
        </Torus>
      )}
    </group>
  );
}

function ConstellationForm({ color }: { color: string }) {
  const nodes = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const phi = Math.acos(-1 + (2 * i) / 8);
      const theta = Math.sqrt(8 * Math.PI) * phi;
      pts.push([Math.cos(theta) * Math.sin(phi) * 1.1, Math.sin(theta) * Math.sin(phi) * 1.1, Math.cos(phi) * 1.1]);
    }
    return pts;
  }, []);
  const linePoints = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        arr.push(new THREE.Vector3(...nodes[i]));
        arr.push(new THREE.Vector3(...nodes[j]));
      }
    }
    return arr;
  }, [nodes]);
  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints(linePoints);
    return g;
  }, [linePoints]);
  return (
    <group>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} />
        </mesh>
      ))}
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial color={color} transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

export function AetherForm3D({
  form,
  emotion,
  active,
  size = 110,
}: {
  form: Form;
  emotion: Emotion;
  active: boolean;
  size?: number;
}) {
  const color = EMOTION_COLOR[emotion];
  return (
    <div style={{ width: size, height: size }} className="pointer-events-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.6], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[3, 3, 3]} intensity={2.5} color={color} distance={12} />
        <pointLight position={[-3, -2, -2]} intensity={1.2} color="#8090ff" distance={12} />
        <EntityMesh form={form} emotion={emotion} active={active} />
        <EffectComposer>
          <Bloom intensity={1.6} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
