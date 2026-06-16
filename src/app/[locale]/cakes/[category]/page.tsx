import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackBar } from "@/components/our-cakes/BackBar";
import { CakeGrid } from "@/components/our-cakes/CakeGrid";
import { isCakeCategoryId } from "@/data/our-cakes";
import {
  getLocalizedCakesByCategory,
  getLocalizedCategoryById,
} from "@/data/localized-our-cakes";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/seo/create-page-metadata";
import { getCategorySeoMeta } from "@/lib/seo/category-meta";

type PageProps = {
  params: Promise<{ locale: Locale; category: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const dictionary = await getDictionary(locale);

  if (!isCakeCategoryId(categorySlug)) {
    return { title: dictionary.meta.ourCakesFallback };
  }

  const category = getLocalizedCategoryById(dictionary, categorySlug);
  const categorySeo = getCategorySeoMeta(dictionary, categorySlug);

  return createPageMetadata({
    locale,
    pathname: `/cakes/${categorySlug}`,
    title: categorySeo.title,
    description: categorySeo.description,
    siteName: dictionary.meta.siteName,
    keywords: categorySeo.keywords,
    image: category
      ? getLocalizedCakesByCategory(dictionary, categorySlug)[0]?.angles.angle1
      : undefined,
    imageAlt: category?.title,
  });
}

export default async function CakesCategoryPage({ params }: PageProps) {
  const { locale, category: categorySlug } = await params;
  const dictionary = await getDictionary(locale);

  if (!isCakeCategoryId(categorySlug)) {
    notFound();
  }

  const category = getLocalizedCategoryById(dictionary, categorySlug);
  if (!category) {
    notFound();
  }

  const cakes = getLocalizedCakesByCategory(dictionary, categorySlug);

  return (
    <>
      <BackBar
        href={localizedPath("/cakes", locale)}
        label={dictionary.cakes.allCollections}
      />
      <h1 className="our-cakes-heading">
        {category.title}
        <span className="our-cakes-heading__count">[{cakes.length}]</span>
      </h1>
      <CakeGrid category={category} cakes={cakes} locale={locale} />
    </>
  );
}
