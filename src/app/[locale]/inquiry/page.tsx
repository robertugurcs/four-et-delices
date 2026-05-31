import type { Metadata } from "next";

import { CakeInquiryForm } from "@/components/cake-inquiry/CakeInquiryForm";
import { InquiryHero } from "@/components/cake-inquiry/InquiryHero";
import { SiteHeader } from "@/components/site-header/SiteHeader";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type InquiryPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: InquiryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(locale);

  return {
    title: t.meta.inquiryTitle,
    description: t.meta.inquiryDescription,
  };
}

export default function InquiryPage() {
  return (
    <main className="iq-page">
      <SiteHeader />
      <InquiryHero />
      <CakeInquiryForm />

      <style>{`
        .iq-page {
          min-height: 100dvh;
          background: #fff9f2;
          overflow-x: clip;
        }

        .iq-hero {
          position: relative;
          overflow: hidden;
          background: #f5c0ce;
          padding-top: calc(var(--site-header-scroll-margin, 5rem) + 2.25rem);
          padding-bottom: clamp(2.5rem, 6vw, 4rem);
          padding-inline: 1.5rem;
          text-align: center;
        }

        .iq-hero__floats {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        @keyframes iq-float {
          0%   { transform: translateY(120%) rotate(-6deg) scale(0.9); opacity: 0;    }
          10%  { opacity: 0.65; }
          50%  { transform: translateY(-10%) rotate(4deg) scale(1.05);  opacity: 0.6; }
          90%  { opacity: 0.55; }
          100% { transform: translateY(-120%) rotate(10deg) scale(0.9); opacity: 0;   }
        }

        .iq-hero__float {
          position: absolute;
          bottom: -8%;
          animation: iq-float ease-in-out infinite;
          opacity: 0;
          filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.1));
          user-select: none;
          line-height: 1;
          will-change: transform, opacity;
        }

        .iq-hero__inner {
          position: relative;
          z-index: 1;
          max-width: 38rem;
          margin-inline: auto;
        }

        .iq-hero__label {
          margin: 0 0 0.75rem;
          font-family: "Eighties Comeback", serif;
          font-size: clamp(0.62rem, 1.1vw, 0.78rem);
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a03050;
        }

        .iq-hero__title {
          margin: 0 0 0.9rem;
          font-family: "Eighties Comeback", serif;
          font-size: clamp(1.9rem, 4.8vw, 3rem);
          font-weight: 700;
          line-height: 1.1;
          color: #2e1218;
          letter-spacing: -0.01em;
        }

        .iq-hero__sub {
          margin: 0;
          font-family: "Eighties Comeback", serif;
          font-size: clamp(0.95rem, 1.8vw, 1.1rem);
          font-style: italic;
          color: #7a3040;
          opacity: 0.88;
        }
      `}</style>
    </main>
  );
}
