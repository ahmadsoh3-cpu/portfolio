"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { ANCHORS, MODEL_SCALE, stageAt } from "@/lib/journey";
import { progressRef, useJourney } from "@/lib/store";

useGLTF.setDecoderPath("/draco/");
useGLTF.preload("/models/multimeter.glb");

/** Stage id -> multimeter anchor that glows while that stage is active. */
const STAGE_ANCHOR: Array<[string, THREE.Vector3]> = [
  ["input", ANCHORS.acInput],
  ["conditioning", ANCHORS.relay],
  ["divider", ANCHORS.divider],
  ["amplifier", ANCHORS.lm358],
  ["mcu", ANCHORS.mcu],
  ["display", ANCHORS.display],
];

function HighlightRing({ anchor, stageId }: { anchor: THREE.Vector3; stageId: string }) {
  const ring = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ clock }) => {
    const active = stageAt(progressRef.current).id === stageId;
    const m = mat.current;
    const r = ring.current;
    if (!m || !r) return;
    m.opacity = THREE.MathUtils.lerp(m.opacity, active ? 0.85 : 0, 0.08);
    if (m.opacity > 0.01) {
      r.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3.2) * 0.07);
      r.visible = true;
    } else {
      r.visible = false;
    }
  });

  return (
    <mesh ref={ring} position={[anchor.x, 0.06, anchor.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.34, 0.4, 48]} />
      <meshBasicMaterial
        ref={mat}
        color="#00FFF0"
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function Board() {
  const { scene } = useGLTF("/models/multimeter.glb");
  const setReady = useJourney((s) => s.setReady);

  const board = useMemo(() => {
    // Palette targets. The raw KiCad model ships with a bright green solder
    // mask and yellow-green silkscreen that clash with the cyan/blue UI. We
    // detect those materials by hue and retint them into the site palette,
    // while leaving copper, gold pads and dark components alone.
    const maskColor = new THREE.Color("#0a2e33"); // deep teal solder mask
    const silkColor = new THREE.Color("#cfe9ec"); // cool off-white silkscreen
    const copperWarm = new THREE.Color("#d99a5b"); // warm copper accent
    const hsl = { h: 0, s: 0, l: 0 };

    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial;
        if (!std.isMeshStandardMaterial) continue;

        std.envMapIntensity = 0.9;
        if (std.metalness > 0.5) std.roughness = Math.min(std.roughness, 0.45);

        // Only retint untextured flat-colour materials (mask/silk/copper are
        // solid colours; textured parts keep their maps).
        if (std.map) continue;

        std.color.getHSL(hsl);
        const c = std.color;

        const isGreenMask =
          hsl.h > 0.18 && hsl.h < 0.45 && hsl.s > 0.25 && hsl.l < 0.6;
        const isYellowSilk =
          hsl.h > 0.1 && hsl.h < 0.2 && hsl.s > 0.3 && hsl.l > 0.45;
        const isBrightGreenSilk =
          hsl.h > 0.2 && hsl.h < 0.45 && hsl.l >= 0.6;

        if (isGreenMask) {
          c.copy(maskColor);
          std.roughness = Math.min(std.roughness ?? 0.7, 0.85);
          std.metalness = 0.0;
        } else if (isYellowSilk || isBrightGreenSilk) {
          c.copy(silkColor);
          std.metalness = 0.0;
        } else if (
          // copper-ish: orange/red hue, give it a consistent warm tone so it
          // reads as a single accent against the teal board
          hsl.h < 0.12 &&
          hsl.s > 0.2 &&
          std.metalness > 0.4
        ) {
          c.lerp(copperWarm, 0.4);
        }
      }
    });
    return scene;
  }, [scene]);

  useEffect(() => {
    setReady(true);
  }, [setReady]);

  return (
    <group>
      <primitive object={board} scale={MODEL_SCALE} />
      {STAGE_ANCHOR.map(([id, a]) => (
        <HighlightRing key={id} anchor={a} stageId={id} />
      ))}
      {/* bench deck glow running under every station */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.5, -0.55, 0]}>
        <planeGeometry args={[64, 26]} />
        <meshBasicMaterial color="#06121d" transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </group>
  );
}
