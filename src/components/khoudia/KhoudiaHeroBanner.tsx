"use client";

import Image from "next/image";

import { KhoudiaStoryBlobButton } from "@/components/khoudia/KhoudiaStoryBlobButton";
import { useLocale, useTranslations } from "@/i18n/LocaleProvider";

const DESKTOP_STORY_PNG_SRC = "/assets/khoudia/khoudia-desktop-english.png";
/** Exported artboard size — keeps aspect ratio stable while scaling. */
const DESKTOP_STORY_NATURAL_W = 1672;
const DESKTOP_STORY_NATURAL_H = 941;

const MOBILE_STORY_PNG_SRC = "/assets/khoudia/khoudia-mobil-english.png";
const MOBILE_STORY_NATURAL_W = 923;
const MOBILE_STORY_NATURAL_H = 540;

const DESKTOP_HERO_SRC = "/assets/khoudia/hd-version.png";
const MOBILE_HERO_SRC = "/assets/khoudia/khoudia-mobile.png";

/**
 * Meet Khoudia band: desktop uses wide panorama (`hd-version.png`);
 * mobile uses portrait crop (`khoudia-mobile.png`). Desktop story graphic overlays the hero.
 */
export function KhoudiaHeroBanner() {
  const t = useTranslations();
  const { path } = useLocale();
  const meetKhoudiaHref = path("/meet-khoudia");

  return (
    <section
      id="meet-khoudia"
      aria-label={t.home.khoudiaSection}
      className="relative z-[0] mb-0 ml-0 mr-0 -mt-[clamp(78px,14vw,188px)] box-border w-full max-w-full overflow-x-clip bg-[#fbf4eb] p-0 pb-0 pt-0 leading-none"
    >
      <div
        className="relative m-0 w-full overflow-hidden p-0 leading-none"
        style={{ height: "clamp(500px, 80vw, 900px)" }}
      >
        <Image
          alt={t.home.khoudiaHeroAlt}
          src={MOBILE_HERO_SRC}
          fill
          sizes="(max-width: 767px) 100vw, 1px"
          className="m-0 block bg-transparent object-cover object-[50%_22%] p-0 md:hidden"
          quality={92}
          priority
          loading="eager"
        />
        <Image
          alt={t.home.khoudiaHeroAlt}
          src={DESKTOP_HERO_SRC}
          fill
          sizes="(min-width: 768px) 100vw, 1px"
          className="m-0 hidden bg-transparent object-cover object-[50%_12%] p-0 md:block"
          quality={92}
          loading="eager"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] flex items-start justify-start px-4 pb-[max(1rem,3vw)] pt-[calc(var(--site-header-scroll-margin)+0.4rem)] md:items-center md:justify-center md:px-6 md:pb-8 md:pt-8"
        >
          <div
            className="khoudia-hero-banner__overlay flex w-full max-w-[min(98vw,680px)] shrink-0 flex-col items-start gap-6 bg-transparent md:max-w-[min(62vw,740px)] md:-translate-x-[clamp(2.95rem,19vw,17.25rem)] md:translate-y-[clamp(2.25rem,4.75vw,5.75rem)] md:items-center md:gap-2"
          >
            <div className="relative z-[2] flex w-full max-w-full flex-col items-start gap-y-2.5 pt-1 md:hidden">
              <Image
                alt={t.home.khoudiaMobileAlt}
                src={MOBILE_STORY_PNG_SRC}
                width={MOBILE_STORY_NATURAL_W}
                height={MOBILE_STORY_NATURAL_H}
                sizes="(max-width: 768px) 38vw"
                className="mt-5 h-auto w-auto max-h-[clamp(72px,20vw,112px)] max-w-[min(50vw,152px)] -translate-x-0.5 bg-transparent object-contain object-left"
                unoptimized
                priority
                loading="eager"
              />
              <div className="pointer-events-auto self-start translate-x-5 pl-1">
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
              className="mx-auto hidden h-auto w-full bg-transparent object-contain object-center md:block"
              unoptimized
              priority={false}
            />
            <div className="khoudia-hero-banner__cta-block hidden w-full flex-col items-center md:flex md:-mt-[clamp(2.75rem,10vw,6.75rem)] md:gap-1">
              <p className="khoudia-hero-banner__prose m-0 max-w-[min(98vw,520px)] px-1 text-center font-serif text-lg font-normal leading-relaxed tracking-[0.02em] text-neutral-950">
                {t.home.khoudiaDesktopProse}
              </p>
              <div className="pointer-events-auto flex w-full justify-center pt-0">
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
