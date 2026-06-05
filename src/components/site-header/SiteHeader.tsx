"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { CakeLogo } from "./CakeLogo";

import { HomeBrandLink } from "@/components/navigation/HomeBrandLink";
import { OurCakesLink } from "@/components/navigation/OurCakesLink";
import { SiteHeaderOrderLink } from "./SiteHeaderOrderLink";
import { useLocale, useTranslations } from "@/i18n/LocaleProvider";
import { isHomePath, stripLocaleFromPathname } from "@/i18n/routing";

const HEADER_WORDMARK_SRC = "/assets/four-et-delices-wordmark.webp";
const noopSubscribe = () => () => {};

/** SSR `false`, then client `true` — portal target must exist after hydration. */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** Desktop: links in bar. Mobile: same links only inside hamburger panel (not in header row). */

const navLinkClass =
  "font-serif whitespace-nowrap no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f2924]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations();
  const { path, locale } = useLocale();
  const barePath = stripLocaleFromPathname(pathname);
  const hydrated = useHydrated();
  const menuId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  /** After hero / past small offset — hide header on downward scroll; show again on scroll up */
  const [scrollCollapsed, setScrollCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const scrollAccum = useRef(0);
  const nestedScrollTops = useRef(new WeakMap<EventTarget, number>());

  useLayoutEffect(() => {
    // Deterministic theme per route so client navigation never leaves the
    // header without a theme (which would flash default/unstyled colors).
    // Interior pages: champagne "light". Home loads at the top over the hero
    // video, so default to "hero"; HeroScrollShrink takes over on scroll.
    document.documentElement.dataset.headerTheme = isHomePath(pathname)
      ? "hero"
      : "light";
  }, [pathname]);

  useEffect(() => {
    scrollAccum.current = 0;
    setScrollCollapsed(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      scrollAccum.current = 0;
      setScrollCollapsed(false);
    }
  }, [mobileOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    scrollAccum.current = 0;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    /** Cake detail — keep header pinned; gallery height stays fixed (no tuck + grow) */
    if (/^\/cakes\/[^/]+\/[^/]+$/.test(barePath)) {
      setScrollCollapsed(false);
      return;
    }

    const DOWN_PX = 12;
    const UP_PX = 8;
    const TOP_MARGIN = 48;
    /** Interior pages — start hiding only after clearing the docked header safe zone */
    const INTERIOR_ACTIVATE_PX = 80;
    /** Home — keep pinned through full hero scrub; shrink zone ends once section tail passes */
    const PAST_HERO_MARGIN = 40;

    const pastHeroBarrier = (): boolean => {
      if (!isHomePath(pathname)) return true;
      const phase = document.documentElement.dataset.heroIntro;
      if (phase !== "done") return false;
      const hero = document.querySelector(".hero-scroll-section");
      if (!(hero instanceof HTMLElement))
        return window.scrollY > window.innerHeight * 0.95;
      return hero.getBoundingClientRect().bottom < PAST_HERO_MARGIN;
    };

    const eligibleToCollapse =
      !isHomePath(pathname) ? () => window.scrollY > INTERIOR_ACTIVATE_PX : pastHeroBarrier;

    const isTightPage = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      return maxScroll < 120;
    };

    const wheelConsumesVerticalScroll = (target: EventTarget | null, deltaY: number) => {
      if (!(target instanceof Element) || deltaY === 0) return false;

      let node: Element | null = target;
      while (
        node &&
        node !== document.documentElement &&
        node !== document.body
      ) {
        if (node instanceof HTMLElement && node.scrollHeight > node.clientHeight + 1) {
          const style = window.getComputedStyle(node);
          if (/(auto|scroll|overlay)/.test(style.overflowY)) {
            const maxTop = node.scrollHeight - node.clientHeight - 1;
            if (deltaY > 0 && node.scrollTop < maxTop) return true;
            if (deltaY < 0 && node.scrollTop > 0) return true;
          }
        }
        node = node.parentElement;
      }

      return false;
    };

    const resetCollapseTracking = (y: number, trackWindowY: boolean) => {
      scrollAccum.current = 0;
      setScrollCollapsed(false);
      if (trackWindowY) lastScrollY.current = y;
    };

    const applyScrollDelta = (delta: number) => {
      if (delta === 0) return;

      if (delta > 0) {
        scrollAccum.current =
          scrollAccum.current > 0 ? scrollAccum.current + delta : delta;
        if (scrollAccum.current >= DOWN_PX) setScrollCollapsed(true);
        return;
      }

      scrollAccum.current =
        scrollAccum.current < 0 ? scrollAccum.current + delta : delta;
      if (scrollAccum.current <= -UP_PX) setScrollCollapsed(false);
    };

    let raf = 0;

    const onScroll = (event?: Event) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        let delta = y - lastScrollY.current;
        let trackWindowY = true;

        const target = event?.target;
        if (
          target instanceof HTMLElement &&
          target !== document.documentElement &&
          target !== document.body &&
          target.scrollHeight > target.clientHeight + 1
        ) {
          const prevTop = nestedScrollTops.current.get(target) ?? target.scrollTop;
          const nestedDelta = target.scrollTop - prevTop;
          nestedScrollTops.current.set(target, target.scrollTop);
          if (nestedDelta !== 0) {
            delta = nestedDelta;
            trackWindowY = false;
          }
        }

        if (mobileOpen || (trackWindowY && y <= TOP_MARGIN)) {
          resetCollapseTracking(y, trackWindowY);
          return;
        }

        if (!eligibleToCollapse()) {
          resetCollapseTracking(y, trackWindowY);
          return;
        }

        applyScrollDelta(delta);

        if (trackWindowY) lastScrollY.current = y;
      });
    };

    const syncScrollState = () => onScroll();

    /** Wheel fallback — trackpads / viewport-tight pages where scrollY moves in tiny steps */
    const onWheel = (e: WheelEvent) => {
      if (mobileOpen) return;

      const y = window.scrollY;
      const tightPage = isTightPage();

      if (e.deltaY < 0 && y <= TOP_MARGIN + 12) {
        resetCollapseTracking(y, true);
        return;
      }

      if (wheelConsumesVerticalScroll(e.target, e.deltaY)) return;

      if (!eligibleToCollapse()) {
        resetCollapseTracking(y, true);
        return;
      }

      if (y <= TOP_MARGIN && !tightPage) return;

      if (Math.abs(e.deltaY) < 2) return;
      applyScrollDelta(e.deltaY);
    };

    syncScrollState();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", syncScrollState);

    const obs = new MutationObserver(syncScrollState);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-hero-intro"],
    });

    const onMq = () => {
      scrollAccum.current = 0;
      setScrollCollapsed(false);
    };
    mq.addEventListener("change", onMq);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", syncScrollState);
      mq.removeEventListener("change", onMq);
      obs.disconnect();
    };
  }, [mobileOpen, pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const close = () => setMobileOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  const interiorWordmark =
    !isHomePath(pathname) ? (
      <HomeBrandLink
        className={`brand-title hero-wordmark-fixed hero-wordmark intro-wordmark intro-wordmark--hero intro-wordmark--raster hero-wordmark-home-link hero-wordmark-docked select-none${scrollCollapsed ? " hero-wordmark-docked--scroll-collapsed" : ""}`}
        aria-label={t.nav.brandHome}
      >
        <span className="sr-only">{t.nav.brandName}</span>
        <Image
          src={HEADER_WORDMARK_SRC}
          alt=""
          width={3072}
          height={2046}
          sizes="(max-width: 900px) min(82vw, 400px), min(72vw, 560px)"
          loading="eager"
          fetchPriority="high"
          unoptimized
          className="intro-wordmark__img"
          aria-hidden
        />
      </HomeBrandLink>
    ) : null;

  return (
    <>
    <header
      className={`site-header${scrollCollapsed ? " site-header--scroll-collapsed" : ""}`}
      role="banner"
    >
      <div className="site-header__shell">
        <div className="left-header-pill">
          <OurCakesLink className="site-header__logo" aria-label={t.nav.ourCakes}>
            <CakeLogo className="h-9 w-auto shrink-0 min-[901px]:h-[3rem]" />
          </OurCakesLink>

          <button
            type="button"
            className="site-header__menu-btn"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">{t.nav.menu}</span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              {mobileOpen ? (
                <path
                  d="M4.5 4.5l13 13M17.5 4.5l-13 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 6.5h14M4 11h14M4 15.5h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>

          <nav className="nav-left" aria-label={t.nav.primary}>
            <OurCakesLink className={navLinkClass}>
              {t.nav.ourCakes}
            </OurCakesLink>
            <Link href={path("/meet-khoudia")} className={navLinkClass}>
              {t.nav.meetKhoudia}
            </Link>
          </nav>
        </div>

        <nav
          className="nav-right site-header__right site-header__nav-cluster pointer-events-auto shrink-0"
          aria-label={t.nav.order}
        >
          <SiteHeaderOrderLink
            linkClassName={`${navLinkClass}${locale === "fr" ? " site-header__order-link--fr" : ""}`}
            label={t.nav.orderCake}
          />
        </nav>
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="site-header__mobile-scrim"
            aria-label={t.nav.closeMenu}
            tabIndex={-1}
            onClick={() => setMobileOpen(false)}
          />
          <div
            id={menuId}
            className="site-header__mobile-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.siteMenu}
          >
            <nav className="site-header__mobile-nav" aria-label={t.nav.primary}>
              <OurCakesLink
                className="site-header__mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {t.nav.ourCakes}
              </OurCakesLink>
              <Link
                href={path("/meet-khoudia")}
                className="site-header__mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {t.nav.meetKhoudia}
              </Link>
            </nav>
          </div>
        </>
      ) : null}
    </header>
    {hydrated && interiorWordmark
      ? createPortal(interiorWordmark, document.body)
      : null}
    </>
  );
}
