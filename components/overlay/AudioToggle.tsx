"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ambient soundtrack, defaulting to ON.
 *
 * Browsers block autoplay-with-sound until the user interacts with the page,
 * so we cannot force audio before any gesture. Instead we treat "on" as the
 * intended state: we attempt to play immediately, and if the browser blocks
 * it we arm one-shot listeners (pointerdown / keydown / scroll) that start
 * playback on the very first interaction. The button then just toggles.
 */
export default function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  // `wanted` is the user's intent; `playing` is whether audio is actually
  // sounding. We default wanted=true so the control reads "SOUND ON".
  const [wanted, setWanted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  // Try to start playback, return whether it succeeded.
  async function start() {
    const el = audioRef.current;
    if (!el) return false;
    try {
      await el.play();
      setPlaying(true);
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.35;
    el.loop = true;

    const onError = () => setAvailable(false);
    el.addEventListener("error", onError);

    // Respect users who prefer reduced motion: don't auto-start for them.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setWanted(false);
      return () => el.removeEventListener("error", onError);
    }

    let cleanupGesture = () => {};

    (async () => {
      const ok = await start();
      if (ok) return;
      // Autoplay blocked: unlock on the first user gesture anywhere.
      const unlock = async () => {
        const started = await start();
        if (started) cleanupGesture();
      };
      const opts = { once: false, passive: true } as AddEventListenerOptions;
      window.addEventListener("pointerdown", unlock, opts);
      window.addEventListener("keydown", unlock, opts);
      window.addEventListener("scroll", unlock, opts);
      window.addEventListener("wheel", unlock, opts);
      cleanupGesture = () => {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("scroll", unlock);
        window.removeEventListener("wheel", unlock);
      };
    })();

    return () => {
      el.removeEventListener("error", onError);
      cleanupGesture();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      setWanted(false);
    } else {
      setWanted(true);
      await start();
    }
  }

  if (!available) return null;

  // The label reflects intent so it reads "SOUND ON" from first paint even
  // while the browser is still waiting for a gesture to actually start it.
  const sounding = playing;

  return (
    <>
      <audio ref={audioRef} src="/ambient.mp3" preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={sounding ? "Mute ambient sound" : "Play ambient sound"}
        aria-pressed={sounding}
        className="fixed bottom-10 left-6 z-40 flex items-center gap-2 rounded-[1px] border border-edge bg-panel/70 px-3 py-2 font-mono text-[0.58rem] tracking-[0.2em] text-muted backdrop-blur-md transition-colors duration-200 hover:border-signal hover:text-signal"
      >
        <span className="flex items-end gap-[2px] h-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-[2px] bg-current ${sounding ? "eq-bar" : ""}`}
              style={{
                height: sounding ? undefined : "40%",
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </span>
        {wanted ? "SOUND ON" : "SOUND OFF"}
      </button>
    </>
  );
}
