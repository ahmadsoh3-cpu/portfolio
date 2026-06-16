"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { sampleCamera, applyOrbit } from "@/lib/journey";
import { progressRef, useJourney } from "@/lib/store";

export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const reduced = useJourney((s) => s.reducedMotion);

  const goalPos = useMemo(() => new THREE.Vector3(0.2, 9, 9.6), []);
  const goalTgt = useMemo(() => new THREE.Vector3(), []);
  const lerpTo = useMemo(() => new THREE.Vector3(), []);
  const curTgt = useRef(new THREE.Vector3());
  const pointer = useRef({ x: 0, y: 0 });
  const initialised = useRef(false);

  useFrame((state, delta) => {
    // Cap delta so a tab switch / stalled frame doesn't snap the camera.
    const dt = Math.min(delta, 0.05);

    sampleCamera(progressRef.current, goalPos, goalTgt);
    if (!reduced) applyOrbit(progressRef.current, goalPos, goalTgt);

    // gentle parallax from the pointer for a hand-held feel
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, state.pointer.x, 0.05);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, state.pointer.y, 0.05);
    const px = reduced ? 0 : pointer.current.x * 0.25;
    const py = reduced ? 0 : pointer.current.y * 0.15;

    if (!initialised.current) {
      camera.position.copy(goalPos);
      curTgt.current.copy(goalTgt);
      initialised.current = true;
    }

    // Exponential smoothing: framerate-independent, never overshoots.
    // halfLife ≈ 0.12 s → camera settles in ~0.4 s, feels responsive but smooth.
    const halfLife = reduced ? 0.001 : 0.12;
    const damp = 1 - Math.pow(2, -dt / halfLife);

    lerpTo.set(goalPos.x + px, goalPos.y + py, goalPos.z);
    camera.position.lerp(lerpTo, damp);
    curTgt.current.lerp(goalTgt, damp);
    camera.lookAt(curTgt.current);
  });

  return null;
}
