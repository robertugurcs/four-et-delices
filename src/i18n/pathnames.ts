import type { CakeCategoryId } from "@/data/our-cakes";
import type { Locale } from "@/i18n/config";

const STATIC_ROUTE_SLUGS = {
  "meet-khoudia": "rencontrer-khoudia",
  inquiry: "demande-gateau",
  cakes: "gateaux",
} as const;

const CATEGORY_SLUGS: Record<CakeCategoryId, string> = {
  kids: "enfants",
  birthdays: "anniversaires",
  corporate: "entreprise",
  weddings: "mariages",
};

const FR_STATIC_TO_CANONICAL = Object.fromEntries(
  Object.entries(STATIC_ROUTE_SLUGS).map(([canonical, fr]) => [fr, canonical]),
) as Record<string, keyof typeof STATIC_ROUTE_SLUGS>;

const FR_CATEGORY_TO_CANONICAL = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([canonical, fr]) => [fr, canonical]),
) as Record<string, CakeCategoryId>;

function splitBarePath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function joinBarePath(segments: string[]): string {
  return segments.length ? `/${segments.join("/")}` : "/";
}

function localizeFirstSegment(segment: string, locale: Locale): string {
  if (locale !== "fr") return segment;

  const canonical = segment as keyof typeof STATIC_ROUTE_SLUGS;
  if (canonical in STATIC_ROUTE_SLUGS) {
    return STATIC_ROUTE_SLUGS[canonical];
  }

  return segment;
}

function canonicalizeFirstSegment(segment: string): string {
  return FR_STATIC_TO_CANONICAL[segment] ?? segment;
}

function localizeCategorySegment(segment: string, locale: Locale): string {
  if (locale !== "fr") return segment;

  const canonical = segment as CakeCategoryId;
  return CATEGORY_SLUGS[canonical] ?? segment;
}

function canonicalizeCategorySegment(segment: string): string {
  return FR_CATEGORY_TO_CANONICAL[segment] ?? segment;
}

/** Map a localized bare path back to the internal App Router path. */
export function toCanonicalPath(barePath: string): string {
  const segments = splitBarePath(barePath);
  if (!segments.length) return "/";

  segments[0] = canonicalizeFirstSegment(segments[0]);

  if (segments[0] === "cakes" && segments[1]) {
    segments[1] = canonicalizeCategorySegment(segments[1]);
  }

  return joinBarePath(segments);
}

/** Map an internal path to the locale-specific bare path shown in the URL. */
export function toLocalizedBarePath(canonicalPath: string, locale: Locale): string {
  const segments = splitBarePath(canonicalPath);
  if (!segments.length) return "/";

  segments[0] = localizeFirstSegment(segments[0], locale);

  const cakesSegment = locale === "fr" ? STATIC_ROUTE_SLUGS.cakes : "cakes";
  if (segments[0] === cakesSegment && segments[1]) {
    segments[1] = localizeCategorySegment(segments[1], locale);
  }

  return joinBarePath(segments);
}
