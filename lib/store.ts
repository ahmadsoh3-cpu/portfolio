import { create } from "zustand";

interface JourneyState {
  /** 0..1 scroll progress across the whole experience (updated every frame). */
  progress: number;
  ready: boolean;
  reducedMotion: boolean;
  setProgress: (p: number) => void;
  setReady: (r: boolean) => void;
  setReducedMotion: (r: boolean) => void;
}

export const useJourney = create<JourneyState>((set) => ({
  progress: 0,
  ready: false,
  reducedMotion: false,
  setProgress: (progress) => set({ progress }),
  setReady: (ready) => set({ ready }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));

/**
 * A mutable ref read inside useFrame without re-rendering React.
 * The scroll handler writes here every scroll event; Zustand state is only
 * updated when the HUD needs a re-render (stage change).
 */
export const progressRef = { current: 0 };

/**
 * Tracks the last stage id pushed to Zustand so we only call setProgress
 * when the active stage actually changes (avoids thrashing React on every
 * scroll tick — the HUD only cares about stage transitions, not sub-tick
 * progress values).
 */
export const lastStageRef = { current: "" };
