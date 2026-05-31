import { defaultLocale, type Locale } from "@/i18n/config";

export const LOCALE_COOKIE = "site-locale";

type LangRange = { lang: string; q: number };

function parseAcceptLanguage(header: string | null): LangRange[] {
  if (!header) return [];

  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1]!) : 1;

      return {
        lang: tag.trim().toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .sort((a, b) => b.q - a.q);
}

function primaryLanguage(tag: string): string {
  return tag.split("-")[0] ?? tag;
}

/** French → fr, English → en, everything else → en. */
export function detectLocaleFromAcceptLanguage(
  header: string | null,
): Locale {
  for (const { lang } of parseAcceptLanguage(header)) {
    const primary = primaryLanguage(lang);
    if (primary === "fr") return "fr";
    if (primary === "en") return "en";
  }

  return defaultLocale;
}

export function resolvePreferredLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (cookieValue === "en" || cookieValue === "fr") return cookieValue;
  return detectLocaleFromAcceptLanguage(acceptLanguage);
}
