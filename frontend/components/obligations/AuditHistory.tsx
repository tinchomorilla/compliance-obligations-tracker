import { Card } from "@/components/ui/Card";
import { translate, type Locale } from "@/i18n/dictionaries";
import type { AuditEntry } from "@/types/obligation";

import { StatusBadge } from "./StatusBadge";

export function AuditHistory({ history, locale }: { history: AuditEntry[]; locale: Locale }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-slate-900">
        {translate(locale, "history.title")}
      </h2>
      {history.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{translate(locale, "history.empty")}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {history.map((entry, index) => (
            <li
              key={`${entry.at}-${index}`}
              className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 text-sm first:border-t-0 first:pt-0"
            >
              <StatusBadge status={entry.fromStatus} locale={locale} />
              <span aria-hidden="true" className="text-slate-400">
                →
              </span>
              <StatusBadge status={entry.toStatus} locale={locale} />
              <time dateTime={entry.at} className="ml-auto text-slate-500">
                {new Date(entry.at).toLocaleString(locale)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
