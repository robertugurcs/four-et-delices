"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/i18n/config";
import { LOCALE_COOKIE } from "@/i18n/detect-locale";
import { useLocale } from "@/i18n/LocaleProvider";
import { switchLocalePath } from "@/i18n/routing";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

function FlagEn() {
  return (
    <svg
      className="lang-switcher__flag"
      viewBox="0 0 60 30"
      width="18"
      height="12"
      aria-hidden
    >
      <clipPath id="lang-switcher-gb-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="lang-switcher-gb-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 z v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#lang-switcher-gb-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 60,30 M60,0 0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 60,30 M60,0 0,30"
          clipPath="url(#lang-switcher-gb-t)"
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

export function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale, dictionary: t } = useLocale();

  const enHref = switchLocalePath(pathname, "en");
  const frHref = switchLocalePath(pathname, "fr");

  return (
    <div
      className="lang-switcher"
      role="group"
      aria-label={t.lang.label}
      data-no-cursor-grow
    >
      <Link
        href={enHref}
        className={`lang-switcher__btn${locale === "en" ? " lang-switcher__btn--active" : ""}`}
        aria-current={locale === "en" ? "true" : undefined}
        aria-label={t.lang.switchToEn}
        onClick={() => rememberLocale("en")}
      >
        <FlagEn />
        <span className="lang-switcher__code">{t.lang.en}</span>
      </Link>
      <span className="lang-switcher__sep" aria-hidden>
        /
      </span>
      <Link
        href={frHref}
        className={`lang-switcher__btn${locale === "fr" ? " lang-switcher__btn--active" : ""}`}
        aria-current={locale === "fr" ? "true" : undefined}
        aria-label={t.lang.switchToFr}
        onClick={() => rememberLocale("fr")}
      >
        <FlagFr />
        <span className="lang-switcher__code">{t.lang.fr}</span>
      </Link>
    </div>
  );
}
