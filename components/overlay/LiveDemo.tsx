"use client";

import { useEffect, useRef, useState } from "react";
import { progressRef } from "@/lib/store";
import { voltageAt, remap01 } from "@/lib/journey";

/**
 * The LCD reads scroll progress from progressRef (updated every scroll tick)
 * via its own rAF loop, NOT from the Zustand store. The store only changes at
 * stage boundaries, so reading it here would freeze the voltage at its first
 * value; rAF lets the reading actually ramp 1.00 -> 5.00 V as you scroll
 * through the display stage.
 */
export default function LiveDemo() {
  const [volts, setVolts] = useState(1.0);
  const [done, setDone] = useState(false);
  const [sampling, setSampling] = useState(0);
  const [visible, setVisible] = useState(false);

  // refs hold the last committed value so we only call setState on real change
  const last = useRef({ volts: 1.0, done: false, sampling: -1, visible: false });

  useEffect(() => {
    let rafId: number;
    function tick() {
      const p = progressRef.current;
      const { volts: v, done: d } = voltageAt(p);
      // quantise the sampling bar to whole percents to avoid setState spam
      const s = Math.round(remap01(p, 0.38, 0.455) * 100) / 100;
      const vis = p > 0.37 && p < 0.5;

      const l = last.current;
      if (v !== l.volts) {
        l.volts = v;
        setVolts(v);
      }
      if (d !== l.done) {
        l.done = d;
        setDone(d);
      }
      if (s !== l.sampling) {
        l.sampling = s;
        setSampling(s);
      }
      if (vis !== l.visible) {
        l.visible = vis;
        setVisible(vis);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      className={`mx-auto w-full max-w-lg transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="lcd relative overflow-hidden p-6 md:p-8">
        <div className="lcd-scan pointer-events-none absolute inset-0" />

        <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-[0.25em] text-[#5fd9cf]">
          <span>DC&nbsp;V&nbsp;·&nbsp;AUTO</span>
          <span>{done ? "HOLD" : "SAMPLING"}</span>
        </div>

        <div className="lcd-digits mt-2 text-center text-7xl md:text-8xl leading-none">
          {volts.toFixed(2)}
          <span className="ml-2 align-top text-3xl md:text-4xl text-[#6fe8de]">V</span>
        </div>

        {/* ADC sampling bar */}
        <div className="mt-6 h-1.5 overflow-hidden rounded bg-[#0c211c]">
          <div
            className="h-full rounded bg-signal shadow-[0_0_14px_#00FFF0] transition-[width] duration-150"
            style={{ width: `${sampling * 100}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] tracking-[0.2em] text-[#3f6a63]">
          <span>ADC0 · 10-BIT · AVCC REF</span>
          <span>{Math.round(sampling * 1023)} / 1023</span>
        </div>
      </div>

      <p
        className={`mt-6 text-center font-mono text-sm tracking-[0.3em] text-signal transition-all duration-700 ${
          done ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        MEASUREMENT COMPLETE
      </p>
      <p
        className={`mt-2 text-center text-sm text-muted transition-opacity duration-700 delay-150 ${
          done ? "opacity-100" : "opacity-0"
        }`}
      >
        Sampled on ADC0, scaled through the divider network, computed on the
        ATmega328 and written to the LCD, exactly how the real board does it.
      </p>
      <p
        className={`mt-3 text-center font-mono text-[0.6rem] tracking-[0.2em] text-[#3f6a63] transition-opacity duration-700 delay-300 ${
          done ? "opacity-100" : "opacity-0"
        }`}
      >
        DC 0–2 V / 0–20 V · AC 0–20 VP-P · SINE 200 HZ – 7 KHZ @ 5 VP-P
      </p>
    </div>
  );
}
