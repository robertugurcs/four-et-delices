/** Catalog assets under /public/assets/our-cakes/ */

export type CakeCategoryId = "kids" | "birthdays" | "corporate" | "weddings";

export type CakeCategory = {
  id: CakeCategoryId;
  /** Original letter code: K, B, C, W */
  code: "K" | "B" | "C" | "W";
  title: string;
  /** Grid hero on /cakes */
  featuredCakeId: string;
  tagline: string;
};

export type CakeAngles = {
  angle1: string;
  angle2: string;
  angle3: string;
};

export type OurCake = {
  /** Folder id, e.g. b-1 */
  id: string;
  /** Original asset code, e.g. B-1 */
  code: string;
  categoryId: CakeCategoryId;
  title: string;
  description: string;
  tags: string[];
  angles: CakeAngles;
};

const BASE = "/assets/our-cakes";

const CATEGORY_META: Record<
  CakeCategoryId,
  Pick<CakeCategory, "featuredCakeId" | "tagline"> & {
    cakeTitles: string[];
    cakeDescriptions?: string[];
  }
> = {
  kids: {
    featuredCakeId: "k-1",
    tagline:
      "Playful creations inspired by children's colourful worlds, favourite characters, and sweetest dreams.",
    cakeTitles: [
      "Animal Farm Cake",
      "Teddy's Carousel & Train",
      "Real Madrid Star",
      "The Sweetest Shade of Orange",
    ],
    cakeDescriptions: [
      "A playful cake inspired by farm animals, nature, and the joyful world of children.",
      "A dreamy children's cake featuring a teddy bear, a carousel, and a little train full of charm.",
      "A football-inspired cake made for little fans who dream in white and celebrate like champions.",
      "A bright and cheerful cake celebrating the warmth, joy, and beauty of orange.",
    ],
  },
  birthdays: {
    featuredCakeId: "b-4",
    tagline:
      "Special cakes for new ages, new wishes, and the beautiful moments that deserve to be remembered.",
    cakeTitles: [
      "The Red of the Rose",
      "Black Rose & Golden Pearls",
      "White Rose in Soft Pink Grace",
      "Gold on African Grace",
    ],
    cakeDescriptions: [
      "A romantic birthday cake inspired by the deep beauty and timeless elegance of red roses.",
      "A dramatic creation where dark floral elegance meets the delicate glow of golden pearls.",
      "A graceful birthday cake where white roses and delicate leaves meet the nobility of soft pink.",
      "A refined birthday cake celebrating deep beauty, golden details, and the elegance of African tones.",
    ],
  },
  corporate: {
    featuredCakeId: "c-4",
    tagline:
      "Tailored cakes that bring elegance, identity, and a refined touch to every professional occasion.",
    cakeTitles: [
      "Africa Champion",
      "Coris Bank Cake",
      "Sonko's Ideal",
      "Baobab's Pink",
    ],
    cakeDescriptions: [
      "A bold celebration cake inspired by victory, pride, and the spirit of Africa.",
      "A refined corporate cake designed with elegance, identity, and professional presence.",
      "A signature creation shaped around character, ambition, and a distinctive personal vision.",
      "A soft pink creation inspired by the beauty, warmth, and timeless strength of the baobab.",
    ],
  },
  weddings: {
    featuredCakeId: "w-2",
    tagline:
      "Romantic cakes crafted to celebrate love, elegance, and the unforgettable beginning of your story.",
    cakeTitles: [
      "Pearl of the Great Love",
      "Garden of Love Flowers",
      "A Season of Spring Love",
      "Golden Motifs of Love",
    ],
    cakeDescriptions: [
      "A majestic wedding cake inspired by grand love, timeless elegance, and the pearl-like beauty of the deep sea.",
      "A romantic creation where selected garden flowers meet the sweet and unforgettable taste of love.",
      "A delicate wedding cake inspired by the feeling of spring, fresh beginnings, and a love that blooms beautifully.",
      "An elegant design where golden details and graceful motifs come together to celebrate the art of love.",
    ],
  },
};

function cakePaths(categoryId: CakeCategoryId, id: string): CakeAngles {
  const dir = `${BASE}/${categoryId}/${id}`;
  return {
    angle1: `${dir}/angle-1.png`,
    angle2: `${dir}/angle-2.png`,
    angle3: `${dir}/angle-3.png`,
  };
}

export const OUR_CAKE_CATEGORIES: CakeCategory[] = [
  { id: "kids", code: "K", title: "Kids", ...CATEGORY_META.kids },
  { id: "birthdays", code: "B", title: "Birthday", ...CATEGORY_META.birthdays },
  { id: "corporate", code: "C", title: "Corporate", ...CATEGORY_META.corporate },
  { id: "weddings", code: "W", title: "Wedding", ...CATEGORY_META.weddings },
];

function cakesFor(
  categoryId: CakeCategoryId,
  code: "K" | "B" | "C" | "W",
  count: number,
): OurCake[] {
  const meta = CATEGORY_META[categoryId];
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const id = `${code.toLowerCase()}-${n}`;
    return {
      id,
      code: `${code}-${n}`,
      categoryId,
      title: meta.cakeTitles[i] ?? `${meta.cakeTitles[0]} ${n}`,
      description:
        meta.cakeDescriptions?.[i] ??
        "Hand-finished tiers, custom flavour pairings, and décor tailored to your celebration. Share your date and vision, and we shape every detail from sketch to final garnish.",
      tags: ["Custom flavours", "Bespoke décor", "Made to order"],
      angles: cakePaths(categoryId, id),
    };
  });
}

export const OUR_CAKES: OurCake[] = [
  ...cakesFor("kids", "K", 4),
  ...cakesFor("birthdays", "B", 4),
  ...cakesFor("corporate", "C", 4),
  ...cakesFor("weddings", "W", 4),
];

export const CAKE_CATEGORY_IDS = OUR_CAKE_CATEGORIES.map((c) => c.id);

export function isCakeCategoryId(value: string): value is CakeCategoryId {
  return (CAKE_CATEGORY_IDS as string[]).includes(value);
}

export function getCategoryById(
  categoryId: CakeCategoryId,
): CakeCategory | undefined {
  return OUR_CAKE_CATEGORIES.find((c) => c.id === categoryId);
}

export function getCategoryHeroImage(category: CakeCategory): string {
  const cake = getCake(category.id, category.featuredCakeId);
  return cake?.angles.angle1 ?? "";
}

export function ourCakesByCategory(categoryId: CakeCategoryId): OurCake[] {
  return OUR_CAKES.filter((c) => c.categoryId === categoryId);
}

export function getCake(
  categoryId: CakeCategoryId,
  cakeId: string,
): OurCake | undefined {
  return OUR_CAKES.find(
    (c) => c.categoryId === categoryId && c.id === cakeId,
  );
}

export function ourCakeAngleList(cake: OurCake): string[] {
  return [cake.angles.angle1, cake.angles.angle2, cake.angles.angle3];
}

/** Homepage category-wish anchor → gallery category id */
export const WISH_ANCHOR_TO_CATEGORY: Record<string, CakeCategoryId> = {
  kids: "kids",
  weddings: "weddings",
  birthdays: "birthdays",
  corporate: "corporate",
};
