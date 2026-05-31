import { defaultLocale, type Locale } from "@/i18n/config";

export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "fr";
  return defaultLocale;
}

/** Strip `/fr` prefix for route matching and link building. */
export function stripLocaleFromPathname(pathname: string): string {
  if (pathname === "/fr") return "/";
  if (pathname.startsWith("/fr/")) return pathname.slice(3) || "/";
  return pathname;
}

export function isHomePath(pathname: string): boolean {
  return stripLocaleFromPathname(pathname) === "/";
}

export function localizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const bare = stripLocaleFromPathname(normalized);

  if (locale === "fr") {
    return bare === "/" ? "/fr" : `/fr${bare}`;
  }

  return bare;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  const bare = stripLocaleFromPathname(pathname);
  return localizedPath(bare, locale);
}
