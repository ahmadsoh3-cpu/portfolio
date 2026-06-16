import * as THREE from "three";

/**
 * THE TEST BENCH
 * The multimeter (a digital twin of the real KiCad board) sits at the origin.
 * Every project board is a permanent "station" further down the bench — all
 * models are in the scene the whole time. One continuous signal is the
 * storyteller: it travels the multimeter's real measurement chain, reaches
 * the LCD, then leaves the board and visits every station in turn.
 *
 * Multimeter anchors are real component positions measured from the GLB
 * node transforms (TQFP-32 ATmega328, LM358 DIP-8s, G5V-2 relay, LM317,
 * 16 MHz crystal, J3 LCD header), scaled by MODEL_SCALE.
 */
export const MODEL_SCALE = 40;

const A = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const H = 0.14; // signal routing height just above the copper

export const ANCHORS = {
  acInput: A(-1.85, H, 1.45),
  protection: A(-1.3, H, 1.25),
  relay: A(-0.8, 0.5, 0.4),
  divider: A(-1.55, H, 1.05),
  lm358: A(-1.6, 0.2, 0.8),
  adcTrace: A(-0.8, H, 0.6),
  mcu: A(0, 0.18, 0.4),
  crystal: A(0, H, 0.0),
  lcdHeader: A(-2.0, 0.2, -1.2),
  display: A(-0.35, H, -1.05),
  exitPad: A(2.2, H, -1.45),
} as const;

/** ---- Bench stations (the other real boards) ------------------------- */

export interface StationDef {
  id: string; // must match a stage id
  url: string;
  position: [number, number, number];
  size: number; // target footprint in world units
}

export const STATIONS: StationDef[] = [
  { id: "iot", url: "/models/iot.glb", position: [5.6, 0.55, 0.4], size: 2.2 },
  { id: "supercap", url: "/models/supercap.glb", position: [9.6, 0.6, -0.5], size: 2.4 },
  { id: "motor", url: "/models/motordrive.glb", position: [13.6, 0.6, 0.3], size: 2.6 },
  // "Motor control plus" — the drive shown in its vehicle / e-axle context.
  { id: "motorplus", url: "/models/motorplus.glb", position: [18.6, 0.95, -0.4], size: 4.6 },
];

/** ---- Signal paths ---------------------------------------------------- */

/** 1) The multimeter's real measurement chain, routed like a real trace —
 *  runs and 45° corner waypoints instead of loose freeform arcs. */
export const SIGNAL_POINTS: THREE.Vector3[] = [
  A(-3.8, 0.5, 2.9),
  A(-2.4, 0.22, 1.95), // approach drops to board level
  ANCHORS.acInput,
  A(-1.6, H, 1.45), // run right
  ANCHORS.protection,
  A(-1.05, 0.3, 1.0), // 45° toward the relay, lifting over R-bank
  ANCHORS.relay,
  A(-1.2, 0.3, 0.75), // back down-left toward the divider
  ANCHORS.divider,
  A(-1.6, H, 0.95),
  ANCHORS.lm358, // buffer
  A(-1.25, H, 0.7), // 45° exit from the op-amp
  ANCHORS.adcTrace,
  A(-0.4, H, 0.6), // straight run on the ADC net
  A(-0.15, H, 0.45),
  ANCHORS.mcu,
  A(0.18, H, 0.18), // out of the MCU, past the crystal
  ANCHORS.crystal.clone().add(A(0.3, 0, 0.05)),
  A(-0.5, H, -0.25), // long 45° run across the board
  A(-1.6, H, -0.85),
  ANCHORS.lcdHeader,
  A(-1.6, H, -1.2), // along the header row
  A(-1.0, H, -1.12),
  ANCHORS.display,
];

/** 2) The bench run: display → exit pad → every station, rising into each. */
export const BENCH_POINTS: THREE.Vector3[] = [
  ANCHORS.display,
  A(0.9, H, -1.3),
  ANCHORS.exitPad,
  A(3.6, 0.3, 0.2),
  A(5.6, 0.7, 0.4), // IoT board
  A(7.6, 0.3, -0.1),
  A(9.6, 0.75, -0.5), // supercap bank
  A(11.6, 0.3, -0.1),
  A(13.6, 0.75, 0.3), // motor drive
  A(16.0, 0.4, 0.0),
  A(18.6, 1.05, -0.4), // motor drive in vehicle
];

/** 3) Exit pulse during the contact stage. */
export const EXIT_POINTS: THREE.Vector3[] = [
  A(18.6, 1.05, -0.4),
  A(20.6, 0.6, -0.9),
  A(23.4, 1.0, -1.3),
];

export const SIGNAL_WINDOW: [number, number] = [0.045, 0.44];
export const BENCH_WINDOW: [number, number] = [0.44, 0.86];
export const EXIT_WINDOW: [number, number] = [0.93, 0.99];

/** ---- Stages ----------------------------------------------------------- */

export interface StageDef {
  id: string;
  range: [number, number];
  label: string;
  net: string;
}

export const STAGES: StageDef[] = [
  { id: "hero", range: [0.0, 0.06], label: "POWER ON", net: "VDC +9V" },
  { id: "input", range: [0.06, 0.12], label: "VOLTAGE INPUT", net: "J5 · AC VIN" },
  { id: "conditioning", range: [0.12, 0.18], label: "INPUT CONDITIONING", net: "D1–D4 · G5V-2" },
  { id: "divider", range: [0.18, 0.24], label: "VOLTAGE DIVIDER", net: "R10 / R8 · 10K/100K" },
  { id: "amplifier", range: [0.24, 0.3], label: "LM358 BUFFER", net: "U3 · ADC0" },
  { id: "mcu", range: [0.3, 0.38], label: "ATMEGA328 PROCESSING", net: "U7 · TQFP-32" },
  { id: "display", range: [0.38, 0.48], label: "DISPLAY OUTPUT", net: "J3 · I²C LCD" },
  { id: "iot", range: [0.48, 0.58], label: "IOT MULTI-MCU BOARD", net: "ESP8266 + NANO · I²C" },
  { id: "supercap", range: [0.58, 0.68], label: "SUPERCAP ENERGY BANK", net: "BCAP3400 · 2S×14P" },
  { id: "motor", range: [0.68, 0.78], label: "3-PHASE MOTOR DRIVE", net: "SPWM · 48V E-AXLE" },
  { id: "motorplus", range: [0.78, 0.88], label: "E-AXLE IN VEHICLE", net: "48V HEV INTEGRATION" },
  { id: "skills", range: [0.88, 0.94], label: "TOOLCHAIN", net: "BOM" },
  { id: "contact", range: [0.94, 1.0], label: "SIGNAL OUT", net: "TP1 · OUTPUT" },
];

/** ---- Camera ----------------------------------------------------------- */

interface CamKey {
  p: number;
  pos: THREE.Vector3;
  tgt: THREE.Vector3;
}

export const CAMERA_KEYS: CamKey[] = [
  { p: 0.0, pos: A(-2.6, 6.2, 9.4), tgt: A(1.7, 0.2, -0.3) },
  { p: 0.06, pos: A(-4.4, 2.5, 4.8), tgt: A(-1.85, 0, 1.45) },
  { p: 0.12, pos: A(-3.5, 1.7, 3.2), tgt: A(-1.3, 0, 1.1) },
  { p: 0.18, pos: A(-3.3, 1.6, 2.2), tgt: A(-1.6, 0, 0.85) },
  { p: 0.24, pos: A(-2.0, 2.0, 2.3), tgt: A(-0.8, 0, 0.55) },
  { p: 0.3, pos: A(0.7, 2.3, 2.5), tgt: A(0, 0, 0.35) },
  { p: 0.38, pos: A(0.2, 2.9, 0.7), tgt: A(-0.35, 0, -1.0) },
  { p: 0.48, pos: A(3.6, 2.2, 3.6), tgt: A(5.6, 0.5, 0.4) },
  { p: 0.58, pos: A(7.7, 2.3, 2.8), tgt: A(9.6, 0.55, -0.5) },
  { p: 0.68, pos: A(11.6, 2.4, 3.4), tgt: A(13.6, 0.55, 0.3) },
  { p: 0.78, pos: A(15.3, 3.4, 4.6), tgt: A(18.6, 0.9, -0.4) },
  { p: 0.88, pos: A(9.0, 12.0, 11.0), tgt: A(9.0, 0, -0.2) },
  { p: 0.94, pos: A(21.8, 2.6, 3.4), tgt: A(20.2, 0.7, -0.9) },
  { p: 1.0, pos: A(24.6, 3.8, 5.0), tgt: A(22.0, 0.8, -1.3) },
];

/**
 * Dynamic per-chapter camera: while a station's stage is active the camera
 * sweeps an arc around the board (peaking mid-chapter, zero at both ends so
 * stage transitions stay seamless) and dollies slightly closer.
 */
export const STAGE_ORBIT: Record<string, number> = {
  display: 0.18,
  iot: 0.62,
  supercap: -0.66,
  motor: 0.62,
  motorplus: -0.85,
};

const _dir = new THREE.Vector3();

export function applyOrbit(progress: number, pos: THREE.Vector3, tgt: THREE.Vector3) {
  const stage = stageAt(progress);
  const sweep = STAGE_ORBIT[stage.id];
  if (!sweep) return;
  const [a, b] = stage.range;
  const local = THREE.MathUtils.clamp((progress - a) / (b - a), 0, 1);
  const wave = Math.sin(local * Math.PI); // 0 → 1 → 0
  const angle = sweep * wave;

  _dir.subVectors(pos, tgt);
  const x = _dir.x * Math.cos(angle) - _dir.z * Math.sin(angle);
  const z = _dir.x * Math.sin(angle) + _dir.z * Math.cos(angle);
  _dir.x = x;
  _dir.z = z;
  _dir.multiplyScalar(1 - 0.16 * wave); // gentle dolly-in at the apex
  pos.copy(tgt).add(_dir);
}

export function sampleCamera(progress: number, outPos: THREE.Vector3, outTgt: THREE.Vector3) {
  const keys = CAMERA_KEYS;
  if (progress <= keys[0].p) {
    outPos.copy(keys[0].pos);
    outTgt.copy(keys[0].tgt);
    return;
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (progress >= a.p && progress <= b.p) {
      const t = THREE.MathUtils.smoothstep((progress - a.p) / (b.p - a.p), 0, 1);
      outPos.lerpVectors(a.pos, b.pos, t);
      outTgt.lerpVectors(a.tgt, b.tgt, t);
      return;
    }
  }
  outPos.copy(keys[keys.length - 1].pos);
  outTgt.copy(keys[keys.length - 1].tgt);
}

/** ---- Helpers ----------------------------------------------------------- */

export function remap01(v: number, a: number, b: number) {
  return THREE.MathUtils.clamp((v - a) / (b - a), 0, 1);
}

export const VOLT_STEPS = [1.0, 1.25, 1.5, 2.0, 3.0, 4.0, 5.0];

export function voltageAt(progress: number): { volts: number; done: boolean } {
  const t = remap01(progress, 0.38, 0.455);
  if (t >= 1) return { volts: 5.0, done: true };
  const idx = Math.min(VOLT_STEPS.length - 1, Math.floor(t * VOLT_STEPS.length));
  return { volts: VOLT_STEPS[idx], done: false };
}

export function stageAt(progress: number): StageDef {
  for (const s of STAGES) if (progress >= s.range[0] && progress < s.range[1]) return s;
  return STAGES[STAGES.length - 1];
}
