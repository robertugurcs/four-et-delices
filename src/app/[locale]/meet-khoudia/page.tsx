import type { Metadata } from "next";

import { MeetKhoudiaContent } from "@/components/khoudia/MeetKhoudiaContent";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createPageMetadata } from "@/lib/seo/create-page-metadata";

type MeetKhoudiaPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: MeetKhoudiaPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(locale);

  return createPageMetadata({
    locale,
    pathname: "/meet-khoudia",
    title: t.meta.meetKhoudiaTitle,
    description: t.meta.meetKhoudiaDescription,
    siteName: t.meta.siteName,
    keywords: t.meta.meetKhoudiaKeywords,
    image: "/assets/khoudia/hd-version.webp",
    imageAlt: t.meta.meetKhoudiaTitle,
  });
}

export default function MeetKhoudiaPage() {
  return <MeetKhoudiaContent />;
}
