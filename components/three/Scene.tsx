"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import Board from "./Board";
import Signal from "./Signal";
import Bench from "./Bench";
import CameraRig from "./CameraRig";

/** Offline image-based lighting; no CDN HDR fetch. */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    return () => {
      scene.environment = null;
      envTexture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

/**
 * The stutter on first approach was deferred GPU work: WebGL compiles a
 * material's shader program the first time that material is actually drawn,
 * and uploads textures lazily. Flying the camera toward the board made all
 * of that happen in one frame. Here we force every shader to compile and
 * every texture to upload up front, while the loading veil is still showing,
 * so the first real frames are already warm.
 */
function Prewarm() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const lastCount = useRef(0);
  const stableFrames = useRef(0);

  useFrame(() => {
    // Re-warm whenever new objects appear (stations stream in async), then
    // stop once the scene graph has been stable for a short while.
    let count = 0;
    scene.traverse(() => count++);

    if (count !== lastCount.current) {
      lastCount.current = count;
      stableFrames.current = 0;
      try {
        gl.compile(scene, camera);
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) {
            const std = m as THREE.MeshStandardMaterial;
            if (std.map) gl.initTexture(std.map);
            if (std.normalMap) gl.initTexture(std.normalMap);
            if (std.roughnessMap) gl.initTexture(std.roughnessMap);
            if (std.metalnessMap) gl.initTexture(std.metalnessMap);
          }
        });
      } catch {
        /* best-effort warm-up */
      }
    } else {
      stableFrames.current++;
    }
  });

  return null;
}

export default function Scene() {
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        camera={{ position: [0.2, 9, 9.6], fov: 42, near: 0.1, far: 60 }}
        dpr={[1, small ? 1.25 : 1.5]}
        gl={{
          antialias: small,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          alpha: false,
        }}
        // Cap pixel ratio defensively; some browsers report DPR 3+.
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.25 : 1.5));
        }}
      >
        <color attach="background" args={["#05070A"]} />
        <fog attach="fog" args={["#05070A", 16, 40]} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[4, 8, 4]} intensity={1.15} color="#eef3ff" />
        <directionalLight position={[-6, 4, -4]} intensity={0.45} color="#3B82F6" />

        <Suspense fallback={null}>
          <StudioEnvironment />
          <Board />
          <Signal />
          <Bench />
        </Suspense>

        <Prewarm />
        <CameraRig />
        <AdaptiveDpr pixelated />

        {!small && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.85}
              luminanceThreshold={0.78}
              luminanceSmoothing={0.2}
              mipmapBlur
              resolutionScale={0.5}
              kernelSize={2}
            />
            <Vignette eskil={false} offset={0.18} darkness={0.78} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
