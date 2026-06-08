"use client";

import { useState } from "react";
import Link from "next/link";

import { HomeBrandLink } from "@/components/navigation/HomeBrandLink";
import { OurCakesLink } from "@/components/navigation/OurCakesLink";
import { GelSocialButtons } from "@/components/footer/GelSocialButtons";
import { WebsiteDesignBtnScene } from "@/components/footer/WebsiteDesignBtnScene";
import { WebsiteDesignCredits } from "@/components/footer/WebsiteDesignCredits";
import { useLocale, useTranslations } from "@/i18n/LocaleProvider";

/** Store contact — footer display + inquiry inbox (see OWNER_EMAIL in .env.local). */
const FOOTER_CONTACT_EMAIL = "dakar.four.et.delices@gmail.com";
const FOOTER_PHONE_DISPLAY = "+221 77 728 96 02";
const FOOTER_PHONE_TEL = "tel:+221777289602";
const FOOTER_TIKTOK_HREF = "https://www.tiktok.com/@fouretdelices";
const FOOTER_WORDMARK_SRC = "/assets/four-et-delices-wordmark.webp";

/**
 * Compact brand footer — wordmark raster, nav, contact, socials.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const t = useTranslations();
  const { path } = useLocale();
  const [creditsOpen, setCreditsOpen] = useState(false);

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        <div className="site-footer__main">
          <HomeBrandLink
            className="site-footer__brand"
            aria-label={t.nav.brandHome}
          >
            <img
              src={FOOTER_WORDMARK_SRC}
              alt=""
              width={3072}
              height={2046}
              loading="lazy"
              decoding="async"
              className="site-footer__brand-wordmark-img"
              aria-hidden
            />
            <span className="sr-only">{t.nav.brandName}</span>
          </HomeBrandLink>
          <nav className="site-footer__nav" aria-label={t.footer.footer}>
            <OurCakesLink className="site-footer__nav-link">
              {t.nav.ourCakes}
            </OurCakesLink>
            <Link href={path("/meet-khoudia")} className="site-footer__nav-link">
              {t.nav.meetKhoudia}
            </Link>
            <a
              href={FOOTER_TIKTOK_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer__nav-link site-footer__nav-link--external"
            >
              {t.nav.tiktok}
              <span aria-hidden className="site-footer__nav-arrow">
                <svg viewBox="0 0 12 12" aria-hidden>
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
            </a>
          </nav>

          <div className="site-footer__socials" aria-label={t.footer.social}>
            <GelSocialButtons />
            <button
              type="button"
              className="site-footer__design-btn"
              onClick={() => setCreditsOpen(true)}
              aria-label={t.footer.websiteDesign}
              aria-haspopup="dialog"
              data-no-cursor-grow
            >
              <WebsiteDesignBtnScene />
            </button>
          </div>
        </div>

        <div className="site-footer__meta">
          <section className="site-footer__contact" aria-label={t.footer.contact}>
            <span className="site-footer__location">{t.footer.location}</span>
            <a className="site-footer__contact-line" href={`mailto:${FOOTER_CONTACT_EMAIL}`}>
              {FOOTER_CONTACT_EMAIL}
            </a>
            <a className="site-footer__contact-line" href={FOOTER_PHONE_TEL}>
              {FOOTER_PHONE_DISPLAY}
            </a>
          </section>

          <p className="site-footer__credit">
            <span>{t.footer.copyright.replace("{year}", String(year))}</span>
            <span aria-hidden>·</span>
            <span>{t.footer.tagline}</span>
          </p>
        </div>
      </div>

      <WebsiteDesignCredits
        open={creditsOpen}
        onClose={() => setCreditsOpen(false)}
      />
    </footer>
  );
}
