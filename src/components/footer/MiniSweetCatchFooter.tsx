"use client";

import { useEffect, useRef, useState } from "react";
import { SweetCatchStarfield } from "@/components/footer/SweetCatchAmbient";
import { useTranslations } from "@/i18n/LocaleProvider";

const IFRAME_SRC = "/sweet-catch-v2.html";
const VISIBILITY_THRESHOLD = 0.2;
const OFFSCREEN_UNLOAD_MS = 45_000;
/** Match site iPad touch tablets — parent viewport, not iframe width */
const TABLET_TOUCH_MQ = "(min-width: 721px) and (pointer: coarse)";

function postSweetCatchLayout(iframe: HTMLIFrameElement | null | undefined) {
  const win = iframe?.contentWindow;
  if (!win) return;
  try {
    win.postMessage(
      {
        type: "sweet-catch-layout",
        tabletTouch: window.matchMedia(TABLET_TOUCH_MQ).matches,
      },
      window.location.origin,
    );
  } catch {
    /* iframe may already be tearing down */
  }
}

/**
 * Sweet Catch iframe: lazy load when ~20% visible, suspend off-screen, and
 * only unload after a longer absence so threshold scrolling does not reload it.
 * Ambient animations pause via sweet-catch-arcane--idle when section is not active.
 */
export function MiniSweetCatchFooter() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const unloadTimerRef = useRef<number | undefined>(undefined);
  const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const origin = window.location.origin;
    const clearUnloadTimer = () => {
      if (unloadTimerRef.current === undefined) return;
      window.clearTimeout(unloadTimerRef.current);
      unloadTimerRef.current = undefined;
    };
    const postToGame = (type: "sweet-catch-resume" | "sweet-catch-suspend") => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      try {
        win.postMessage({ type }, origin);
      } catch {
        /* iframe may already be tearing down */
      }
    };
    const postLayoutToGame = () => postSweetCatchLayout(iframeRef.current);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView =
          entry.isIntersecting &&
          entry.intersectionRatio >= VISIBILITY_THRESHOLD;
        setActive(inView);

        if (inView) {
          clearUnloadTimer();
          setIframeSrc((src) => src ?? IFRAME_SRC);
          postToGame("sweet-catch-resume");
          postLayoutToGame();
          return;
        }

        postToGame("sweet-catch-suspend");
        clearUnloadTimer();
        unloadTimerRef.current = window.setTimeout(() => {
          setIframeSrc(undefined);
          unloadTimerRef.current = undefined;
        }, OFFSCREEN_UNLOAD_MS);
      },
      { threshold: [0, VISIBILITY_THRESHOLD, 0.5] },
    );

    observer.observe(el);
    const mq = window.matchMedia(TABLET_TOUCH_MQ);
    const onLayoutChange = () => postLayoutToGame();
    mq.addEventListener("change", onLayoutChange);
    window.addEventListener("resize", onLayoutChange);
    return () => {
      clearUnloadTimer();
      observer.disconnect();
      mq.removeEventListener("change", onLayoutChange);
      window.removeEventListener("resize", onLayoutChange);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`sweet-catch-arcane mini-sweet-catch-footer-embed relative isolate z-0 overflow-hidden px-4 pb-10 pt-14 md:pb-16 md:pt-16 sm:px-6${active ? "" : " sweet-catch-arcane--idle"}`}
      aria-label={t.home.sweetCatchArcade}
    >
      <div className="sweet-catch-arcane__layers" aria-hidden>
        <div className="sweet-catch-arcane__bg" />
        <div className="sweet-catch-arcane__orb sweet-catch-arcane__orb--cyan" />
        <div className="sweet-catch-arcane__orb sweet-catch-arcane__orb--plum" />
        <div className="sweet-catch-arcane__vignette" />
        <div className="sweet-catch-arcane__grain" />
      </div>
      <SweetCatchStarfield />

      <div className="relative z-[2] mx-auto w-full max-w-3xl">
        <header className="sweet-catch-arcane__header mb-8 text-center md:mb-10">
          <p className="sweet-catch-arcane__eyebrow">{t.home.sweetCatchMini}</p>
          <h2 className="sweet-catch-arcane__title">{t.home.sweetCatch}</h2>
        </header>

        <div className="sweet-catch-arcane__frame-wrap mx-auto overflow-hidden rounded-[28px] px-3 py-3 sm:px-5 sm:py-4">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={t.home.sweetCatchIframe}
            loading="lazy"
            onLoad={() => postSweetCatchLayout(iframeRef.current)}
            className="sweet-catch-arcane__iframe relative z-[2] mx-auto block h-[478px] w-full max-w-[min(100%,720px)] overflow-hidden rounded-[22px] border border-white/20 bg-[#FDF8F3] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35),inset_0_10px_28px_-6px_rgba(255,255,255,0.22)]"
          />
        </div>
        <div className="mt-4 text-center">
          <a
            href="/game"
            className="sweet-catch-arcane__fullscreen-link"
            aria-label="Play Sweet Catch fullscreen"
          >
            ⛶ Full Screen
          </a>
        </div>
      </div>
    </section>
  );
}
