import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CakeDetailView } from "@/components/our-cakes/CakeDetailView";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { isCakeCategoryId } from "@/data/our-cakes";
import {
  getLocalizedCake,
  getLocalizedCategoryById,
} from "@/data/localized-our-cakes";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createPageMetadata } from "@/lib/seo/create-page-metadata";
import { buildCakeDetailKeywords } from "@/lib/seo/category-meta";
import { buildProductJsonLd } from "@/lib/seo/json-ld";

type PageProps = {
  params: Promise<{ locale: Locale; category: string; cakeId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, category: categorySlug, cakeId } = await params;
  const dictionary = await getDictionary(locale);

  if (!isCakeCategoryId(categorySlug)) {
    return { title: dictionary.meta.ourCakesFallback };
  }

  const cake = getLocalizedCake(dictionary, categorySlug, cakeId);
  if (!cake) {
    return { title: dictionary.meta.ourCakesFallback };
  }

  return createPageMetadata({
    locale,
    pathname: `/cakes/${categorySlug}/${cakeId}`,
    title: cake.title,
    description: cake.description,
    siteName: dictionary.meta.siteName,
    keywords: buildCakeDetailKeywords(dictionary, categorySlug, cake.title),
    image: cake.angles.angle1,
    imageAlt: cake.title,
  });
}

export default async function CakeDetailPage({ params }: PageProps) {
  const { locale, category: categorySlug, cakeId } = await params;
  const dictionary = await getDictionary(locale);

  if (!isCakeCategoryId(categorySlug)) {
    notFound();
  }

  const category = getLocalizedCategoryById(dictionary, categorySlug);
  const cake = getLocalizedCake(dictionary, categorySlug, cakeId);

  if (!category || !cake) {
    notFound();
  }

  const productJsonLd = buildProductJsonLd({
    cake,
    locale,
    categoryTitle: category.title,
  });

  return (
    <>
      <JsonLdScript data={productJsonLd} />
      <CakeDetailView category={category} cake={cake} locale={locale} />
    </>
  );
}
