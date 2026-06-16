import type { Metadata } from "next";

import { CategoryGrid } from "@/components/our-cakes/CategoryGrid";
import { getLocalizedCakeCatalog } from "@/data/localized-our-cakes";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createPageMetadata } from "@/lib/seo/create-page-metadata";

type CakesPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: CakesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(locale);

  return createPageMetadata({
    locale,
    pathname: "/cakes",
    title: t.meta.collectionsTitle,
    description: t.meta.collectionsDescription,
    siteName: t.meta.siteName,
    keywords: t.meta.collectionsKeywords,
  });
}

export default async function CakesPage({ params }: CakesPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const { categories } = getLocalizedCakeCatalog(dictionary);

  return (
    <>
      <h1 className="our-cakes-heading">
        {dictionary.cakes.collections}
        <span className="our-cakes-heading__count">[{categories.length}]</span>
      </h1>
      <CategoryGrid categories={categories} locale={locale} />
    </>
  );
}
