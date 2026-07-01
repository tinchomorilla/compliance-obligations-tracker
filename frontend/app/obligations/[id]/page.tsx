import { AuditHistory } from "@/components/obligations/AuditHistory";
import { ObligationDetail } from "@/components/obligations/ObligationDetail";
import { TransitionButtons } from "@/components/obligations/TransitionButtons";
import { getLocale } from "@/i18n/server";
import { getObligation } from "@/lib/api";

export default async function ObligationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const docError = typeof sp.error === "string" ? sp.error : undefined;

  const [locale, obligation] = await Promise.all([getLocale(), getObligation(Number(id))]);

  return (
    <div className="flex flex-col gap-6">
      <ObligationDetail obligation={obligation} locale={locale} docError={docError} />
      <TransitionButtons
        obligationId={obligation.id}
        version={obligation.version}
        availableTransitions={obligation.availableTransitions}
      />
      <AuditHistory history={obligation.history} locale={locale} />
    </div>
  );
}
