"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { progressRef, lastStageRef, useJourney } from "@/lib/store";
import { stageAt } from "@/lib/journey";
import Hud from "./overlay/Hud";
import AudioToggle from "./overlay/AudioToggle";
import {
  Hero,
  JourneyPanels,
  AboutPanel,
  ExperiencePanel,
  DemoSection,
  ProjectChapters,
  SkillsSection,
  ContactSection,
} from "./overlay/Sections";

const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * The journey is a 1600vh scroll. ScrollTrigger maps document scroll to a
 * single progress value (0..1); the camera rig, signal shader, highlight
 * rings and HUD all derive from it, so nothing can fall out of sync.
 */
export default function Experience() {
  const main = useRef<HTMLDivElement>(null);
  const setProgress = useJourney((s) => s.setProgress);
  const setReducedMotion = useJourney((s) => s.setReducedMotion);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);

    const st = ScrollTrigger.create({
      trigger: main.current,
      start: "top top",
      end: "bottom bottom",
      // scrub: 0.6 adds a 0.6s ease between raw scroll and the progress value,
      // smoothing out abrupt wheel/trackpad events without feeling laggy.
      scrub: 0.6,
      onUpdate: (self) => {
        progressRef.current = self.progress;

        // Only push to Zustand (which re-renders React) when the stage changes.
        // Everything else (camera, signal, rings) reads progressRef directly
        // in useFrame, for zero React overhead per scroll tick.
        const stageId = stageAt(self.progress).id;
        if (stageId !== lastStageRef.current) {
          lastStageRef.current = stageId;
          setProgress(self.progress);
        }
      },
    });

    return () => st.kill();
  }, [setProgress, setReducedMotion]);

  return (
    <>
      <Scene />
      <div className="atmosphere-grid" aria-hidden />
      <div className="atmosphere-grain" aria-hidden />
      <Hud />
      <AudioToggle />
      <main
        ref={main}
        className="relative z-10 pointer-events-none"
        style={{ height: "1600vh" }}
      >
        <h1 className="sr-only">
          Muhammad Ahmad Sohail, Electrical and Electronic Engineer portfolio
        </h1>
        <Hero />
        <JourneyPanels />
        <AboutPanel />
        <ExperiencePanel />
        <DemoSection />
        <ProjectChapters />
        <SkillsSection />
        <ContactSection />
      </main>
    </>
  );
}
