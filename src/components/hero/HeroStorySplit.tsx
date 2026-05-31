"use client";

import { useEffect, useRef } from "react";

export function HeroStorySplit() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const text = textRef.current;
    const media = mediaRef.current;

    if (!section || !headline || !text || !media) return;

    let raf = 0;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

    const update = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const headlineRect = headline.getBoundingClientRect();
      const textRect = text.getBoundingClientRect();

      /*
       * Okuma sırasında tamamen nötr — başlık + metin blok olarak hâlâ “önümde”.
       * Blok görsel olarak yukarı kayınca saga/sola; kısa mesafede tamamlanıyor.
       */
      const copyFloor = Math.max(headlineRect.bottom, textRect.bottom);
      const idleLine = vh * 0.52;
      const band = vh * 0.24;

      if (copyFloor > idleLine) {
        headline.style.transform = "translate3d(0,0,0) rotate(0deg)";
        text.style.transform = "translate3d(0,0,0) rotate(0deg)";
        media.style.transform = "translate3d(0,0,0) rotate(0deg)";
        headline.style.opacity = "1";
        text.style.opacity = "1";
        media.style.opacity = "1";
        return;
      }

      const rawProgress = clamp((idleLine - copyFloor) / band, 0, 1);
      const eased = easeOutCubic(rawProgress);

      headline.style.transform = `translate3d(${eased * -220}px, ${eased * 18}px, 0) rotate(${eased * -10}deg)`;
      text.style.transform = `translate3d(${eased * -120}px, ${eased * 38}px, 0) rotate(${eased * -5}deg)`;
      media.style.transform = `translate3d(${eased * 210}px, ${eased * -150}px, 0) rotate(${eased * 8}deg)`;

      headline.style.opacity = String(clamp(1 - eased * 0.65, 0.35, 1));
      text.style.opacity = String(clamp(1 - eased * 0.7, 0.3, 1));
      media.style.opacity = String(clamp(1 - eased * 0.45, 0.55, 1));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="story-split"
      aria-labelledby="story-split-title"
    >
      <div className="story-split__copy">
        <h2
          ref={headlineRef}
          id="story-split-title"
          className="story-split__headline"
        >
          <span className="story-split__line story-split__line--1">EVERY</span>

          <span className="story-split__line story-split__line--2">
            CELEBRATION
            <img
              src="/icons/celebration.svg"
              alt=""
              aria-hidden
              className="story-split__icon"
            />
          </span>

          <span className="story-split__line story-split__line--3">
            DESERVES A
          </span>

          <span className="story-split__line story-split__line--4">
            MASTERPIECE
          </span>
        </h2>

        <p ref={textRef} className="story-split__text">
          Four et Délices creates bespoke celebration cakes with sculptural
          detail, delicate finishes, and made-to-order designs for celebrations
          that deserve something unforgettable.
        </p>
      </div>

      <div ref={mediaRef} className="story-split__media">
        <video
          playsInline
          autoPlay
          muted
          loop
          preload="auto"
          poster="/assets/hero-poster.jpg"
          className="story-split__video"
        >
          <source src="/assets/hero-video3.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
