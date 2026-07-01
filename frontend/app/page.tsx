import { KpiCards } from "@/components/obligations/KpiCards";
import { ObligationList } from "@/components/obligations/ObligationList";
import { StatusFilter } from "@/components/obligations/StatusFilter";
import { getLocale } from "@/i18n/server";
import { getObligationSummary, listObligations } from "@/lib/api";
import { STATUSES, type Status } from "@/types/obligation";

function parseStatus(value: string | string[] | undefined): Status | undefined {
  return typeof value === "string" && (STATUSES as string[]).includes(value)
    ? (value as Status)
    : undefined;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const locale = await getLocale();

  const [summary, obligations] = await Promise.all([
    getObligationSummary(),
    listObligations({ status }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <KpiCards summary={summary} locale={locale} />
      <StatusFilter />
      <ObligationList obligations={obligations} locale={locale} />
    </div>
  );
}
