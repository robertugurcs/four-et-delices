"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import type { Dictionary } from "@/i18n/types";
import { typographicText } from "@/lib/french-typography";

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  path: (href: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
};

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: LocaleProviderProps) {
  return (
    <LocaleContext.Provider
      value={{
        locale,
        dictionary,
        path: (href) => localizedPath(href, locale),
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslations() {
  return useLocale().dictionary;
}

/** Apply French non-breaking punctuation to runtime / user-authored strings. */
export function useTypographicText(text: string): string {
  const { locale } = useLocale();
  return typographicText(text, locale);
}
