import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/footer/SiteFooter";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { LocalePageSlot } from "@/components/navigation/LocalePageSlot";
import { NavigationScrollGuard } from "@/components/navigation/NavigationScrollGuard";
import { SetHtmlLang } from "@/components/navigation/SetHtmlLang";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { isValidLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo/json-ld";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const dictionary = await getDictionary(locale);

  const organizationJsonLd = buildOrganizationJsonLd({
    name: dictionary.meta.siteName,
    description: dictionary.meta.siteDescription,
    locale,
  });
  const websiteJsonLd = buildWebsiteJsonLd({
    name: dictionary.meta.siteName,
    description: dictionary.meta.siteDescription,
    locale,
  });

  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <SetHtmlLang locale={locale} />
      <JsonLdScript data={[organizationJsonLd, websiteJsonLd]} />
      <NavigationScrollGuard />
      <LocalePageSlot>{children}</LocalePageSlot>
      <SiteFooter />
      <LanguageSwitcher placement="fixed" />
    </LocaleProvider>
  );
}
