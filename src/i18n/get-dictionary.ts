import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/i18n/dictionaries/en").then((m) => m.enDictionary),
  fr: () => import("@/i18n/dictionaries/fr").then((m) => m.frDictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
