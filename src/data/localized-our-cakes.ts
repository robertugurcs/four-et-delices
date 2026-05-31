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
  corporate: "c-4",
  weddings: "w-2",
} as const;

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
    const code = CATEGORY_CODES[categoryId];
    const categoryCopy = copy.categories[categoryId];

    return categoryCopy.items.map((item: CakeItemCopy, index: number) => {
      const n = index + 1;
      const id = `${code.toLowerCase()}-${n}`;
      const dir = `/assets/our-cakes/${categoryId}/${id}`;

      return {
        id,
        code: `${code}-${n}`,
        categoryId,
        title: item.title,
        description: item.description,
        tags: tagList,
        angles: {
          angle1: `${dir}/angle-1.png`,
          angle2: `${dir}/angle-2.png`,
          angle3: `${dir}/angle-3.png`,
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
