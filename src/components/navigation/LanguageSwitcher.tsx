"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";

import type { Locale } from "@/i18n/config";
import { LOCALE_COOKIE } from "@/i18n/detect-locale";
import { useLocale } from "@/i18n/LocaleProvider";
import { switchLocalePath } from "@/i18n/routing";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

function FlagEn({ clipSuffix }: { clipSuffix: string }) {
  return (
    <svg
      className="lang-switcher__flag"
      viewBox="0 0 60 30"
      width="18"
      height="12"
      aria-hidden
    >
      <clipPath id={`lang-switcher-gb-s-${clipSuffix}`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`lang-switcher-gb-t-${clipSuffix}`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 z v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#lang-switcher-gb-s-${clipSuffix})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 60,30 M60,0 0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 60,30 M60,0 0,30"
          clipPath={`url(#lang-switcher-gb-t-${clipSuffix})`}
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function FlagFr() {
  return (
    <svg
      className="lang-switcher__flag"
      viewBox="0 0 3 2"
      width="18"
      height="12"
      aria-hidden
    >
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
  );
}

type LanguageSwitcherProps = {
  /** fixed = bottom-right pill; inline = mobile menu embed */
  placement?: "fixed" | "inline";
  onNavigate?: () => void;
};

export function LanguageSwitcher({
  placement = "fixed",
  onNavigate,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, dictionary: t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [activeLocale, setActiveLocale] = useState(locale);
  const clipSuffix = useId().replace(/:/g, "");

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  const enHref = switchLocalePath(pathname, "en");
  const frHref = switchLocalePath(pathname, "fr");

  const switchLocale = (next: Locale) => {
    if (next === locale || pending) return;

    const href = switchLocalePath(pathname, next);
    rememberLocale(next);
    setActiveLocale(next);

    startTransition(() => {
      router.push(href, { scroll: false });
    });

    if (onNavigate) {
      window.setTimeout(onNavigate, 0);
    }
  };

  return (
    <div
      className={`lang-switcher lang-switcher--${placement}${pending ? " lang-switcher--pending" : ""}`}
      role="group"
      aria-label={t.lang.label}
      aria-busy={pending || undefined}
      data-locale={activeLocale}
      data-no-cursor-grow
      data-no-route-transition
      onTouchStart={() => {}}
    >
      <div className="lang-switcher__track">
        <span className="lang-switcher__indicator" aria-hidden />
        <Link
          href={enHref}
          prefetch
          scroll={false}
          className={`lang-switcher__btn${activeLocale === "en" ? " lang-switcher__btn--active" : ""}`}
          aria-current={activeLocale === "en" ? "true" : undefined}
          aria-label={t.lang.switchToEn}
          aria-disabled={pending || undefined}
          onClick={(event) => {
            event.preventDefault();
            switchLocale("en");
          }}
        >
          <FlagEn clipSuffix={clipSuffix} />
          <span className="lang-switcher__code">{t.lang.en}</span>
        </Link>
        <Link
          href={frHref}
          prefetch
          scroll={false}
          className={`lang-switcher__btn${activeLocale === "fr" ? " lang-switcher__btn--active" : ""}`}
          aria-current={activeLocale === "fr" ? "true" : undefined}
          aria-label={t.lang.switchToFr}
          aria-disabled={pending || undefined}
          onClick={(event) => {
            event.preventDefault();
            switchLocale("fr");
          }}
        >
          <FlagFr />
          <span className="lang-switcher__code">{t.lang.fr}</span>
        </Link>
      </div>
    </div>
  );
}
