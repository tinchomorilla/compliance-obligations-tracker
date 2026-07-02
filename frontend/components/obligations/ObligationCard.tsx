import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { translate, type Locale } from "@/i18n/dictionaries";
import type { Obligation } from "@/types/obligation";

import { StatusBadge } from "./StatusBadge";

export function ObligationCard({
  obligation,
  locale,
}: {
  obligation: Obligation;
  locale: Locale;
}) {
  return (
    <Link href={`/obligations/${obligation.id}`} className="block">
      <Card
        className={`transition-shadow hover:shadow-md ${
          obligation.isOverdue ? "border-red-300 bg-red-50" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">{obligation.title}</h3>
            <p className="mt-1 text-sm text-slate-600">
              {translate(locale, "list.owner", { owner: obligation.owner })}
            </p>
            <p className="text-sm text-slate-600">
              {translate(locale, "list.dueDate", { date: obligation.dueDate })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={obligation.status} locale={locale} />
            {obligation.isOverdue && (
              <span className="text-xs font-semibold text-red-600">
                {translate(locale, "list.overdueBadge")}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
