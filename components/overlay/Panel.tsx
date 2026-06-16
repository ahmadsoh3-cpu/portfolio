"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface PanelProps {
  /** vertical placement in vh inside the 1300vh journey (start of stage × 1200) */
  topVh: number;
  /** total wrapper height in vh; >100 makes the inner content sticky */
  heightVh?: number;
  side?: "left" | "right" | "center";
  wide?: boolean;
  children: React.ReactNode;
}

export default function Panel({
  topVh,
  heightVh = 100,
  side = "left",
  wide = false,
  children,
}: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        reduced ? { opacity: 0 } : { opacity: 0, y: 56, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: reduced ? 0.2 : 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const align =
    side === "left"
      ? "justify-start"
      : side === "right"
        ? "justify-end"
        : "justify-center";
  const sticky = heightVh > 100;

  return (
    <div
      className="absolute left-0 right-0"
      style={{ top: `${topVh}vh`, height: `${heightVh}vh` }}
    >
      <div
        className={`${sticky ? "sticky top-0" : ""} flex h-screen items-center px-5 md:px-16 ${align}`}
      >
        <div
          ref={ref}
          className={`pointer-events-auto w-full ${wide ? "max-w-4xl" : "max-w-md"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function Ticks() {
  return (
    <>
      <i className="tick-tr" aria-hidden />
      <i className="tick-bl" aria-hidden />
    </>
  );
}

export function PanelCard({
  net,
  title,
  children,
  chips,
}: {
  net: string;
  title: string;
  children?: React.ReactNode;
  chips?: string[];
}) {
  return (
    <article className="panel p-6 md:p-8">
      <Ticks />
      <p className="net-tag mb-3">{net}</p>
      <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-paper">
        {title}
      </h2>
      {children && (
        <div className="mt-3 text-[0.92rem] leading-relaxed text-[#aab6c6]">{children}</div>
      )}
      {chips && (
        <ul className="mt-5 flex flex-wrap gap-2" role="list">
          {chips.map((c) => (
            <li key={c} className="chip">
              {c}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
