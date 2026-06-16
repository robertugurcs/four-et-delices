import type { Locale } from "@/i18n/config";

/** Non-breaking space before French punctuation and inside guillemets. */
const SPACE_BEFORE_PUNCT = /[\s\u00A0]+([:;?!])/g;
const SPACE_AFTER_OPEN_GUILLEMET = /([«])[\s\u00A0]+/g;
const SPACE_BEFORE_CLOSE_GUILLEMET = /[\s\u00A0]+([»])/g;

/**
 * Replaces breakable spaces before French punctuation with non-breaking spaces
 * so `:`, `;`, `?`, and `!` never orphan onto a new line.
 */
export function fixFrenchTypography(text: string): string {
  if (!text) return text;

  return text
    .replace(SPACE_BEFORE_PUNCT, "\u00A0$1")
    .replace(SPACE_AFTER_OPEN_GUILLEMET, "$1\u00A0")
    .replace(SPACE_BEFORE_CLOSE_GUILLEMET, "\u00A0$1");
}

export function applyFrenchTypographyDeep<T>(value: T): T {
  if (typeof value === "string") {
    return fixFrenchTypography(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => applyFrenchTypographyDeep(item)) as T;
  }

  if (value !== null && typeof value === "object") {
    const result = {} as T;
    for (const [key, child] of Object.entries(value)) {
      (result as Record<string, unknown>)[key] = applyFrenchTypographyDeep(child);
    }
    return result;
  }

  return value;
}

export function typographicText(text: string, locale: Locale): string {
  return locale === "fr" ? fixFrenchTypography(text) : text;
}
