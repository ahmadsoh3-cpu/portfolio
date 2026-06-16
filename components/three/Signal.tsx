"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  SIGNAL_POINTS,
  BENCH_POINTS,
  EXIT_POINTS,
  SIGNAL_WINDOW,
  BENCH_WINDOW,
  EXIT_WINDOW,
  remap01,
} from "@/lib/journey";
import { progressRef } from "@/lib/store";

const SIGNAL_COLOR = new THREE.Color("#00FFF0");
const TRACE_COLOR = new THREE.Color("#3B82F6");

const traceVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const traceFragment = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uHot;
  uniform vec3 uCold;
  varying vec2 vUv;

  void main() {
    float x = vUv.x;
    float d = x - uProgress;

    // un-energised route ahead: faint dashed preview, like an unrouted net
    float dash = step(0.55, fract(x * 90.0));
    float ahead = step(0.0, d) * (0.025 + 0.045 * dash);

    // energised trail behind the head
    float trail = step(d, 0.0) * (exp(d * 7.0) * 0.85 + 0.14);

    // charge carriers: bright pulses drifting along the conductor
    float carriers = step(d, 0.0)
      * smoothstep(0.55, 1.0, sin(x * 140.0 - uTime * 9.0) * 0.5 + 0.5)
      * (0.55 + 0.45 * exp(d * 5.0));

    // signal head
    float head = smoothstep(0.014, 0.0, abs(d)) * 2.6;

    float energy = ahead + trail + carriers + head;
    vec3 col = mix(uCold, uHot, clamp(trail * 1.1 + carriers + head, 0.0, 1.0));
    float alpha = clamp(energy, 0.0, 1.0);
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(col * (0.55 + energy), alpha);
  }
`;

function makeTrailMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: traceVertex,
    fragmentShader: traceFragment,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uHot: { value: SIGNAL_COLOR },
      uCold: { value: TRACE_COLOR },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

function SignalRun({
  points,
  window: win,
  radius = 0.035,
  segments = 240,
  tension = 0.35,
}: {
  points: THREE.Vector3[];
  window: [number, number];
  radius?: number;
  segments?: number;
  tension?: number;
}) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points, false, "catmullrom", tension),
    [points, tension]
  );
  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, segments, radius, 7, false),
    [curve, radius, segments]
  );
  const material = useMemo(makeTrailMaterial, []);
  const head = useRef<THREE.Group>(null!);
  const light = useRef<THREE.PointLight>(null!);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = remap01(progressRef.current, win[0], win[1]);
    material.uniforms.uProgress.value = t;
    material.uniforms.uTime.value = performance.now() / 1000;
    if (!head.current) return;
    const visible = t > 0.001 && t < 0.999;
    head.current.visible = visible;
    if (light.current) light.current.visible = visible;
    if (visible) {
      curve.getPointAt(t, tmp);
      head.current.position.copy(tmp);
      if (light.current) {
        light.current.position.copy(tmp);
        light.current.intensity = 3.2 + Math.sin(clock.elapsedTime * 14) * 0.5;
      }
    }
  });

  return (
    <group>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
      <group ref={head}>
        <mesh>
          <sphereGeometry args={[0.06, 14, 14]} />
          <meshBasicMaterial color="#CFFFFB" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshBasicMaterial
            color="#00FFF0"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
      <pointLight ref={light} color="#00FFF0" intensity={3.2} distance={2.6} decay={2} />
    </group>
  );
}

export default function Signal() {
  return (
    <group>
      {/* the multimeter's real measurement chain */}
      <SignalRun points={SIGNAL_POINTS} window={SIGNAL_WINDOW} segments={300} tension={0.06} />
      {/* the bench run: display → exit pad → every project board */}
      <SignalRun points={BENCH_POINTS} window={BENCH_WINDOW} radius={0.05} segments={360} tension={0.5} />
      {/* exit pulse at the contact stage */}
      <SignalRun points={EXIT_POINTS} window={EXIT_WINDOW} radius={0.04} segments={64} />
    </group>
  );
}
