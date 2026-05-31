"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

import { isHomePath } from "@/i18n/routing";
import {
  markHeroIntroSeen,
  shouldSkipHeroIntro,
} from "@/lib/skip-hero-intro";

/**
 * Ensures intro veil / body fade CSS does not trap non-home routes with opacity 0.
 * Home relies on IntroController to add intro-ready after mount.
 */
export function IntroReadyGate() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!isHomePath(pathname)) {
      markHeroIntroSeen();
      document.documentElement.classList.add("intro-ready");
      document.body.classList.add("intro-ready");
      return;
    }

    if (shouldSkipHeroIntro()) {
      document.documentElement.classList.add("intro-ready");
      document.body.classList.add("intro-ready");
      document.documentElement.dataset.heroIntro = "done";
    }
  }, [pathname]);

  return null;
}
