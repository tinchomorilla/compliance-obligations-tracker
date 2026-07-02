import { Card } from "@/components/ui/Card";
import { translate, type Locale } from "@/i18n/dictionaries";
import type { ObligationSummary, Status } from "@/types/obligation";

const STATUS_ORDER: Status[] = ["pending", "in_progress", "submitted", "done"];

function Kpi({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warning" | "danger" }) {
  const toneClass =
    tone === "danger" ? "text-red-600" : tone === "warning" ? "text-amber-600" : "text-slate-900";
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </Card>
  );
}

export function KpiCards({ summary, locale }: { summary: ObligationSummary; locale: Locale }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Kpi label={translate(locale, "kpi.total")} value={summary.total} />
      <Kpi label={translate(locale, "kpi.overdue")} value={summary.overdue} tone="danger" />
      <Kpi label={translate(locale, "kpi.dueSoon")} value={summary.dueSoon} tone="warning" />
      <Card>
        <p className="text-sm text-slate-500">{translate(locale, "kpi.byStatus")}</p>
        <dl className="mt-1 flex flex-col gap-0.5">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <dt className="text-slate-600">{translate(locale, `status.${status}`)}</dt>
              <dd className="font-medium text-slate-900">{summary.byStatus[status]}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
