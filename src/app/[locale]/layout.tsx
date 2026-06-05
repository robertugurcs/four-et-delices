import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/footer/SiteFooter";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { SetHtmlLang } from "@/components/navigation/SetHtmlLang";
import { isValidLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { LocaleProvider } from "@/i18n/LocaleProvider";

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

  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <SetHtmlLang locale={locale} />
      {children}
      <SiteFooter />
      <LanguageSwitcher placement="fixed" />
    </LocaleProvider>
  );
}
