import en from "./en.json";
import es from "./es.json";

export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];

export const DEFAULT_LOCALE: Locale = "en";

export const dictionaries: Record<Locale, Record<string, string>> = { en, es };

export type TranslationKey = keyof typeof en;

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

/** Pure translation lookup — safe to call from Server AND Client Components. */
export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const template = dictionaries[locale][key] ?? key;
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    template
  );
}
