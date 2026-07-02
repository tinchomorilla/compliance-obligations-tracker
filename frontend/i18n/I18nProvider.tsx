"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { translate, type Locale, type TranslationKey } from "./dictionaries";

const LOCALE_COOKIE = "locale";

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      // Server Components read the locale from this cookie at request time,
      // so without a refresh they'd keep rendering the old language until
      // the next real navigation — this makes the switch apply immediately.
      router.refresh();
    },
    [router]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
