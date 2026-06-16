import type { OurCake } from "@/data/our-cakes";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

import { absoluteUrl } from "./site-url";

const SOCIAL_PROFILES = [
  "https://www.instagram.com/four_et_delices/",
  "https://www.tiktok.com/@fouretdelices",
  "https://wa.me/221777289602",
];

const DAKAR_GEO = {
  "@type": "GeoCoordinates",
  latitude: 14.7167,
  longitude: -17.4677,
};

export function buildOrganizationJsonLd({
  name,
  description,
  locale,
}: {
  name: string;
  description: string;
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${absoluteUrl(localizedPath("/", locale))}#organization`,
    name,
    description,
    url: absoluteUrl(localizedPath("/", locale)),
    image: absoluteUrl("/assets/four-et-delices-wordmark.webp"),
    logo: absoluteUrl("/assets/four-et-delices-wordmark.webp"),
    telephone: "+221777289602",
    email: "fouretdelices@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dakar",
      addressRegion: "Dakar",
      addressCountry: "SN",
    },
    geo: DAKAR_GEO,
    areaServed: {
      "@type": "City",
      name: "Dakar",
    },
    sameAs: SOCIAL_PROFILES,
    priceRange: "$$",
    servesCuisine: locale === "fr" ? "Pâtisserie" : "Cake",
    knowsAbout:
      locale === "fr"
        ? [
            "gâteaux sur mesure",
            "gâteaux de mariage",
            "gâteaux d'anniversaire",
            "pâtisserie artisanale",
          ]
        : [
            "bespoke cakes",
            "wedding cakes",
            "birthday cakes",
            "celebration patisserie",
          ],
  };
}

export function buildWebsiteJsonLd({
  name,
  description,
  locale,
}: {
  name: string;
  description: string;
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl(localizedPath("/", locale))}#website`,
    name,
    description,
    url: absoluteUrl(localizedPath("/", locale)),
    inLanguage: locale === "fr" ? "fr-SN" : "en-US",
    publisher: {
      "@id": `${absoluteUrl(localizedPath("/", locale))}#organization`,
    },
  };
}

export function buildProductJsonLd({
  cake,
  locale,
  categoryTitle,
}: {
  cake: OurCake;
  locale: Locale;
  categoryTitle: string;
}) {
  const path = localizedPath(`/cakes/${cake.categoryId}/${cake.id}`, locale);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cake.title,
    description: cake.description,
    image: absoluteUrl(cake.angles.angle1),
    url: absoluteUrl(path),
    inLanguage: locale === "fr" ? "fr-SN" : "en-US",
    brand: {
      "@type": "Brand",
      name: "Four et Délices",
    },
    category: categoryTitle,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/PreOrder",
      priceCurrency: "XOF",
      url: absoluteUrl(localizedPath("/inquiry", locale)),
      areaServed: {
        "@type": "City",
        name: "Dakar",
      },
    },
  };
}
