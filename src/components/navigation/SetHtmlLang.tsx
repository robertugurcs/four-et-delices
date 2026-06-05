"use client";

import { useEffect } from "react";

import type { Locale } from "@/i18n/config";
import { completeLocaleSwitch } from "@/lib/locale-switch";

export function SetHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    completeLocaleSwitch();
  }, [locale]);

  return null;
}
