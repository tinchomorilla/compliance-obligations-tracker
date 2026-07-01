import { ObligationForm } from "@/components/obligations/ObligationForm";
import { Card } from "@/components/ui/Card";
import { translate } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { getObligation } from "@/lib/api";
import { updateObligation } from "@/lib/actions";

export default async function EditObligationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [locale, obligation] = await Promise.all([getLocale(), getObligation(Number(id))]);

  const field = (key: string): string | undefined =>
    typeof sp[key] === "string" ? (sp[key] as string) : undefined;

  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(locale, key, vars);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">{t("form.edit.title")}</h1>
      <Card className="flex flex-col gap-1 text-sm text-slate-600">
        <p>
          {t("detail.type")}: <span className="text-slate-900">{t(`type.${obligation.type}`)}</span>
        </p>
        <p>
          {t("detail.companyTaxId")}:{" "}
          <span className="text-slate-900">{obligation.companyTaxId}</span>
        </p>
      </Card>
      <Card>
        <ObligationForm
          mode="edit"
          action={updateObligation.bind(null, obligation.id)}
          locale={locale}
          error={field("error")}
          version={obligation.version}
          defaultValues={{
            title: field("title") ?? obligation.title,
            description: field("description") ?? obligation.description,
            dueDate: field("dueDate") ?? obligation.dueDate,
            owner: field("owner") ?? obligation.owner,
            requiresDocument:
              field("requiresDocument") !== undefined
                ? field("requiresDocument") === "true"
                : obligation.requiresDocument,
          }}
        />
      </Card>
    </div>
  );
}
