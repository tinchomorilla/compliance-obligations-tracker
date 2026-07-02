"use client";

import { LOCALES } from "./dictionaries";
import { useTranslation } from "./useTranslation";

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div role="group" aria-label={t("nav.language")} className="flex gap-1">
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
            locale === option
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {t(`lang.${option}`)}
        </button>
      ))}
    </div>
  );
}
