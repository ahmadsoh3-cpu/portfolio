"use client";

import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { STATIONS, stageAt, STAGES, type StationDef } from "@/lib/journey";
import { progressRef } from "@/lib/store";

// Start downloads immediately; every board must be on the bench.
if (typeof window !== "undefined") {
  useGLTF.setDecoderPath("/draco/");
  STATIONS.forEach((s) => useGLTF.preload(s.url));
}

/** One bad asset must never blank the rest of the bench. */
class StationBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.error("[bench] station failed to load:", err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Station({ def }: { def: StationDef }) {
  const { scene } = useGLTF(def.url);
  const root = useRef<THREE.Group>(null!);
  const spinGroup = useRef<THREE.Group>(null!);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null!);

  // The scroll window where this station should be drawn. Outside it (plus a
  // margin so it eases in before the camera arrives) the whole group is hidden,
  // so its meshes cost nothing in the draw or bloom passes.
  const window = useMemo(() => {
    const stage = STAGES.find((s) => s.id === def.id);
    if (!stage) return [0, 1] as const;
    return [stage.range[0] - 0.1, stage.range[1] + 0.1] as const;
  }, [def.id]);

  /** Auto-orient (thinnest axis → up), normalise scale, centre at origin. */
  const model = useMemo(() => {
    // Clone so we never mutate the shared GLTF cache object.
    const clone = scene.clone(true);

    const dims = new THREE.Box3().setFromObject(clone).getSize(new THREE.Vector3());
    if (dims.z <= dims.x && dims.z <= dims.y) clone.rotation.x = -Math.PI / 2;
    else if (dims.x <= dims.y && dims.x <= dims.z) clone.rotation.z = Math.PI / 2;
    clone.updateMatrixWorld(true);

    const holder = new THREE.Group();
    holder.add(clone);
    const box = new THREE.Box3().setFromObject(holder);
    const size = box.getSize(new THREE.Vector3());
    holder.scale.setScalar(def.size / Math.max(size.x, size.z));

    // Centre by shifting the clone, not the holder, which keeps the holder at the
    // origin so the parent <group position={def.position}> places it correctly.
    const box2 = new THREE.Box3().setFromObject(holder);
    const centre = box2.getCenter(new THREE.Vector3());
    // Undo the holder's scale before applying to clone's local position.
    clone.position.sub(centre.divideScalar(holder.scale.x));

    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          const std = m as THREE.MeshStandardMaterial;
          if (std.isMeshStandardMaterial) std.envMapIntensity = 0.9;
        }
      }
    });
    return holder;
  }, [scene, def.size]);

  useFrame(({ clock }, delta) => {
    const p = progressRef.current;
    const visible = p >= window[0] && p <= window[1];

    if (root.current) root.current.visible = visible;
    if (!visible) return; // off-stage: no transforms, no draw, no bloom

    const active = stageAt(p).id === def.id;

    // slow idle turntable, a touch faster while the camera is visiting
    if (spinGroup.current) {
      spinGroup.current.rotation.y += delta * (active ? 0.22 : 0.05);
      spinGroup.current.position.y =
        Math.sin(clock.elapsedTime * 0.8 + def.position[0]) * 0.035;
    }

    const m = ringMat.current;
    if (m) {
      const target = active ? 0.6 : 0.14;
      m.opacity = THREE.MathUtils.lerp(m.opacity, target, 0.06);
      if (active) m.opacity += Math.sin(clock.elapsedTime * 3.0) * 0.06;
    }
  });

  return (
    <group ref={root}>
      <group position={def.position}>
        <group ref={spinGroup}>
          <primitive object={model} />
        </group>
      </group>
      {/* bench docking-pad ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[def.position[0], -0.52, def.position[2]]}
      >
        <ringGeometry args={[def.size * 0.6, def.size * 0.63, 56]} />
        <meshBasicMaterial
          ref={ringMat}
          color="#00FFF0"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function Bench() {
  return (
    <group>
      {STATIONS.map((s) => (
        <StationBoundary key={s.id}>
          <Suspense fallback={null}>
            <Station def={s} />
          </Suspense>
        </StationBoundary>
      ))}
    </group>
  );
}
