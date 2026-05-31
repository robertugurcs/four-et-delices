import type { Metadata } from "next";

import { MeetKhoudiaContent } from "@/components/khoudia/MeetKhoudiaContent";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type MeetKhoudiaPageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: MeetKhoudiaPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getDictionary(locale);

  return {
    title: t.meta.meetKhoudiaTitle,
    description: t.meta.meetKhoudiaDescription,
  };
}

export default function MeetKhoudiaPage() {
  return <MeetKhoudiaContent />;
}
