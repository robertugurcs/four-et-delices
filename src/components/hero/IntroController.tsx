"use client";

import { useLayoutEffect } from "react";

import {
  OUR_CAKES_SECTION_ID,
  scrollToHomeHashWhenReady,
} from "@/lib/scroll-to-section";
import { shouldSkipHeroIntro } from "@/lib/skip-hero-intro";

function scrollToCakesHashIfPresent() {
  const hash = window.location.hash.slice(1);
  if (hash === OUR_CAKES_SECTION_ID) {
    scrollToHomeHashWhenReady(hash);
  }
}

/**
 * Sets intro phase on <html> only after mount — avoids SSR/client hydration mismatch.
 * Hero sets `dataset.heroIntro = "done"` when the hand-off finishes.
 * Adds intro-ready on body + html so globals.css can fade the veil and body without flash.
 */
export function IntroController() {
  useLayoutEffect(() => {
    document.documentElement.classList.add("intro-ready");
    document.body.classList.add("intro-ready");

    const skipIntro = shouldSkipHeroIntro();
    if (skipIntro) {
      document.documentElement.dataset.heroIntro = "done";
      document.documentElement.dataset.headerTheme = "hero";
    } else {
      document.documentElement.dataset.heroIntro = "running";
      document.documentElement.dataset.headerTheme = "hero";
    }

    scrollToCakesHashIfPresent();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) scrollToCakesHashIfPresent();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.documentElement.removeAttribute("data-hero-intro");
      document.documentElement.removeAttribute("data-header-theme");
    };
  }, []);

  return null;
}
