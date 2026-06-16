import type { Metadata } from "next";

import { MiniSweetCatchFooter } from "@/components/footer/MiniSweetCatchFooter";
import CategoryWishSection from "@/components/category-wish/CategoryWishSection";
import { TestimonialSection } from "@/components/testimonials/TestimonialSection";
import { TestimonialsWaveDivider } from "@/components/testimonials/TestimonialsWaveDivider";
import { IntroController } from "@/components/hero/IntroController";
import HeroScrollShrink from "@/components/hero/HeroScrollShrink";
import { SectionCloudDivider } from "@/components/hero/SectionCloudDivider";
import TasteRevealSection from "@/components/hero/TasteRevealSection";
import { KhoudiaHeroBanner } from "@/components/khoudia/KhoudiaHeroBanner";
import { SiteHeader } from "@/components/site-header/SiteHeader";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createPageMetadata } from "@/lib/seo/create-page-metadata";

type HomePageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(locale);

  return createPageMetadata({
    locale,
    pathname: "/",
    title: t.meta.homeTitle,
    description: t.meta.siteDescription,
    siteName: t.meta.siteName,
    keywords: t.meta.homeKeywords,
    image: "/assets/hero-poster.jpg",
    imageAlt: t.meta.siteName,
  });
}

export default function Home() {
  return (
    <main className="m-0 w-full max-w-full bg-white p-0">
      <IntroController />
      <SiteHeader />
      <div className="w-full overflow-x-clip">
        <HeroScrollShrink />
        <TasteRevealSection />
        <SectionCloudDivider fill="#7d1828" direction="down" />
        <CategoryWishSection />
        <TestimonialSection />
        <div className="relative isolate flex w-full flex-col gap-0 bg-white p-0">
          <TestimonialsWaveDivider tone="flat" />
          <KhoudiaHeroBanner />
        </div>
        <MiniSweetCatchFooter />
      </div>
    </main>
  );
}
