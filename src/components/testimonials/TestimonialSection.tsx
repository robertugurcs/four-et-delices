"use client";

import { Jost } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslations } from "@/i18n/LocaleProvider";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const TESTIMONIAL_NAMES = ["Mrs. Samb", "BB Binta"] as const;

const LEFT_SRC = "/assets/testimonials/left.webp";
const RIGHT_SRC = "/assets/testimonials/right.webp";

/* Pasted from testimonial-section.html — do not change */
const START_OFFS = 116;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function TestimonialSection() {
  const t = useTranslations();
  const testimonials = useMemo(
    () => [
      { name: TESTIMONIAL_NAMES[0], text: t.home.testimonial1 },
      { name: TESTIMONIAL_NAMES[1], text: t.home.testimonial2 },
    ],
    [t.home.testimonial1, t.home.testimonial2],
  );
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardLRef = useRef<HTMLDivElement>(null);
  const cardRRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const update = useCallback(() => {
    const section = sectionRef.current;
    const cardL = cardLRef.current;
    const cardR = cardRRef.current;
    if (!section || !cardL || !cardR) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cardL.style.transform = "translateX(0)";
      cardR.style.transform = "translateX(0)";
      return;
    }
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    const raw = (viewH - rect.top) / (viewH * 0.85);
    const prog = Math.max(0, Math.min(1, raw));
    const eased = easeInOutCubic(prog);
    const off = (1 - eased) * START_OFFS;
    cardL.style.transform = `translateX(${off}%)`;
    cardR.style.transform = `translateX(-${off}%)`;
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [update]);

  useEffect(() => {
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  function switchTo(i: number) {
    if (i === current) return;
    setFading(true);
    window.setTimeout(() => {
      setCurrent(i);
      setFading(false);
    }, 360);
  }

  const testimonial = testimonials[current];

  return (
    <section
      className={`testimonial-section ${jost.className}`}
      aria-labelledby="testimonials-heading"
    >
      <div className="testimonial-heading">
        <p className="testimonial-label">{t.home.testimonialsLabel}</p>
        <h2 id="testimonials-heading" className="testimonial-title">
          {t.home.testimonialsTitle1}
          <br />
          {t.home.testimonialsTitle2}
        </h2>
      </div>

      <div
        ref={sectionRef}
        className="testimonial-wrapper"
        id="testimonialSection"
      >
        <div className="center-panel">
          <div className="center-inner">
            <div className="stars" aria-label={t.home.fiveStars}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className={`quote-block${fading ? " fading" : ""}`}>
              <p className="reviewer-name">{testimonial.name}</p>
              <p className="quote-text">{testimonial.text}</p>
            </div>
            <nav className="nav-controls" aria-label={t.home.testimonialNav}>
              <button
                type="button"
                className="nav-arrow"
                aria-label={t.home.testimonialPrev}
                onClick={() =>
                  switchTo(
                    (current - 1 + testimonials.length) % testimonials.length,
                  )
                }
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="nav-dots">
                {testimonials.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`nav-dot${i === current ? " active" : ""}`}
                    aria-label={t.home.testimonialGoTo.replace("{n}", String(i + 1))}
                    aria-pressed={i === current}
                    onClick={() => switchTo(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="nav-arrow"
                aria-label={t.home.testimonialNext}
                onClick={() => switchTo((current + 1) % testimonials.length)}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </nav>
          </div>
        </div>

        <div className="card card-left" ref={cardLRef}>
          <img src={LEFT_SRC} alt="" width={800} height={1200} />
        </div>
        <div className="card card-right" ref={cardRRef}>
          <img src={RIGHT_SRC} alt="" width={800} height={1200} />
        </div>
      </div>
    </section>
  );
}
