import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  LOCALE_COOKIE,
  isSearchEngineCrawler,
  resolvePreferredLocale,
} from "@/i18n/detect-locale";
import type { Locale } from "@/i18n/config";
import { toCanonicalPath, toLocalizedBarePath } from "@/i18n/pathnames";
import { localizedPath, stripLocaleFromPathname } from "@/i18n/routing";

const LOCALE_HEADER = "x-site-locale";

function withLocale(response: NextResponse, locale: Locale) {
  response.headers.set(LOCALE_HEADER, locale);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const onFrenchPath = pathname === "/fr" || pathname.startsWith("/fr/");
  const isCrawler = isSearchEngineCrawler(request.headers.get("user-agent"));

  const preferredLocale = resolvePreferredLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );

  const barePath = stripLocaleFromPathname(pathname);
  const canonicalBare = toCanonicalPath(barePath);

  if (!isCrawler && preferredLocale !== "fr" && onFrenchPath) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(canonicalBare, "en");
    return withLocale(NextResponse.redirect(url), "en");
  }

  if (!isCrawler && preferredLocale === "fr" && !onFrenchPath) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(canonicalBare, "fr");
    return withLocale(NextResponse.redirect(url), "fr");
  }

  if (onFrenchPath) {
    const frenchBare = toLocalizedBarePath(canonicalBare, "fr");

    if (barePath !== frenchBare) {
      const url = request.nextUrl.clone();
      url.pathname = frenchBare === "/" ? "/fr" : `/fr${frenchBare}`;
      return withLocale(NextResponse.redirect(url), "fr");
    }

    if (barePath !== canonicalBare) {
      const url = request.nextUrl.clone();
      url.pathname = canonicalBare === "/" ? "/fr" : `/fr${canonicalBare}`;
      return withLocale(NextResponse.rewrite(url), "fr");
    }

    return withLocale(NextResponse.next(), "fr");
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = canonicalBare === "/" ? "/en" : `/en${canonicalBare}`;

  return withLocale(NextResponse.rewrite(rewriteUrl), "en");
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
