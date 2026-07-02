import "server-only";

import { cookies } from "next/headers";

import { DEFAULT_LOCALE, isLocale, type Locale } from "./dictionaries";

const LOCALE_COOKIE = "locale";

/** Resolves the active locale from the request cookie. Called once per route
 * entry point (layout/page); the result is threaded down as a plain prop so
 * Server Components stay simple, synchronous, and easy to test. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}
