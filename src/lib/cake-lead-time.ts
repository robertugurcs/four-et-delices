import type { CakeCategoryId } from "@/data/our-cakes";
import type { Dictionary } from "@/i18n/types";

const PREMIUM_LEAD_CATEGORIES: readonly CakeCategoryId[] = [
  "weddings",
  "corporate",
];

export function isPremiumLeadCategory(categoryId: CakeCategoryId): boolean {
  return PREMIUM_LEAD_CATEGORIES.includes(categoryId);
}

export function getCategoryLeadTimeNotice(
  dictionary: Dictionary,
  categoryId: CakeCategoryId,
): string {
  return isPremiumLeadCategory(categoryId)
    ? dictionary.cakes.leadTime.premium
    : dictionary.cakes.leadTime.standard;
}
