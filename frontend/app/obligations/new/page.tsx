import { ObligationForm } from "@/components/obligations/ObligationForm";
import { Card } from "@/components/ui/Card";
import { translate } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { createObligation } from "@/lib/actions";
import type { ObligationType } from "@/types/obligation";

export default async function NewObligationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const field = (key: string): string => (typeof sp[key] === "string" ? (sp[key] as string) : "");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">
        {translate(locale, "form.create.title")}
      </h1>
      <Card>
        <ObligationForm
          mode="create"
          action={createObligation}
          locale={locale}
          error={field("error") || undefined}
          defaultValues={{
            type: (field("type") as ObligationType) || undefined,
            title: field("title"),
            description: field("description"),
            dueDate: field("dueDate"),
            owner: field("owner"),
            requiresDocument: field("requiresDocument") === "true",
            companyTaxId: field("companyTaxId"),
          }}
        />
      </Card>
    </div>
  );
}
