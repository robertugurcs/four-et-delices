"use client";

import { useEffect, useRef } from "react";

import { ensureVideoPlays } from "@/lib/ensure-video-plays";

type HeroProps = {
  /** Portrait footage: vertical framing via `globals.css` (.hero-video--portrait-crop, e.g. center 45%). */
  portraitCrop?: boolean;
};

export default function Hero({ portraitCrop }: HeroProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    return ensureVideoPlays(video);
  }, []);

  return (
    <section
      aria-label="Introduction"
      className="relative min-h-[100svh] min-h-screen w-full overflow-hidden bg-neutral-950"
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        loop
        preload="auto"
        poster="/assets/hero-poster.jpg"
        controls={false}
        className={`hero-video absolute inset-0 ${portraitCrop ? "hero-video--portrait-crop" : ""}`}
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
      </video>

      <div
        className="hero-overlay pointer-events-none z-[1]"
        aria-hidden
      />

      <div className="pointer-events-auto absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <p className="hero-text font-serif text-lg font-normal tracking-[0.02em] drop-shadow-none sm:text-xl">
          Custom Cake Studio
        </p>
        <a
          href="/inquiry"
          className="hero-text text-sm font-medium underline-offset-4 hover:underline"
        >
          Inquire
        </a>
      </div>
    </section>
  );
}
