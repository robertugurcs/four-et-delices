import type { CakeCategoryId } from "@/data/our-cakes";
import type { Dictionary } from "@/i18n/types";

type CakeItemCopy = {
  title: string;
  description: string;
};

const CATEGORY_IDS: CakeCategoryId[] = [
  "kids",
  "birthdays",
  "corporate",
  "weddings",
];

const CATEGORY_CODES = {
  kids: "K",
  birthdays: "B",
  corporate: "C",
  weddings: "W",
} as const;

const FEATURED_CAKE_IDS = {
  kids: "k-1",
  birthdays: "b-4",
  corporate: "c-5",
  weddings: "w-2",
} as const;

/** Corporate gallery skips retired c-4 (Baobab's Pink) — slots are c-1…c-3, c-5 IAM, c-6 Nestlé. */
const CORPORATE_CAKE_IDS = ["c-1", "c-2", "c-3", "c-5", "c-6"] as const;

function cakeIdForCategory(categoryId: CakeCategoryId, index: number): string {
  if (categoryId === "corporate") {
    return CORPORATE_CAKE_IDS[index] ?? `c-${index + 1}`;
  }
  const code = CATEGORY_CODES[categoryId].toLowerCase();
  return `${code}-${index + 1}`;
}

function cakeCodeForCategory(categoryId: CakeCategoryId, index: number): string {
  if (categoryId === "corporate") {
    const id = CORPORATE_CAKE_IDS[index] ?? `c-${index + 1}`;
    return `C-${id.split("-")[1]}`;
  }
  return `${CATEGORY_CODES[categoryId]}-${index + 1}`;
}

export function getLocalizedCakeCatalog(dictionary: Dictionary) {
  const copy = dictionary.cakes;
  const { tags } = copy;
  const tagList = [tags.customFlavours, tags.bespokeDecor, tags.madeToOrder];

  const categories = CATEGORY_IDS.map((id) => {
    const categoryCopy = copy.categories[id];
    return {
      id,
      code: CATEGORY_CODES[id],
      title: categoryCopy.title,
      featuredCakeId: FEATURED_CAKE_IDS[id],
      tagline: categoryCopy.tagline,
    };
  });

  const items = CATEGORY_IDS.flatMap((categoryId) => {
    const categoryCopy = copy.categories[categoryId];

    return categoryCopy.items.map((item: CakeItemCopy, index: number) => {
      const id = cakeIdForCategory(categoryId, index);
      const dir = `/assets/our-cakes/${categoryId}/${id}`;

      return {
        id,
        code: cakeCodeForCategory(categoryId, index),
        categoryId,
        title: item.title,
        description: item.description,
        tags: tagList,
        angles: {
          angle1: `${dir}/angle-1.webp`,
          angle2: `${dir}/angle-2.webp`,
          angle3: `${dir}/angle-3.webp`,
        },
      };
    });
  });

  return { categories, items, fallbackDescription: copy.fallbackDescription };
}

export function getLocalizedCategoryById(
  dictionary: Dictionary,
  categoryId: CakeCategoryId,
) {
  return getLocalizedCakeCatalog(dictionary).categories.find(
    (c) => c.id === categoryId,
  );
}

export function getLocalizedCakesByCategory(
  dictionary: Dictionary,
  categoryId: CakeCategoryId,
) {
  return getLocalizedCakeCatalog(dictionary).items.filter(
    (c) => c.categoryId === categoryId,
  );
}

export function getLocalizedCake(
  dictionary: Dictionary,
  categoryId: CakeCategoryId,
  cakeId: string,
) {
  return getLocalizedCakeCatalog(dictionary).items.find(
    (c) => c.categoryId === categoryId && c.id === cakeId,
  );
}
