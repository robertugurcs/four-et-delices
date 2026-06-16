"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  pushWithRouteTransition,
  type RouteTransitionMood,
} from "@/lib/route-transition";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { WISH_ANCHOR_TO_CATEGORY } from "@/data/our-cakes";
import { useLocale, useTranslations } from "@/i18n/LocaleProvider";
import { playGenieArrivalPuff } from "@/lib/magic-sfx";
import { markHomeReturnSection } from "@/lib/scroll-to-section";

type CategoryMood = "birthdays" | "weddings" | "kids" | "corporate";

/** Chibi genie (PNG, transparent) — Aladdin-style lamp blue tones */
const GENIE_CHIBI_SRC = "/assets/category-wish/genie-chibi.webp";
const CAKE_BURST_SRC  = "/icons/cake-layer.svg";
const CANDLE_BURST_SRC = "/icons/candle.svg";

const LAMP_SRC     = "/assets/category-wish/noun-genies-lamp-5353843.svg";
const WORDMARK_SRC = "/assets/category-wish/four-et-delices-wordmark.webp";
const GENIE_SIZE   = 96;

/** Touch tablets (iPad / iPad Pro) — desktop-style open fan, mobile-style tap; not phones ≤720px */
const IPAD_FAN_MQ = "(min-width: 721px) and (pointer: coarse)";
/** Phone-only — static 2×2 grid, no carousel */
const MOBILE_GRID_MQ = "(max-width: 720px)";

type Category = {
  anchor:    string;
  title:     string;
  image:     string;
  mood:      CategoryMood;
  fanRotDeg: number;
};

const CATEGORIES: Category[] = [
  { anchor: "kids",      title: "Kids",      image: "/assets/category-wish/K-1-1.webp", mood: "kids",      fanRotDeg: -3.5 },
  { anchor: "weddings",  title: "Wedding",   image: "/assets/category-wish/W-2-1.webp", mood: "weddings",  fanRotDeg: -1.2 },
  { anchor: "birthdays", title: "Birthday",  image: "/assets/category-wish/B-4-1.webp", mood: "birthdays", fanRotDeg:  1.2 },
  { anchor: "corporate", title: "Corporate", image: "/assets/category-wish/C-5-1.webp", mood: "corporate", fanRotDeg:  3.5 },
];

/* ── Cake / candle SVG burst (replaces gold particle sparkle on card) ───── */
function spawnCakeBurst(container: Element) {
  const COUNT = 14;
  const picks = [
    CAKE_BURST_SRC, CAKE_BURST_SRC, CAKE_BURST_SRC, CAKE_BURST_SRC,
    CAKE_BURST_SRC, CANDLE_BURST_SRC, CAKE_BURST_SRC, CANDLE_BURST_SRC,
  ];
  for (let i = 0; i < COUNT; i++) {
    const wrap = document.createElement("span");
    wrap.className = "cw-cake-shard";
    const base = (360 / COUNT) * i;
    wrap.style.setProperty("--angle", `${base + Math.random() * 32}deg`);
    wrap.style.setProperty("--dist", `${58 + Math.random() * 52}px`);
    wrap.style.setProperty("--s0", `${0.38 + Math.random() * 0.18}`);
    wrap.style.setProperty("--s1", `${0.55 + Math.random() * 0.38}`);

    const img = document.createElement("img");
    img.src = picks[i % picks.length];
    img.alt = "";
    img.draggable = false;
    const px = Math.round(24 + Math.random() * 26);
    img.width = px;
    img.height = px;
    wrap.appendChild(img);
    container.appendChild(wrap);
    setTimeout(() => wrap.remove(), 1100);
  }
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function CategoryWishSection() {
  const t = useTranslations();
  const { path } = useLocale();
  const rootRef        = useRef<HTMLElement>(null);
  const lampWrapRef    = useRef<HTMLDivElement>(null);
  const proseRef       = useRef<HTMLDivElement>(null);
  const magicGenieRef  = useRef<HTMLImageElement>(null);
  const cardButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardLiftRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [fanOpen, setFanOpen]   = useState(false);
  const ipadFanRef  = useRef(false);
  const revealedRef = useRef(false);
  const router = useRouter();

  const categoryTitle = (anchor: string) => {
    switch (anchor) {
      case "kids":
        return t.home.categoryKids;
      case "weddings":
        return t.home.categoryWedding;
      case "birthdays":
        return t.home.categoryBirthday;
      case "corporate":
        return t.home.categoryCorporate;
      default:
        return anchor;
    }
  };

  const navigateToGallery = useCallback(
    (anchor: string) => {
      const categoryId = WISH_ANCHOR_TO_CATEGORY[anchor];
      if (!categoryId) return;

      const mood = anchor as RouteTransitionMood;

      markHomeReturnSection();

      pushWithRouteTransition(router, path(`/cakes/${categoryId}`), {
        mood,
        scroll: false,
      });
    },
    [path, router],
  );

  const navigateToCatalog = useCallback(() => {
    pushWithRouteTransition(router, path("/cakes"), {
      mood: "default",
    });
  }, [path, router]);

  /* ── iPad: fan always open (desktop spread, no hover needed) ─────────── */
  useEffect(() => {
    const mq = window.matchMedia(IPAD_FAN_MQ);
    const sync = () => {
      ipadFanRef.current = mq.matches;
      if (mq.matches) setFanOpen(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* ── Entrance animation ─────────────────────────────────────────────── */
  useEffect(() => {
    const root     = rootRef.current;
    const lampWrap = lampWrapRef.current;
    if (!root || !lampWrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | null = null;
    let fallbackTimer = 0;
    let scrollRevealAttached = false;
    let onScrollReveal: (() => void) | null = null;

    const ctx = gsap.context(() => {
      const lifts     = cardLiftRefs.current.filter(Boolean) as HTMLDivElement[];
      const proseRoot = proseRef.current;
      const wishBlock = proseRoot?.querySelector(
        ".category-wish-section__wish-block",
      ) as HTMLElement | null;
      const proseLines = proseRoot
        ? (Array.from(proseRoot.querySelectorAll(":scope > *")) as HTMLElement[]).filter(
            (el) => !el.classList.contains("category-wish-section__wish-block"),
          )
        : [];
      const genieEl     = magicGenieRef.current;
      const readOp = (el: Element) => Number(el.getAttribute("data-o") ?? 1);
      const narrowMobile = window.matchMedia("(max-width: 720px)").matches;

      if (reduced) {
        if (!narrowMobile) {
          gsap.set(lampWrap, { opacity: 1, scale: 1, y: 0, filter: "none" });
        }
        gsap.set(lifts, { opacity: (_, el) => readOp(el), y: 0 });
        if (proseLines.length) gsap.set(proseLines, { opacity: 1, y: 0 });
        if (wishBlock) gsap.set(wishBlock, { opacity: 1, y: 0 });
        return;
      }

      /* initial hidden states */
      if (!narrowMobile) {
        gsap.set(lampWrap, { opacity: 0, scale: 0.4, y: -20 });
        gsap.set(lifts, { opacity: 0, y: 44 });
      } else {
        /* Mobile grid: cards always visible — no GSAP entrance */
        gsap.set(lifts, { opacity: 1, clearProps: "all" });
      }
      if (proseLines.length) gsap.set(proseLines, { opacity: 0, y: 14 });
      if (wishBlock) gsap.set(wishBlock, { opacity: 0, y: 18 });

      const WISH_BLOCK_AT = narrowMobile ? 0.55 : 0.58;
      const LAMP_AT = 1.95;
      const GENIE_AT = 2.15;

      const runReveal = () => {
        if (revealedRef.current) return;
        revealedRef.current = true;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" }, smoothChildTiming: true });

        /* 1 — Prose lines stagger in (wish excluded) */
        if (proseLines.length) {
          tl.to(proseLines, {
            opacity: 1,
            y: 0,
            duration: narrowMobile ? 0.35 : 0.5,
            stagger: narrowMobile ? 0.04 : 0.065,
            ease: "power3.out",
          }, 0.08);
        }

        /* 2 — Wish + catalog CTA (above cards in layout) */
        if (wishBlock) {
          tl.to(wishBlock, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
          }, WISH_BLOCK_AT);
        }

        /* 3 — Cards stagger in (desktop/tablet only; mobile uses static grid) */
        if (!narrowMobile) {
          tl.to(
            lifts,
            {
              opacity: (_, el) => readOp(el),
              y: 0,
              duration: 1.05,
              stagger: 0.14,
              ease: "expo.out",
            },
            0.72,
          );
        }

        /* Desktop/tablet — lamp + genie after cards */
        if (!narrowMobile) {
          tl.to(lampWrap, { opacity: 1, scale: 1, y: 0, duration: 1.15, ease: "expo.out" }, LAMP_AT);

          if (genieEl && lampWrap && root) {
            tl.call(() => {
              const sr   = root.getBoundingClientRect();
              const lr   = lampWrap.getBoundingClientRect();
              const left = lr.left - sr.left + lr.width * 0.5 - GENIE_SIZE * 0.5;
              const top  = lr.top  - sr.top  - GENIE_SIZE * 0.2;

              gsap.set(genieEl, {
                src: GENIE_CHIBI_SRC, width: GENIE_SIZE, height: "auto",
                left, top, x: 0, y: 16, autoAlpha: 0, scale: 0.44, filter: "blur(10px)",
              });
              gsap.timeline()
                .to(genieEl, { autoAlpha: 1, scale: 1, y: -28, filter: "blur(0px)", duration: 0.9, ease: "power2.out" })
                .to(genieEl, { y: -70, autoAlpha: 0.9, duration: 0.55, ease: "sine.inOut" })
                .to(genieEl, { y: 0, autoAlpha: 0, scale: 0.55, filter: "blur(6px)", duration: 0.55, ease: "power2.in" });
            }, undefined, GENIE_AT);
          }
        }
      };

      const isSectionVisible = () => {
        const rect = root.getBoundingClientRect();
        const vh = window.innerHeight;
        return rect.top < vh * 0.88 && rect.bottom > vh * 0.06;
      };

      const ioThreshold = narrowMobile ? 0.05 : 0.22;
      const ioRootMargin = narrowMobile ? "0px 0px 0px 0px" : "0px 0px -8% 0px";

      io = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        runReveal();
      }, { threshold: ioThreshold, rootMargin: ioRootMargin });

      io.observe(root);

      /* iPhone Safari: sticky hero + scroll deck often skip IO — scroll + timeout fallbacks */
      onScrollReveal = () => {
        if (revealedRef.current) return;
        if (isSectionVisible()) runReveal();
      };

      if (narrowMobile) {
        window.addEventListener("scroll", onScrollReveal, { passive: true });
        scrollRevealAttached = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(onScrollReveal!);
        });
      }

      fallbackTimer = window.setTimeout(() => {
        if (!revealedRef.current) runReveal();
      }, narrowMobile ? 1500 : 3500);
    }, root);

    return () => {
      revealedRef.current = false;
      io?.disconnect();
      window.clearTimeout(fallbackTimer);
      if (scrollRevealAttached && onScrollReveal) {
        window.removeEventListener("scroll", onScrollReveal);
      }
      ctx.revert();
    };
  }, []);

  /* ── Mobile deck: scroll blur disabled on phones (filter + sticky = iOS jitter) ─ */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");

    const clearAllBlur = () => {
      for (const btn of cardButtonRefs.current) {
        const tilt = btn?.querySelector(
          ".category-wish-card__tilt",
        ) as HTMLElement | null;
        if (tilt) tilt.style.removeProperty("filter");
      }
    };

    clearAllBlur();
    mq.addEventListener("change", clearAllBlur);

    return () => {
      mq.removeEventListener("change", clearAllBlur);
      clearAllBlur();
    };
  }, []);

  /* ── Card click: genie rises from bottom lamp to selected card ────────── */
  const handleActivate = (anchor: string, index: number) => {
    const cat = CATEGORIES[index];
    if (!cat) return;

    setSelected(anchor);

    const narrowMobile =
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_GRID_MQ).matches;

    /* Phones: pick category only — no genie, lamp pulse, burst, or puff audio */
    if (narrowMobile) {
      navigateToGallery(anchor);
      return;
    }

    const root    = rootRef.current;
    const lampEl  = lampWrapRef.current;
    const genieEl = magicGenieRef.current;
    const inner   = cardLiftRefs.current[index];
    const cardBtn = cardButtonRefs.current[index];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fly     = gsap.timeline();

    /* Card breathe */
    if (!reduced && inner) {
      fly.to(inner, { scale: 1.03, duration: 0.18, ease: "power2.out" })
         .to(inner, { scale: 1,    duration: 0.42, ease: "power3.out" });
    }

    /* Genie flies UP from lamp (bottom) to card (above) via arc */
    if (!reduced && genieEl && lampEl && root && cardBtn) {
      genieEl.src = GENIE_CHIBI_SRC;
      const sr  = root.getBoundingClientRect();
      const lr  = lampEl.getBoundingClientRect();
      const cr  = cardBtn.getBoundingClientRect();
      const w   = GENIE_SIZE;

      // Origin: lamp at bottom center
      const left0 = lr.left - sr.left + lr.width  * 0.5 - w * 0.5;
      const top0  = lr.top  - sr.top  - w * 0.2;

      // Destination: selected card center
      const left1 = cr.left - sr.left + cr.width  * 0.5 - w * 0.5;
      const top1  = cr.top  - sr.top  + cr.height * 0.25;

      // Arc apex — above both points (higher than the card)
      const midLeft = (left0 + left1) * 0.5 + (index < 2 ? -40 : 40);
      const midTop  = Math.min(top0, top1) - 80;

      gsap.set(genieEl, {
        width: w, height: "auto",
        left: left0, top: top0,
        x: 0, y: 0,
        autoAlpha: 0, scale: 0.5, filter: "blur(8px)",
      });

      fly
        /* Emerge from lamp smoke */
        .to(genieEl, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.28, ease: "power2.out" }, 0)
        /* Sweep up through arc */
        .to(genieEl, { left: midLeft, top: midTop, duration: 0.4, ease: "power2.out" }, 0.16)
        /* Descend to card */
        .to(genieEl, { left: left1, top: top1, duration: 0.42, ease: "power2.inOut" }, 0.54)
        /* Dissolve into card */
        .to(genieEl, { autoAlpha: 0, scale: 0.65, filter: "blur(7px)", duration: 0.3, ease: "power3.in" }, "-=0.12");
    }

    /* Cake / candle SVG burst (on card button — avoids clip from inner tilt) */
    if (!reduced && cardBtn) {
      fly.call(() => spawnCakeBurst(cardBtn), undefined, 0.66);
    }

    /* Lamp heartbeat — bronze / copper pulse (wrapper filter; img keeps its own color filter) */
    if (!reduced && lampEl) {
      fly.fromTo(lampEl,
        { filter: "drop-shadow(0 3px 12px rgba(120, 62, 42, 0.28)) drop-shadow(0 0 14px rgba(200, 138, 88, 0.25))" },
        { filter: "drop-shadow(0 0 22px rgba(236, 185, 130, 0.65)) drop-shadow(0 0 36px rgba(184, 112, 72, 0.35)) drop-shadow(0 8px 20px rgba(120, 52, 38, 0.22))", duration: 0.3, yoyo: true, repeat: 1, ease: "sine.inOut" },
        0.02,
      );
    }

    /* Puff + soft snap when genie reaches the card (Web Audio; user gesture = this click) */
    fly.call(
      () => { void playGenieArrivalPuff(); },
      undefined,
      reduced ? 0.02 : 0.83,
    );

    fly.call(() => navigateToGallery(anchor), undefined, reduced ? 0.04 : 0.78);
  };

  return (
    <section
      ref={rootRef}
      id="cakes"
      className="category-wish-section"
      aria-labelledby="category-wish-heading"
    >
      {/* Flying genie — GSAP only, not a cursor */}
      <img
        ref={magicGenieRef}
        className="category-wish-magic-genie"
        src={GENIE_CHIBI_SRC}
        alt=""
        width={GENIE_SIZE}
        height={Math.round(GENIE_SIZE * 1.15)}
        draggable={false}
      />

      <div className="category-wish-section__inner">
        <header className="category-wish-section__header">
          <div ref={proseRef} className="category-wish-section__prose">
            <p id="category-wish-heading">
              {t.home.categoryWishHeading.split("\n").map((line: string, i: number, arr: string[]) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <p>{t.home.categoryWishP1}</p>
            <p>
              {t.home.categoryWishP2.split("\n").map((line: string, i: number, arr: string[]) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <p>
              {t.home.categoryWishP3.split("\n").map((line: string, i: number, arr: string[]) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <div className="category-wish-section__wish-block">
              <p className="category-wish-section__prose-wish">
                <span className="category-wish-section__wish-line">
                  <span>{t.home.categoryWishCta}</span>
                  <img
                    src={CAKE_BURST_SRC}
                    alt=""
                    width={46}
                    height={46}
                    draggable={false}
                    className="category-wish-section__wish-cake-mark"
                    aria-hidden
                  />
                </span>
              </p>
              <div className="category-wish-catalog-cta">
                <button
                  type="button"
                  className="category-wish-catalog-cta__btn"
                  onClick={navigateToCatalog}
                  aria-label={t.home.categoryCatalogAria}
                >
                  <span className="category-wish-catalog-cta__label">
                    {t.home.categoryCatalogCta}
                  </span>
                  <span className="category-wish-catalog-cta__arrow" aria-hidden>
                    <svg viewBox="0 0 12 12" width="12" height="12">
                      <path
                        d="M3.5 8.5 8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Cards — desktop fan / mobile static 2×2 grid (phones ≤720px) */}
        <div
          className={`category-wish-fan${fanOpen ? " category-wish-fan--open" : ""}`}
          role="list"
        >
          {CATEGORIES.map((cat, index) => (
            <div
              key={cat.anchor}
              className="category-wish-fan__slot"
              role="listitem"
            >
              <button
                ref={(el) => { cardButtonRefs.current[index] = el; }}
                type="button"
                data-category-mood={cat.mood}
                className={`category-wish-card${selected === cat.anchor ? " category-wish-card--selected" : ""}`}
                onClick={() => handleActivate(cat.anchor, index)}
                aria-pressed={selected === cat.anchor}
                aria-label={t.home.categoryExplore.replace(
                  "{title}",
                  categoryTitle(cat.anchor),
                )}
              >
                <div ref={(el) => { cardLiftRefs.current[index] = el; }} className="category-wish-card__lift" data-o="1">
                  <div className="category-wish-card__tilt" style={{ ["--cw-rot" as string]: `${cat.fanRotDeg}deg` }}>
                    <div className="category-wish-card__media">
                      <Image
                        src={cat.image} alt="" fill
                        sizes="(max-width: 720px) 44vw, (max-width: 1023px) 52vw, 32vw"
                        quality={88} className="category-wish-card__img" priority={index < 2}
                      />
                      <div className="category-wish-card__scrim" aria-hidden />
                      <div className="category-wish-card__overlay">
                        <span className="category-wish-card__overlay-title">
                          {categoryTitle(cat.anchor)}
                        </span>
                      </div>
                      <div className="category-wish-card__brand">
                        <Image src={WORDMARK_SRC} alt="" width={132} height={44} className="category-wish-card__wordmark" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Lamp lives at the bottom — magic source that fuels the cards above */}
        <div className="category-wish-lamp-base">
          <div className="category-wish-lamp-base__beam" aria-hidden />
          <div ref={lampWrapRef} className="category-wish-header-lamp">
            <img
              className="category-wish-header-lamp__img"
              src={LAMP_SRC}
              alt=""
              width={88}
              height={110}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
