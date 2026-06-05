"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type MouseEvent,
} from "react";

const noopSubscribe = () => () => {};

/** SSR `false`, then client `true` — avoids setState inside an effect for portal hydration. */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
import { gsap } from "gsap";

import { ensureVideoPlays } from "@/lib/ensure-video-plays";
import {
  markHeroIntroSeen,
  markSkipHeroIntro,
  shouldSkipHeroIntro,
} from "@/lib/skip-hero-intro";
import { useLocale, useTranslations } from "@/i18n/LocaleProvider";
import { isHomePath } from "@/i18n/routing";

const INTRO_HOLD_S = 1.05;
const INTRO_HANDOFF_S = 1.65;

/** Keep in sync with `.site-header { top }` in `globals.css`. */
const HEADER_ROW_TOP_PX = 24;
/**
 * Negative = shift wordmark up after handoff so raster caps align with `.nav-left` / CTA
 * (PNG padding + scale); tweak only here + in `finishIntro` / timeline together.
 */
const WORDMARK_REST_Y_NUDGE_PX = -26;

export default function HeroScrollShrink() {
  const pathname = usePathname();
  const t = useTranslations();
  const { path } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const videoShellRef = useRef<HTMLDivElement>(null);
  const brandTitleRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introBackdropRef = useRef<HTMLDivElement>(null);
  const skipIntroRef = useRef<(() => void) | null>(null);
  const wordmarkInBody = useHydrated();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const brandTitle = brandTitleRef.current;
    const video = videoRef.current;
    const introBackdrop = introBackdropRef.current;

    if (!wordmarkInBody || !section || !brandTitle || !video || !introBackdrop)
      return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const skipIntro = shouldSkipHeroIntro();

    const dockedWordmark = () => ({
      position: "fixed" as const,
      left: "50%",
      top: HEADER_ROW_TOP_PX,
      xPercent: -50,
      yPercent: 0,
      x: 0,
      y: WORDMARK_REST_Y_NUDGE_PX,
      scale: 0.34,
      autoAlpha: 1,
      zIndex: 9999,
      transformOrigin: "50% 0%",
      force3D: true,
    });

    const stopVideoAutoplay = ensureVideoPlays(video);

    const ctx = gsap.context(() => {
      /* iOS refuses autoplay when opacity is exactly 0 — keep a trace visible to the engine.
       * filter is applied to .hero-video-color wrapper, NOT the video element itself,
       * because CSS filter directly on <video> can block iOS Safari autoplay. */
      gsap.set(video, {
        opacity: prefersReducedMotion ? 1 : 0.001,
        scale: prefersReducedMotion ? 1 : 1.035,
        force3D: true,
      });

      gsap.set(introBackdrop, {
        opacity: prefersReducedMotion ? 0 : 1,
      });

      const finishIntro = () => {
        markHeroIntroSeen();
        document.documentElement.dataset.heroIntro = "done";
        gsap.set(brandTitle, dockedWordmark());
      };

      skipIntroRef.current = () => {
        gsap.killTweensOf([brandTitle, video, introBackdrop]);
        gsap.set(video, { opacity: 1, scale: 1 });
        gsap.set(introBackdrop, { opacity: 0 });
        finishIntro();
      };

      if (prefersReducedMotion || skipIntro) {
        gsap.set(video, { opacity: 1, scale: 1 });
        gsap.set(introBackdrop, { opacity: 0 });
        finishIntro();
        return;
      }

      gsap.set(brandTitle, {
        position: "fixed",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        zIndex: 9999,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      gsap
        .timeline({
          delay: INTRO_HOLD_S,
          onComplete: finishIntro,
        })
        .to(
          video,
          {
            opacity: 1,
            scale: 1,
            duration: INTRO_HANDOFF_S,
            ease: "power3.inOut",
          },
          0,
        )
        .to(
          introBackdrop,
          {
            opacity: 0,
            duration: INTRO_HANDOFF_S,
            ease: "power3.inOut",
          },
          0,
        )
        .to(
          brandTitle,
          {
            left: "50%",
            top: HEADER_ROW_TOP_PX,
            xPercent: -50,
            yPercent: 0,
            x: 0,
            y: WORDMARK_REST_Y_NUDGE_PX,
            scale: 0.34,
            autoAlpha: 1,
            zIndex: 9999,
            duration: INTRO_HANDOFF_S,
            ease: "power3.inOut",
            transformOrigin: "50% 0%",
            force3D: true,
          },
          0,
        );
    }, section);

    return () => {
      stopVideoAutoplay();
      skipIntroRef.current = null;
      document.documentElement.removeAttribute("data-hero-intro");
      ctx.revert();
    };
  }, [wordmarkInBody]);

  useEffect(() => {
    const section = sectionRef.current;
    const shell = videoShellRef.current;
    if (!section || !shell) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;

    const clamp = (v: number, min: number, max: number) =>
      Math.min(Math.max(v, min), max);

    /**
     * Theme is self-correcting on every scroll/resize in BOTH motion modes.
     * White ("hero") nav is only used while the header sits over the dark hero
     * video; once the hero scrolls/shrinks away it switches to pink ("light").
     * Running this in reduced-motion too prevents the white-on-cream stuck state.
     * The shrink transform is still motion-only.
     */
    const update = () => {
      if (document.documentElement.dataset.heroIntro !== "done") {
        if (!prefersReducedMotion) {
          shell.style.transform = "";
          shell.style.borderRadius = "";
          section.style.setProperty("--hero-shrink-progress", "0");
        }
        document.documentElement.dataset.headerTheme = "hero";
        return;
      }

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const scrollable = Math.max(1, rect.height - vh);
      const progress = clamp(-rect.top / scrollable, 0, 1);

      const eased = 1 - (1 - progress) ** 3;
      const scaleTop = 1;
      const scaleBottom = 0.28;
      const scale = scaleTop - eased * (scaleTop - scaleBottom);

      if (!prefersReducedMotion) {
        section.style.setProperty("--hero-shrink-progress", String(eased));
        const radius = eased * 30;
        const y = eased * 38;
        shell.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
        shell.style.borderRadius = `${radius}px`;
      }

      // Fallback: also treat the header as "light" the moment the hero section
      // has essentially scrolled past the top of the viewport, independent of
      // the shrink math (covers reduced-motion where there is no shrink).
      const heroClearedTop = rect.bottom <= vh * 0.5;

      if (scale <= 0.82 || heroClearedTop) {
        document.documentElement.dataset.headerTheme = "light";
      } else {
        document.documentElement.dataset.headerTheme = "hero";
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const introObs = new MutationObserver(() => {
      onScroll();
    });
    introObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-hero-intro"],
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      introObs.disconnect();
      // Keep data-header-theme intact on unmount; SiteHeader sets the correct
      // per-route value, avoiding an unstyled header flash on navigation.
    };
  }, []);

  const handleWordmarkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    markSkipHeroIntro();

    if (isHomePath(pathname)) {
      event.preventDefault();
      skipIntroRef.current?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const wordmark = (
    <Link
      ref={brandTitleRef}
      href={path("/")}
      onClick={handleWordmarkClick}
      className="brand-title hero-wordmark-fixed hero-wordmark intro-wordmark intro-wordmark--hero intro-wordmark--raster hero-wordmark-home-link select-none"
      aria-label={t.nav.brandHome}
    >
      <span className="sr-only">{t.nav.brandName}</span>
      <Image
        src="/assets/four-et-delices-wordmark.webp"
        alt=""
        width={3072}
        height={2046}
        sizes="(max-width: 900px) min(92vw, 560px), 560px"
        loading="eager"
        fetchPriority="high"
        unoptimized
        className="intro-wordmark__img"
        aria-hidden
      />
    </Link>
  );

  return (
    <>
      <section
        ref={sectionRef}
        aria-label={t.home.intro}
        className="hero-scroll-section w-full"
      >
        <div className="hero-sticky-stage">
          <div className="hero-scroll-editorial" aria-hidden>
            <span className="hero-scroll-editorial__line hero-scroll-editorial__line--1">{t.home.heroLine1}</span>
            <span className="hero-scroll-editorial__line hero-scroll-editorial__line--2">{t.home.heroLine2}</span>
            <span className="hero-scroll-editorial__line hero-scroll-editorial__line--3">{t.home.heroLine3}</span>
            <span className="hero-scroll-editorial__line hero-scroll-editorial__line--4">
              {t.home.heroLine4}
            </span>
          </div>

          <div ref={videoShellRef} className="hero-video-shell">
            {/* Color-grade wrapper — filter here instead of on the <video> element.
                Applying CSS filter directly to a video blocks iOS Safari autoplay. */}
            <div className="hero-video-color">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                loop
                preload="auto"
                poster="/assets/hero-poster.jpg"
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
                className="hero-video pointer-events-none"
              >
                <source src="/assets/hero-video.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="hero-video-overlay" aria-hidden />
          </div>

          <div
            ref={introBackdropRef}
            className="hero-intro-backdrop"
            aria-hidden
          />
        </div>
      </section>
      {wordmarkInBody ? createPortal(wordmark, document.body) : null}
    </>
  );
}
