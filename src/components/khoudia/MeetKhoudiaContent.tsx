"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteHeaderOrderLink } from "@/components/site-header/SiteHeaderOrderLink";
import { SiteHeader } from "@/components/site-header/SiteHeader";
import { useTranslations } from "@/i18n/LocaleProvider";

const PORTRAIT_SRC = "/assets/meet-khoudia/mobile-black-khoudia.webp";
const STUDIO_SRC = "/assets/meet-khoudia/mobile-pink.webp";
const WEDDING_CAKE_SRC = "/assets/extract/W-2-1.webp";

function PortraitFrame({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="meet-khoudia-portrait mk-image-reveal">
      <div className="mk-image-reveal-mask meet-khoudia-portrait__frame">
        <div className="mk-image-zoom meet-khoudia-portrait__inner">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            quality={92}
            sizes="(min-width: 768px) min(420px, 42vw), min(80vw, 360px)"
            className="object-contain object-bottom"
          />
        </div>
      </div>
    </div>
  );
}

export function MeetKhoudiaContent() {
  const t = useTranslations();
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(
          [".mk-word", ".mk-fade-up", ".mk-slogan-line", ".mk-image-reveal-mask", ".mk-image-zoom"],
          { clearProps: "all", opacity: 1, x: 0, y: 0, scale: 1 },
        );
        return;
      }

      gsap.utils.toArray<HTMLElement>(".mk-slogan-line").forEach((line, i) => {
        gsap.from(line, {
          opacity: 0,
          y: 40,
          duration: 1.05,
          delay: 0.12 + i * 0.11,
          ease: "power4.out",
        });
      });

      gsap.utils.toArray<HTMLElement>(".mk-headline").forEach((scope) => {
        const words = scope.querySelectorAll<HTMLElement>(".mk-word");
        gsap.from(words, {
          opacity: 0,
          yPercent: 110,
          rotation: 3,
          duration: 1.15,
          ease: "power4.out",
          stagger: 0.085,
          scrollTrigger: {
            trigger: scope,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".mk-body").forEach((scope) => {
        const words = scope.querySelectorAll<HTMLElement>(".mk-word");
        gsap.from(words, {
          opacity: 0,
          yPercent: 80,
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.022,
          scrollTrigger: {
            trigger: scope,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".mk-fade-up").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 1.0,
          delay: i * 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".mk-image-reveal").forEach((wrap) => {
        const mask = wrap.querySelector<HTMLElement>(".mk-image-reveal-mask");
        const zoom = wrap.querySelectorAll<HTMLElement>(".mk-image-zoom");
        if (!mask) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
        tl.fromTo(
          mask,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: "power4.out" },
        );
        if (zoom.length) {
          tl.fromTo(
            zoom,
            { scale: 1.12 },
            { scale: 1, duration: 1.6, ease: "power3.out" },
            0,
          );
        }
      });

      ScrollTrigger.refresh();
    }, rootRef);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, []);

  return (
    <main
      ref={rootRef}
      className="meet-khoudia m-0 min-h-screen w-full max-w-full overflow-x-clip p-0 text-black"
    >
      <SiteHeader />

      <section
        aria-labelledby="meet-khoudia-heading"
        className="meet-khoudia-hero relative w-full"
      >
        <div className="meet-khoudia-hero__inner mx-auto w-full max-w-[1320px] px-5 pb-16 pt-[calc(var(--site-header-scroll-margin)+2.5rem)] sm:px-8 md:pb-24 md:pt-[calc(var(--site-header-scroll-margin)+4rem)]">
          <div className="meet-khoudia-hero__grid grid grid-cols-1 items-end gap-x-12 gap-y-10 md:grid-cols-12 md:gap-x-10">
            <div className="meet-khoudia-hero__copy md:col-span-7 md:pb-6">
              <h1
                id="meet-khoudia-heading"
                className="meet-khoudia-slogan m-0 font-serif font-normal tracking-[-0.015em] text-black"
              >
                <span className="meet-khoudia-slogan-line mk-slogan-line block">
                  {t.meetKhoudia.title1}
                </span>
                <span className="meet-khoudia-slogan-line mk-slogan-line block">
                  {t.meetKhoudia.title2}
                </span>
                <span className="meet-khoudia-slogan-line mk-slogan-line block italic">
                  {t.meetKhoudia.title3}
                </span>
              </h1>
              <div className="mt-8 space-y-6 font-serif font-normal leading-[1.6] md:mt-10">
                <p className="mk-fade-up m-0 text-[clamp(1.05rem,1.5vw,1.25rem)] text-black/90">
                  {t.meetKhoudia.intro}
                </p>
                <p className="mk-fade-up m-0 text-[clamp(1.05rem,1.5vw,1.25rem)] text-black/90">
                  {t.meetKhoudia.p1}
                </p>
              </div>
            </div>

            <div className="meet-khoudia-hero__portrait md:col-span-5 md:col-start-8">
              <PortraitFrame
                src={PORTRAIT_SRC}
                alt={t.meetKhoudia.portraitAlt}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="meet-khoudia-studio mx-auto w-full max-w-[1320px] px-5 pb-20 pt-8 sm:px-8 md:pb-28 md:pt-16">
        <div className="grid grid-cols-1 items-center gap-x-12 gap-y-12 md:grid-cols-12 md:gap-x-10">
          <div className="meet-khoudia-studio__portrait order-1 md:order-none md:col-span-5">
            <PortraitFrame
              src={STUDIO_SRC}
              alt={t.meetKhoudia.studioAlt}
            />
          </div>

          <div className="meet-khoudia-studio__copy order-2 flex flex-col gap-10 md:order-none md:col-span-7 md:gap-14">
            <p className="meet-khoudia-studio__lead mk-fade-up m-0 max-w-[34em] font-serif text-[clamp(1.55rem,2.55vw,2.35rem)] font-normal leading-[1.48] tracking-[-0.012em] text-black">
              {t.meetKhoudia.p2}
            </p>
            <div className="meet-khoudia-studio__prose flex max-w-[38em] flex-col gap-5 font-serif text-[clamp(1.0625rem,1.35vw,1.2rem)] font-normal leading-[1.62] text-black md:gap-6">
              <p className="mk-fade-up m-0">{t.meetKhoudia.p3}</p>
              <p className="mk-fade-up m-0">{t.meetKhoudia.p4}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="meet-khoudia-final-cta mx-auto w-full max-w-[1320px] px-5 pb-28 sm:px-8 md:pb-36">
        <div className="grid grid-cols-1 items-center gap-x-10 gap-y-10 md:grid-cols-12 md:gap-x-12">
          <div className="order-1 md:col-span-5 md:row-start-1">
            <p className="mk-fade-up m-0 font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-normal italic leading-[1.35] text-black">
              {t.meetKhoudia.ctaIntro}
            </p>
          </div>

          <div className="order-2 md:order-3 md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1">
            <div className="mk-image-reveal flex w-full justify-center md:justify-end">
              <div className="mk-image-reveal-mask relative w-full max-w-[min(100%,480px)] md:max-w-none">
                <div className="mk-image-zoom relative">
                  <Image
                    src={WEDDING_CAKE_SRC}
                    alt={t.meetKhoudia.cakeAlt}
                    width={1183}
                    height={1329}
                    quality={92}
                    sizes="(max-width: 767px) 94vw, 58vw"
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="order-3 md:order-2 md:col-span-5 md:col-start-1 md:row-start-2">
            <div className="mk-fade-up mt-0 md:mt-8">
              <SiteHeaderOrderLink
                label={t.meetKhoudia.createCake}
                ariaLabel={t.meetKhoudia.createCakeAria}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
