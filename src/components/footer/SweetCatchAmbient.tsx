import type { CSSProperties } from "react";

/** Soft side sparkles — decorative only (reads on blush marble, not sci-fi starfield). */
const STAR_SEEDS: ReadonlyArray<{
  side: "left" | "right";
  top: string;
  delay: string;
  dur: string;
  size: number;
}> = [
  { side: "left", top: "22%", delay: "0s", dur: "11s", size: 5 },
  { side: "right", top: "30%", delay: "-2s", dur: "13s", size: 4 },
  { side: "left", top: "42%", delay: "-4s", dur: "12s", size: 6 },
  { side: "right", top: "55%", delay: "-1s", dur: "14s", size: 5 },
  { side: "left", top: "68%", delay: "-6s", dur: "10s", size: 4 },
];

export function SweetCatchStarfield() {
  return (
    <div className="sweet-catch-arcane__stars" aria-hidden>
      {STAR_SEEDS.map((s, i) => (
        <span
          key={i}
          className={`sweet-catch-arcane__star sweet-catch-arcane__star--${s.side}`}
          style={
            {
              top: s.top,
              animationDelay: s.delay,
              animationDuration: s.dur,
              "--star-size": `${s.size}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
