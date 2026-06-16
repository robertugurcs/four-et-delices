import type { MetadataRoute } from "next";

import { OUR_CAKE_CATEGORIES, OUR_CAKES } from "@/data/our-cakes";
import { locales } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo/site-url";

const STATIC_PATHS = ["/", "/meet-khoudia", "/inquiry", "/cakes"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(localizedPath(path, locale)),
        lastModified: new Date(),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/inquiry" ? 0.9 : 0.8,
      });
    }

    for (const category of OUR_CAKE_CATEGORIES) {
      entries.push({
        url: absoluteUrl(localizedPath(`/cakes/${category.id}`, locale)),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });

      for (const cake of OUR_CAKES.filter(
        (item) => item.categoryId === category.id,
      )) {
        entries.push({
          url: absoluteUrl(
            localizedPath(`/cakes/${category.id}/${cake.id}`, locale),
          ),
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
