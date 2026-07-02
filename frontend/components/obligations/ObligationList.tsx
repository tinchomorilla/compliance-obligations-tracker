import { translate, type Locale } from "@/i18n/dictionaries";
import type { Obligation } from "@/types/obligation";

import { ObligationCard } from "./ObligationCard";

export function ObligationList({
  obligations,
  locale,
}: {
  obligations: Obligation[];
  locale: Locale;
}) {
  if (obligations.length === 0) {
    return <p className="text-sm text-slate-500">{translate(locale, "list.empty")}</p>;
  }

  const sorted = [...obligations].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((obligation) => (
        <li key={obligation.id}>
          <ObligationCard obligation={obligation} locale={locale} />
        </li>
      ))}
    </ul>
  );
}
