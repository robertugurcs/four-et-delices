import {

  getCategoryHeroImage,

  type CakeCategory,

} from "@/data/our-cakes";

import type { Locale } from "@/i18n/config";

import { localizedPath } from "@/i18n/routing";

import { GalleryTile } from "./GalleryTile";



type CategoryGridProps = {

  categories: CakeCategory[];

  locale: Locale;

};



export function CategoryGrid({ categories, locale }: CategoryGridProps) {

  return (

    <div className="our-cakes-grid" role="list">

      {categories.map((category, index) => (

        <GalleryTile

          key={category.id}

          href={localizedPath(`/cakes/${category.id}`, locale)}

          imageSrc={getCategoryHeroImage(category)}

          title={category.title}

          subtitle={category.tagline}

          priority={index < 2}

        />

      ))}

    </div>

  );

}


