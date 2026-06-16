import type { CakeCategoryId } from "@/data/our-cakes";
import type { Dictionary } from "@/i18n/types";

export function getCategorySeoMeta(
  dictionary: Dictionary,
  categoryId: CakeCategoryId,
) {
  return dictionary.meta.categorySeo[categoryId];
}

export function buildCakeDetailKeywords(
  dictionary: Dictionary,
  categoryId: CakeCategoryId,
  cakeTitle: string,
): string[] {
  const categoryKeywords = dictionary.meta.categorySeo[categoryId].keywords;
  return [cakeTitle, ...categoryKeywords, dictionary.meta.siteName];
}
