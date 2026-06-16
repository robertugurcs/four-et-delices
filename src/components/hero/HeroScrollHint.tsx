"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "@/i18n/LocaleProvider";

const SCROLL_HIDE_PX = 36;

export function HeroScrollHint() {
  const t = useTranslations();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > SCROLL_HIDE_PX) {
        setHidden(true);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`hero-scroll-hint${hidden ? " hero-scroll-hint--hidden" : ""}`}
      aria-hidden
    >
      <p className="hero-scroll-hint__label">{t.home.heroScrollHint}</p>
      <span className="hero-scroll-hint__track" />
    </div>
  );
}
