import type { Metadata } from "next";

import { locales, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

import { absoluteUrl } from "./site-url";

const DEFAULT_OG_IMAGE = "/assets/hero-poster.jpg";

type PageMetadataInput = {
  locale: Locale;
  /** Internal App Router path, e.g. `/cakes/kids/b-1`. */
  pathname: string;
  title: string;
  description: string;
  siteName: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  locale,
  pathname,
  title,
  description,
  siteName,
  keywords,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonicalPath = localizedPath(pathname, locale);
  const url = absoluteUrl(canonicalPath);
  const ogImage = absoluteUrl(image);

  const languages = Object.fromEntries(
    locales.map((loc) => [loc, absoluteUrl(localizedPath(pathname, loc))]),
  );
  languages["x-default"] = absoluteUrl(localizedPath(pathname, "fr"));

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_SN" : "en_US",
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_SN"],
      url,
      siteName,
      title,
      description,
      images: [{ url: ogImage, alt: imageAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
