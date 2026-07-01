import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { translate } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LanguageToggle } from "@/i18n/LanguageToggle";
import { getLocale } from "@/i18n/server";

import "./globals.css";

export const metadata: Metadata = {
  title: "Compliance Obligations Tracker",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <I18nProvider initialLocale={locale}>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="text-base font-semibold text-slate-900">
                {t("app.title")}
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/obligations/new"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  {t("nav.newObligation")}
                </Link>
                <LanguageToggle />
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
