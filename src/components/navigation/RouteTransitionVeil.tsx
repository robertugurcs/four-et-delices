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

/** Shared layout — wave 0 rims the viewport, wave 1 fills mid, wave 2 caps gaps. */
const FILL_LAYOUT: Array<{
  left: string;
  top: string;
  size: string;
  from: OrbSpec["from"];
  wave: number;
  slot: number;
}> = [
  { left: "-22%", top: "-16%", size: "min(74vw, 600px)", from: "left", wave: 0, slot: 0 },
  { left: "52%", top: "-20%", size: "min(72vw, 580px)", from: "top", wave: 0, slot: 1 },
  { left: "78%", top: "-14%", size: "min(68vw, 550px)", from: "right", wave: 0, slot: 2 },
  { left: "-20%", top: "28%", size: "min(66vw, 530px)", from: "left", wave: 0, slot: 0 },
  { left: "82%", top: "24%", size: "min(70vw, 560px)", from: "right", wave: 0, slot: 1 },
  { left: "-18%", top: "62%", size: "min(72vw, 580px)", from: "bottom", wave: 0, slot: 2 },
  { left: "38%", top: "70%", size: "min(78vw, 620px)", from: "bottom", wave: 0, slot: 0 },
  { left: "76%", top: "64%", size: "min(64vw, 520px)", from: "right", wave: 0, slot: 1 },

  { left: "2%", top: "4%", size: "min(60vw, 480px)", from: "top", wave: 1, slot: 0 },
  { left: "40%", top: "2%", size: "min(58vw, 460px)", from: "top", wave: 1, slot: 1 },
  { left: "6%", top: "38%", size: "min(56vw, 450px)", from: "left", wave: 1, slot: 2 },
  { left: "54%", top: "34%", size: "min(62vw, 500px)", from: "right", wave: 1, slot: 0 },
  { left: "14%", top: "54%", size: "min(54vw, 430px)", from: "bottom", wave: 1, slot: 1 },
  { left: "44%", top: "44%", size: "min(66vw, 530px)", from: "bottom", wave: 1, slot: 2 },
  { left: "64%", top: "52%", size: "min(52vw, 420px)", from: "right", wave: 1, slot: 0 },

  { left: "24%", top: "18%", size: "min(50vw, 400px)", from: "top", wave: 2, slot: 1 },
  { left: "30%", top: "30%", size: "min(76vw, 610px)", from: "bottom", wave: 2, slot: 0 },
  { left: "50%", top: "14%", size: "min(48vw, 390px)", from: "left", wave: 2, slot: 2 },
  { left: "58%", top: "40%", size: "min(58vw, 470px)", from: "right", wave: 2, slot: 1 },
];

const WAVE_GAP_MS = 420;
const SLOT_STAGGER_MS = 70;

const PALETTES: Record<RouteTransitionMood, string[]> = {
  kids: ["#f4d03f", "#e85d75", "#b794f6", "#fbd9e5", "#f4a62a", "#d45a8f", "#fff4c2", "#c43670"],
  weddings: ["#e8e4dc", "#c9b8a8", "#9db4a0", "#f5f1ea", "#b8a99a", "#d4cfc4", "#ede8e0"],
  birthdays: ["#f4a62a", "#fbd9e5", "#e85d75", "#fff0d6", "#c43670", "#ffc857", "#f8c4d8"],
  corporate: ["#c43670", "#f5d0e8", "#9a2858", "#fbd9e5", "#b32f64", "#e8a4c8", "#d45a8f"],
  default: ["#fbd9e5", "#c43670", "#fbf4eb", "#f4a62a", "#e85d75", "#b794f6", "#f8e4d4"],
};

function buildMoodOrbs(mood: RouteTransitionMood): OrbSpec[] {
  const palette = PALETTES[mood];
  return FILL_LAYOUT.map((pos, index) => ({
    color: palette[index % palette.length],
    size: pos.size,
    left: pos.left,
    top: pos.top,
    from: pos.from,
    delay: `${pos.wave * WAVE_GAP_MS + pos.slot * SLOT_STAGGER_MS}ms`,
  }));
}

const ORBS_BY_MOOD: Record<RouteTransitionMood, OrbSpec[]> = {
  kids: buildMoodOrbs("kids"),
  weddings: buildMoodOrbs("weddings"),
  birthdays: buildMoodOrbs("birthdays"),
  corporate: buildMoodOrbs("corporate"),
  default: buildMoodOrbs("default"),
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
 * Playful balloon / ball-pit veil — orbs wash in from the edges in waves and
 * slowly blanket the viewport while the next route loads underneath.
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
    }, 720);
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
        <div className="route-transition-veil__wash" aria-hidden />
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
