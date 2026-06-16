import { defaultLocale, type Locale } from "@/i18n/config";
import { toCanonicalPath, toLocalizedBarePath } from "@/i18n/pathnames";

export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "fr";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return defaultLocale;
}

/** Strip `/fr` or `/en` prefix for route matching and link building. */
export function stripLocaleFromPathname(pathname: string): string {
  if (pathname === "/fr") return "/";
  if (pathname.startsWith("/fr/")) return pathname.slice(3) || "/";
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  return pathname;
}

export function isHomePath(pathname: string): boolean {
  return stripLocaleFromPathname(pathname) === "/";
}

export function getCanonicalBarePath(pathname: string): string {
  return toCanonicalPath(stripLocaleFromPathname(pathname));
}

export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const canonicalBare = toCanonicalPath(stripLocaleFromPathname(normalized));
  const localizedBare = toLocalizedBarePath(canonicalBare, locale);

  if (locale === "fr") {
    return localizedBare === "/" ? "/fr" : `/fr${localizedBare}`;
  }

  return localizedBare;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  const canonicalBare = toCanonicalPath(stripLocaleFromPathname(pathname));
  return localizedPath(canonicalBare, locale);
}

/** True when href is the same route with only the /en ↔ /fr prefix changed. */
export function isLocaleOnlyPathSwitch(pathname: string, href: string): boolean {
  try {
    const url = new URL(href, "http://local");
    return (
      getCanonicalBarePath(url.pathname) === getCanonicalBarePath(pathname)
    );
  } catch {
    return false;
  }
}
