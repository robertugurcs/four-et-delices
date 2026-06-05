"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useTranslations } from "@/i18n/LocaleProvider";

const MIN_DISTANCE = 38;
const MAX_VISIBLE = 10;
const LIFE_MS = 1900;
const CARD_WIDTH = 360;
const CARD_HEIGHT = 440;

/** Align trail with custom knife cursor tip (blade vs mouse hotspot); see CustomCursor.tsx */
const CURSOR_TIP_OFFSET_X = 10;
const CURSOR_TIP_OFFSET_Y = 14;

const IMAGES = [
  "/assets/reveal/B-1-1.webp",
  "/assets/reveal/B-2-1.webp",
  "/assets/reveal/B-3-1.webp",
  "/assets/reveal/B-4-1.webp",
  "/assets/reveal/C-1-1.webp",
  "/assets/reveal/C-2-1.webp",
  "/assets/reveal/C-3-1.webp",
  "/assets/reveal/C-4-1.webp",
  "/assets/reveal/K-1-1.webp",
  "/assets/reveal/K-2-1.webp",
  "/assets/reveal/K-3-1.webp",
  "/assets/reveal/K-4-1.webp",
  "/assets/reveal/W-1-1.webp",
  "/assets/reveal/W-2-1.webp",
  "/assets/reveal/W-3-1.webp",
  "/assets/reveal/W-4-1.webp",
];

type TrailImage = {
  id: number;
  src: string;
  x: number;
  y: number;
  rotateDeg: number;
};

function shuffleImages(images: string[], previousLast?: string) {
  const shuffled = [...images];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  if (previousLast && shuffled[0] === previousLast && shuffled.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

export default function TasteRevealSection() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const indexRef = useRef(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastImageRef = useRef<string | undefined>(undefined);
  const sequenceRef = useRef<string[]>([]);
  const [trailImages, setTrailImages] = useState<TrailImage[]>([]);

  useEffect(() => {
    sequenceRef.current = shuffleImages(IMAGES);
  }, []);

  const getNextImage = () => {
    if (!sequenceRef.current.length) {
      sequenceRef.current = shuffleImages(IMAGES, lastImageRef.current);
      indexRef.current = 0;
    }

    const src = sequenceRef.current[indexRef.current];
    indexRef.current += 1;

    if (indexRef.current >= sequenceRef.current.length) {
      lastImageRef.current = src;
      sequenceRef.current = shuffleImages(IMAGES, lastImageRef.current);
      indexRef.current = 0;
    } else {
      lastImageRef.current = src;
    }

    return src;
  };

  useEffect(() => {
    const section = sectionRef.current;
    const trail = trailRef.current;
    if (!section || !trail) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;

    if (reducedMotion || !finePointer) return;

    let cancelled = false;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = trail.getBoundingClientRect();
      const halfW = CARD_WIDTH / 2;
      const halfH = CARD_HEIGHT / 2;
      const redAreaStartY = Math.max(48, halfH);
      const pointerY = event.clientY - rect.top;
      if (pointerY < redAreaStartY) return;

      const rawX = event.clientX - rect.left + CURSOR_TIP_OFFSET_X;
      const rawY = event.clientY - rect.top + CURSOR_TIP_OFFSET_Y;
      const x = Math.max(halfW, Math.min(rect.width - halfW, rawX));
      const y = Math.max(redAreaStartY, Math.min(rect.height - halfH, rawY));

      const lastPoint = lastPointRef.current;
      let rotateDeg = 0;
      if (lastPoint) {
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < MIN_DISTANCE) return;
        const pathAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
        rotateDeg = Math.max(-2, Math.min(2, pathAngleDeg * 0.028));
      }

      lastPointRef.current = { x, y };

      const src = getNextImage();

      const image: TrailImage = {
        id: idRef.current++,
        src,
        x,
        y,
        rotateDeg,
      };

      setTrailImages((prev) => [...prev, image].slice(-MAX_VISIBLE));

      window.setTimeout(() => {
        if (cancelled) return;
        setTrailImages((prev) => prev.filter((item) => item.id !== image.id));
      }, LIFE_MS);
    };

    trail.addEventListener("pointermove", handlePointerMove);

    return () => {
      cancelled = true;
      trail.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <section ref={sectionRef} className="taste-reveal" aria-label={t.home.tasteSection}>
      <div className="taste-reveal__content">
        <h2
          className="taste-reveal__title"
          aria-label={t.home.tasteTitle}
        >
          <span className="taste-reveal__title-line taste-reveal__title-line--top">
            {t.home.tasteLine1}
          </span>
          <span className="taste-reveal__title-line taste-reveal__title-line--middle">
            {t.home.tasteLine2}
          </span>
          <span className="taste-reveal__title-line taste-reveal__title-line--bottom">
            {t.home.tasteLine3}
          </span>
        </h2>
      </div>

      <div className="taste-reveal__red-zone" aria-hidden>
        <div ref={trailRef} className="taste-reveal__trail">
          {trailImages.map((image) => (
            <div
              key={image.id}
              className="taste-reveal__trail-image"
              style={{
                ["--x" as string]: `${image.x}px`,
                ["--y" as string]: `${image.y}px`,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                zIndex: image.id,
                ["--trail-rot" as string]: `${image.rotateDeg}deg`,
              }}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="380px"
                quality={100}
                className="taste-reveal__img"
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="taste-reveal__mobile-collage taste-reveal__mobile-collage--fallback"
        role="region"
        aria-roledescription="carousel"
        aria-label={t.home.tasteGallery.replace("{count}", String(IMAGES.length))}
      >
        {IMAGES.map((src, index) => (
          <div
            key={src}
            className={
              index < 3
                ? `taste-reveal__mobile-card taste-reveal__mobile-card--${index + 1}`
                : "taste-reveal__mobile-card"
            }
            aria-roledescription="slide"
            aria-label={t.home.tasteSlide
              .replace("{index}", String(index + 1))
              .replace("{total}", String(IMAGES.length))}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 1024px) min(52vw, 200px), 220px"
              className="taste-reveal__img"
            />
          </div>
        ))}
      </div>

      {/* Phones only (CSS): slow auto-scroll strip; duplicates enable seamless loop */}
      <div className="taste-reveal__mobile-marquee" aria-hidden="true">
        <div className="taste-reveal__mobile-marquee-track">
          {[...IMAGES, ...IMAGES].map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="taste-reveal__mobile-marquee-card"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="min(52vw, 200px)"
                className="taste-reveal__img"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
