"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import type { Locale } from "@/i18n/config";
import { LOCALE_COOKIE } from "@/i18n/detect-locale";
import { useLocale } from "@/i18n/LocaleProvider";
import { switchLocalePath } from "@/i18n/routing";
import { beginLocaleSwitch } from "@/lib/locale-switch";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

function FlagEn() {
  const stripeHeight = 30 / 13;

  return (
    <svg
      className="lang-switcher__flag"
      viewBox="0 0 60 30"
      width="18"
      height="12"
      aria-hidden
    >
      <rect width="60" height="30" fill="#B22234" />
      {Array.from({ length: 6 }, (_, index) => (
        <rect
          key={index}
          y={stripeHeight * (index * 2 + 1)}
          width="60"
          height={stripeHeight}
          fill="#fff"
        />
      ))}
      <rect width="24" height={stripeHeight * 7} fill="#3C3B6E" />
      {[
        [3, 2.2],
        [7.5, 2.2],
        [12, 2.2],
        [16.5, 2.2],
        [21, 2.2],
        [5.25, 5.4],
        [9.75, 5.4],
        [14.25, 5.4],
        [18.75, 5.4],
        [3, 8.6],
        [7.5, 8.6],
        [12, 8.6],
        [16.5, 8.6],
        [21, 8.6],
        [5.25, 11.8],
        [9.75, 11.8],
        [14.25, 11.8],
        [18.75, 11.8],
      ].map(([cx, cy], index) => (
        <circle key={index} cx={cx} cy={cy} r="0.95" fill="#fff" />
      ))}
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
  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  const enHref = switchLocalePath(pathname, "en");
  const frHref = switchLocalePath(pathname, "fr");

  const switchLocale = (next: Locale) => {
    if (pending) return;
    if (next === locale && next === activeLocale) return;

    const href = switchLocalePath(pathname, next);
    rememberLocale(next);
    setActiveLocale(next);
    beginLocaleSwitch();

    startTransition(() => {
      router.push(href);
      router.refresh();
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
          <FlagEn />
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
