"use client";

import Image from "next/image";

import { KhoudiaStoryBlobButton } from "@/components/khoudia/KhoudiaStoryBlobButton";
import { useLocale, useTranslations } from "@/i18n/LocaleProvider";

const DESKTOP_STORY_PNG_SRC = "/assets/khoudia/khoudia-desktop-english.webp";
/** Exported artboard size — keeps aspect ratio stable while scaling. */
const DESKTOP_STORY_NATURAL_W = 1672;
const DESKTOP_STORY_NATURAL_H = 941;

const MOBILE_STORY_PNG_SRC = "/assets/khoudia/khoudia-mobil-english.webp";
const MOBILE_STORY_NATURAL_W = 923;
const MOBILE_STORY_NATURAL_H = 540;

/** Laptop (≥1024px) — landscape festive hero. */
const LAPTOP_HERO_SRC = "/assets/khoudia/khoudia-hero-laptop.png";
const LAPTOP_HERO_NATURAL_W = 1536;
const LAPTOP_HERO_NATURAL_H = 1024;

/** iPad (768px–1023px) — landscape festive hero. */
const IPAD_HERO_SRC = "/assets/khoudia/khoudia-hero-ipad.png";
const IPAD_HERO_NATURAL_W = 1448;
const IPAD_HERO_NATURAL_H = 1086;

/** Phone (<768px) — portrait festive hero. */
const PHONE_HERO_SRC = "/assets/khoudia/khoudia-hero-phone.jpg";
const PHONE_HERO_NATURAL_W = 4290;
const PHONE_HERO_NATURAL_H = 5362;

/**
 * Meet Khoudia band: festive hero photo with story graphic overlay.
 */
export function KhoudiaHeroBanner() {
  const t = useTranslations();
  const { path } = useLocale();
  const meetKhoudiaHref = path("/meet-khoudia");

  return (
    <section
      id="meet-khoudia"
      aria-label={t.home.khoudiaSection}
      className="relative z-[0] mb-0 ml-0 mr-0 -mt-[clamp(78px,14vw,188px)] box-border w-full max-w-full overflow-x-clip p-0 pb-0 pt-0 leading-none"
    >
      <div className="khoudia-hero-banner__stage relative m-0 w-full overflow-hidden p-0 leading-none">
        <Image
          alt={t.home.khoudiaHeroAlt}
          src={LAPTOP_HERO_SRC}
          width={LAPTOP_HERO_NATURAL_W}
          height={LAPTOP_HERO_NATURAL_H}
          sizes="100vw"
          className="khoudia-hero-banner__photo m-0 p-0"
          unoptimized
          priority
          loading="eager"
        />
        <Image
          alt={t.home.khoudiaHeroAlt}
          src={IPAD_HERO_SRC}
          width={IPAD_HERO_NATURAL_W}
          height={IPAD_HERO_NATURAL_H}
          sizes="100vw"
          className="khoudia-hero-banner__photo khoudia-hero-banner__photo--ipad-only m-0 p-0"
          unoptimized
          priority
          loading="eager"
        />
        <Image
          alt={t.home.khoudiaHeroAlt}
          src={PHONE_HERO_SRC}
          width={PHONE_HERO_NATURAL_W}
          height={PHONE_HERO_NATURAL_H}
          sizes="100vw"
          className="khoudia-hero-banner__photo khoudia-hero-banner__photo--phone-only m-0 p-0"
          unoptimized
          priority
          loading="eager"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] flex items-start justify-end px-4 pb-[max(1rem,3vw)] pt-[calc(var(--site-header-scroll-margin)+0.4rem)] md:justify-start md:px-[clamp(1rem,3vw,2.75rem)] md:pb-6 md:pt-[calc(var(--site-header-scroll-margin)+0.2rem)]"
        >
          <div
            className="khoudia-hero-banner__overlay flex w-full max-w-[min(98vw,680px)] shrink-0 flex-col items-end gap-6 bg-transparent md:max-w-[min(58vw,700px)] md:items-center md:gap-2"
          >
            <div className="khoudia-hero-banner__mobile-intro relative z-[2] flex w-full max-w-full flex-col items-end gap-y-2.5 md:hidden">
              <Image
                alt={t.home.khoudiaMobileAlt}
                src={MOBILE_STORY_PNG_SRC}
                width={MOBILE_STORY_NATURAL_W}
                height={MOBILE_STORY_NATURAL_H}
                sizes="(max-width: 768px) 38vw"
                className="h-auto w-auto max-h-[clamp(72px,20vw,112px)] max-w-[min(50vw,152px)] bg-transparent object-contain object-right"
                unoptimized
                priority
                loading="eager"
              />
              <div className="khoudia-hero-banner__mobile-story-cta pointer-events-auto self-end pr-1">
                <KhoudiaStoryBlobButton
                  href={meetKhoudiaHref}
                  label={t.home.khoudiaStory}
                  className="meet-khoudia-story-btn--compact"
                />
              </div>
            </div>
            <Image
              alt={t.home.khoudiaDesktopAlt}
              src={DESKTOP_STORY_PNG_SRC}
              width={DESKTOP_STORY_NATURAL_W}
              height={DESKTOP_STORY_NATURAL_H}
              sizes="(max-width: 768px) 98vw, min(740px, 62vw)"
              className="khoudia-hero-banner__desktop-story mx-auto hidden h-auto w-full bg-transparent object-contain object-center md:block"
              unoptimized
              priority={false}
            />
            <div className="khoudia-hero-banner__cta-block hidden w-full flex-col items-center md:flex md:-mt-[clamp(2.75rem,10vw,6.75rem)] md:gap-1">
              <p className="khoudia-hero-banner__prose typography-prose m-0 max-w-[min(98vw,520px)] px-1 text-center font-serif text-lg font-normal leading-relaxed tracking-[0.02em] text-black">
                {t.home.khoudiaDesktopProse}
              </p>
              <div className="khoudia-hero-banner__story-cta pointer-events-auto flex w-full justify-center pt-0">
                <KhoudiaStoryBlobButton
                  href={meetKhoudiaHref}
                  label={t.home.khoudiaStory}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
