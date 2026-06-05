"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import {
  clearRouteTransition,
  resetScrollPosition,
} from "@/lib/route-transition";

const MIN_CONTENT_HEIGHT_RATIO = 0.28;
const RELEASE_FALLBACK_MS = 1200;

function releaseRouteTransition() {
  resetScrollPosition();
  clearRouteTransition();
}

/**
 * Wraps locale page segments so the persistent layout footer does not flash at
 * the top while Suspense/loading swaps leave the children slot nearly empty.
 */
export function LocalePageSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    resetScrollPosition();
  }, [pathname]);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) {
      releaseRouteTransition();
      return;
    }

    let released = false;
    let fallbackTimer = 0;
    let frameA = 0;
    let frameB = 0;

    const releaseOnce = () => {
      if (released) return;
      released = true;
      window.clearTimeout(fallbackTimer);
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
      releaseRouteTransition();
    };

    const hasMeaningfulHeight = () =>
      slot.offsetHeight > window.innerHeight * MIN_CONTENT_HEIGHT_RATIO;

    const tryRelease = () => {
      resetScrollPosition();
      if (hasMeaningfulHeight()) {
        releaseOnce();
      }
    };

    const observer = new ResizeObserver(() => {
      tryRelease();
    });

    observer.observe(slot);
    resetScrollPosition();

    frameA = window.requestAnimationFrame(() => {
      frameB = window.requestAnimationFrame(() => {
        tryRelease();
      });
    });

    fallbackTimer = window.setTimeout(releaseOnce, RELEASE_FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
    };
  }, [pathname]);

  return (
    <div ref={slotRef} className="locale-page-slot">
      {children}
    </div>
  );
}
