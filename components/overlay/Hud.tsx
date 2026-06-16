"use client";

import { useEffect, useRef } from "react";
import { useProgress } from "@react-three/drei";
import { useJourney, progressRef } from "@/lib/store";
import { stageAt, STAGES } from "@/lib/journey";

export default function Hud() {
  // Only subscribes to stage-level changes (not every scroll tick).
  const stageProgress = useJourney((s) => s.progress);
  const ready = useJourney((s) => s.ready);
  const { progress: load, active } = useProgress();
  const stage = stageAt(stageProgress);
  const stageIndex = STAGES.findIndex((s) => s.id === stage.id);
  const booted = ready && !active;

  // The progress bar and telemetry text update via rAF directly on the DOM
  // so they stay smooth without triggering React re-renders on every tick.
  const barRef = useRef<HTMLDivElement>(null);
  const telemetryPRef = useRef<HTMLSpanElement>(null);
  const telemetryXRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId: number;
    function tick() {
      const p = progressRef.current;
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      if (telemetryPRef.current) telemetryPRef.current.textContent = `P ${p.toFixed(3)}`;
      if (telemetryXRef.current)
        telemetryXRef.current.textContent = `BENCH X ${(p * 22).toFixed(1)} M`;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <>
      {/* top instrument bar */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-start justify-between px-5 pt-5 md:px-8 pointer-events-none">
        <div className="font-mono text-[0.62rem] leading-relaxed tracking-[0.22em] text-muted">
          <span className="text-paper">M.A.SOHAIL</span>
          <span className="mx-2 text-[#2a3646]">·</span>EEE
          <br />
          <span className="text-[#39434f]">REV A · 2026</span>
        </div>
        <div className="hidden sm:block text-right font-mono text-[0.62rem] leading-relaxed tracking-[0.2em]">
          <span className="text-signal">
            {stage.label}
            <span className="blink">_</span>
          </span>
          <br />
          <span className="text-[#39434f]">
            {stage.net} · {String(stageIndex + 1).padStart(2, "0")}/{STAGES.length}
          </span>
        </div>
      </header>

      {/* left rail: stage ticks. Labels reveal on hover so the active label
          never bleeds into the hero title; the lit tick shows progress. */}
      <nav
        aria-label="Signal path progress"
        className="group/rail fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-[7px] md:flex"
      >
        {STAGES.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className={`block h-px transition-all duration-300 ${
                i <= stageIndex ? "w-5 bg-signal" : "w-3 bg-edge"
              }`}
            />
            <span
              className={`font-mono text-[0.55rem] tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover/rail:opacity-100 ${
                i === stageIndex ? "text-signal" : "text-muted"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </nav>

      {/* bottom progress trace + telemetry */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="hidden md:flex items-end justify-between px-8 pb-2 font-mono text-[0.55rem] tracking-[0.22em] text-[#39434f] pointer-events-none">
          <span ref={telemetryPRef}>P 0.000</span>
          <span ref={telemetryXRef}>BENCH X 0.0 M</span>
        </div>
        <div className="h-[2px] bg-edge/60">
          <div
            ref={barRef}
            className="h-full bg-gradient-to-r from-trace to-signal shadow-[0_0_12px_#00FFF0]"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* scroll hint, hero only */}
      <div
        className={`fixed bottom-8 left-1/2 z-30 -translate-x-1/2 font-mono text-[0.65rem] tracking-[0.3em] text-muted transition-opacity duration-700 ${
          stageProgress < 0.02 && booted ? "opacity-100" : "opacity-0"
        }`}
      >
        SCROLL TO INJECT SIGNAL ↓
      </div>

      {/* boot veil with real asset progress */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-ink transition-opacity duration-700 ${
          booted ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="font-mono text-xs tracking-[0.3em] text-signal">
          CALIBRATING<span className="blink">_</span>
        </div>
        <div className="h-px w-44 bg-edge">
          <div
            className="h-full bg-signal shadow-[0_0_10px_#00FFF0] transition-[width] duration-200"
            style={{ width: `${Math.round(load)}%` }}
          />
        </div>
        <div className="font-mono text-[0.6rem] tracking-[0.25em] text-[#39434f]">
          {Math.round(load)}% · LOADING BOARDS
        </div>
      </div>
    </>
  );
}
