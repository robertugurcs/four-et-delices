import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { LOCALE_COOKIE, resolvePreferredLocale } from "@/i18n/detect-locale";
import { stripLocaleFromPathname } from "@/i18n/routing";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const onFrenchPath = pathname === "/fr" || pathname.startsWith("/fr/");

  const preferredLocale = resolvePreferredLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );

  const barePath = stripLocaleFromPathname(pathname);

  if (preferredLocale === "fr") {
    if (!onFrenchPath) {
      const url = request.nextUrl.clone();
      url.pathname = barePath === "/" ? "/fr" : `/fr${barePath}`;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (onFrenchPath) {
    const url = request.nextUrl.clone();
    url.pathname = barePath;
    return NextResponse.redirect(url);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = barePath === "/" ? "/en" : `/en${barePath}`;

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
