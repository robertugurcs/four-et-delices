"use client";

import { useEffect, useState } from "react";

import type { RouteTransitionMood } from "@/lib/route-transition";

type VeilState = {
  visible: boolean;
  exiting: boolean;
  mood: RouteTransitionMood;
};

type OrbSpec = {
  color: string;
  size: string;
  left: string;
  top: string;
  delay: string;
  from: "left" | "right" | "bottom" | "top";
};

const ORBS_BY_MOOD: Record<RouteTransitionMood, OrbSpec[]> = {
  kids: [
    { color: "#f4d03f", size: "min(52vw, 420px)", left: "-18%", top: "8%", delay: "0ms", from: "left" },
    { color: "#e85d75", size: "min(44vw, 360px)", left: "62%", top: "-12%", delay: "40ms", from: "top" },
    { color: "#b794f6", size: "min(48vw, 400px)", left: "78%", top: "22%", delay: "70ms", from: "right" },
    { color: "#fbd9e5", size: "min(40vw, 320px)", left: "12%", top: "48%", delay: "100ms", from: "left" },
    { color: "#f4a62a", size: "min(56vw, 460px)", left: "38%", top: "58%", delay: "130ms", from: "bottom" },
    { color: "#d45a8f", size: "min(36vw, 300px)", left: "72%", top: "62%", delay: "160ms", from: "right" },
    { color: "#fff4c2", size: "min(32vw, 260px)", left: "48%", top: "12%", delay: "50ms", from: "top" },
    { color: "#c43670", size: "min(42vw, 340px)", left: "-8%", top: "72%", delay: "190ms", from: "bottom" },
  ],
  weddings: [
    { color: "#e8e4dc", size: "min(50vw, 400px)", left: "-16%", top: "10%", delay: "0ms", from: "left" },
    { color: "#c9b8a8", size: "min(46vw, 380px)", left: "68%", top: "-10%", delay: "50ms", from: "top" },
    { color: "#9db4a0", size: "min(44vw, 360px)", left: "80%", top: "30%", delay: "80ms", from: "right" },
    { color: "#f5f1ea", size: "min(38vw, 310px)", left: "10%", top: "52%", delay: "110ms", from: "left" },
    { color: "#b8a99a", size: "min(54vw, 440px)", left: "36%", top: "60%", delay: "140ms", from: "bottom" },
    { color: "#d4cfc4", size: "min(34vw, 280px)", left: "74%", top: "68%", delay: "170ms", from: "right" },
  ],
  birthdays: [
    { color: "#f4a62a", size: "min(50vw, 400px)", left: "-14%", top: "6%", delay: "0ms", from: "left" },
    { color: "#fbd9e5", size: "min(46vw, 380px)", left: "70%", top: "-8%", delay: "45ms", from: "top" },
    { color: "#e85d75", size: "min(42vw, 340px)", left: "82%", top: "28%", delay: "75ms", from: "right" },
    { color: "#fff0d6", size: "min(40vw, 320px)", left: "8%", top: "50%", delay: "105ms", from: "left" },
    { color: "#c43670", size: "min(52vw, 420px)", left: "34%", top: "62%", delay: "135ms", from: "bottom" },
    { color: "#ffc857", size: "min(36vw, 290px)", left: "76%", top: "70%", delay: "165ms", from: "right" },
  ],
  corporate: [
    { color: "#c43670", size: "min(48vw, 390px)", left: "-16%", top: "8%", delay: "0ms", from: "left" },
    { color: "#f5d0e8", size: "min(44vw, 360px)", left: "66%", top: "-10%", delay: "40ms", from: "top" },
    { color: "#9a2858", size: "min(40vw, 330px)", left: "80%", top: "26%", delay: "70ms", from: "right" },
    { color: "#fbd9e5", size: "min(38vw, 300px)", left: "12%", top: "48%", delay: "100ms", from: "left" },
    { color: "#b32f64", size: "min(54vw, 430px)", left: "38%", top: "58%", delay: "130ms", from: "bottom" },
    { color: "#e8a4c8", size: "min(34vw, 280px)", left: "72%", top: "66%", delay: "160ms", from: "right" },
  ],
  default: [
    { color: "#fbd9e5", size: "min(46vw, 380px)", left: "-14%", top: "10%", delay: "0ms", from: "left" },
    { color: "#c43670", size: "min(42vw, 340px)", left: "74%", top: "-6%", delay: "50ms", from: "top" },
    { color: "#fbf4eb", size: "min(50vw, 400px)", left: "80%", top: "32%", delay: "80ms", from: "right" },
    { color: "#f4a62a", size: "min(38vw, 310px)", left: "6%", top: "54%", delay: "110ms", from: "left" },
    { color: "#e85d75", size: "min(52vw, 420px)", left: "32%", top: "64%", delay: "140ms", from: "bottom" },
    { color: "#b794f6", size: "min(34vw, 280px)", left: "70%", top: "72%", delay: "170ms", from: "right" },
  ],
};

function readVeilState(): Pick<VeilState, "visible" | "mood"> {
  const root = document.documentElement;
  const mood = root.dataset.routeMood as RouteTransitionMood | undefined;
  return {
    visible: root.dataset.routeTransition === "true",
    mood:
      mood && mood in ORBS_BY_MOOD ? mood : "default",
  };
}

/**
 * Playful balloon / ball-pit veil during client navigations — masks Suspense
 * loading gaps so users never stare at a blank cream page.
 */
export function RouteTransitionVeil() {
  const [state, setState] = useState<VeilState>({
    visible: false,
    exiting: false,
    mood: "default",
  });

  useEffect(() => {
    const sync = () => {
      const next = readVeilState();
      setState((prev) => {
        if (next.visible) {
          return { visible: true, exiting: false, mood: next.mood };
        }
        if (prev.visible) {
          return { visible: false, exiting: true, mood: prev.mood };
        }
        return { visible: false, exiting: false, mood: "default" };
      });
    };

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-route-transition", "data-route-mood"],
    });
    sync();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!state.exiting) return;
    const timer = window.setTimeout(() => {
      setState((prev) => ({ ...prev, exiting: false, mood: "default" }));
    }, 520);
    return () => window.clearTimeout(timer);
  }, [state.exiting]);

  if (!state.visible && !state.exiting) return null;

  const orbs = ORBS_BY_MOOD[state.mood];

  return (
    <div
      className={`route-transition-veil${state.exiting ? " route-transition-veil--exit" : ""}`}
      data-route-veil-mood={state.mood}
      aria-hidden
    >
      <div className="route-transition-veil__pool">
        {orbs.map((orb, index) => (
          <span
            key={`${state.mood}-${index}`}
            className={`route-transition-veil__orb route-transition-veil__orb--from-${orb.from}`}
            style={{
              ["--orb-color" as string]: orb.color,
              ["--orb-size" as string]: orb.size,
              ["--orb-left" as string]: orb.left,
              ["--orb-top" as string]: orb.top,
              ["--orb-delay" as string]: orb.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
