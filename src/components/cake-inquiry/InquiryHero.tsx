"use client";

import { useTranslations } from "@/i18n/LocaleProvider";

const FLOATS = [
  { emoji: "🎂", left: "3%", dur: "7s", delay: "0s", size: "2rem" },
  { emoji: "🧁", left: "10%", dur: "9s", delay: "1.2s", size: "1.6rem" },
  { emoji: "🍰", left: "18%", dur: "8s", delay: "3s", size: "1.9rem" },
  { emoji: "🎂", left: "27%", dur: "6s", delay: "0.5s", size: "1.4rem" },
  { emoji: "🍓", left: "37%", dur: "10s", delay: "2s", size: "1.7rem" },
  { emoji: "🧁", left: "47%", dur: "7.5s", delay: "4s", size: "2.1rem" },
  { emoji: "🎂", left: "56%", dur: "8.5s", delay: "1.8s", size: "1.5rem" },
  { emoji: "🍰", left: "65%", dur: "6.5s", delay: "3.5s", size: "1.8rem" },
  { emoji: "🧁", left: "74%", dur: "9.5s", delay: "0.8s", size: "1.6rem" },
  { emoji: "🍓", left: "83%", dur: "7s", delay: "2.5s", size: "2rem" },
  { emoji: "🎂", left: "91%", dur: "8s", delay: "4.5s", size: "1.5rem" },
  { emoji: "🧁", left: "97%", dur: "6s", delay: "1.5s", size: "1.7rem" },
];

export function InquiryHero() {
  const t = useTranslations();

  return (
    <header className="iq-hero">
      <div className="iq-hero__floats" aria-hidden>
        {FLOATS.map((f, i) => (
          <span
            key={i}
            className="iq-hero__float"
            style={{
              left: f.left,
              animationDuration: f.dur,
              animationDelay: f.delay,
              fontSize: f.size,
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>
      <div className="iq-hero__inner">
        <p className="iq-hero__label">{t.inquiry.heroLabel}</p>
        <h1 className="iq-hero__title">{t.inquiry.heroTitle}</h1>
        <p className="iq-hero__sub">{t.inquiry.heroSub}</p>
      </div>
    </header>
  );
}
