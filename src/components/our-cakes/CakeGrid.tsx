import type { CakeCategory, OurCake } from "@/data/our-cakes";

import type { Locale } from "@/i18n/config";

import { localizedPath } from "@/i18n/routing";

import { GalleryTile } from "./GalleryTile";



type CakeGridProps = {

  category: CakeCategory;

  cakes: OurCake[];

  locale: Locale;

};



export function CakeGrid({ category, cakes, locale }: CakeGridProps) {

  return (

    <div className="our-cakes-grid" role="list">

      {cakes.map((cake, index) => (

        <GalleryTile

          key={cake.id}

          href={localizedPath(`/cakes/${category.id}/${cake.id}`, locale)}

          imageSrc={cake.angles.angle1}

          title={cake.title}

          subtitle={cake.code}

          priority={index < 2}

        />

      ))}

    </div>

  );

}


