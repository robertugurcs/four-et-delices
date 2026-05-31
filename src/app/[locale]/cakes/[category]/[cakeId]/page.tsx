import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CakeDetailView } from "@/components/our-cakes/CakeDetailView";
import { isCakeCategoryId } from "@/data/our-cakes";
import {
  getLocalizedCake,
  getLocalizedCategoryById,
} from "@/data/localized-our-cakes";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

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

  return {
    title: cake.title,
    description: cake.description,
  };
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

  return (
    <CakeDetailView category={category} cake={cake} locale={locale} />
  );
}
