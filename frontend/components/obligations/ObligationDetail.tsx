import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { translate, type Locale } from "@/i18n/dictionaries";
import { attachDocument } from "@/lib/actions";
import type { ObligationDetail as ObligationDetailData } from "@/types/obligation";

import { StatusBadge } from "./StatusBadge";
import { SubmitButton } from "./SubmitButton";

export function ObligationDetail({
  obligation,
  locale,
  docError,
}: {
  obligation: ObligationDetailData;
  locale: Locale;
  docError?: string;
}) {
  const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
    translate(locale, key, params);
  const boundAttachDocument = attachDocument.bind(null, obligation.id);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{obligation.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{t(`type.${obligation.type}`)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={obligation.status} locale={locale} />
            {obligation.isOverdue && (
              <span className="text-xs font-semibold text-red-600">
                {t("list.overdueBadge")}
              </span>
            )}
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              {t("detail.description")}
            </dt>
            <dd className="text-sm text-slate-900">{obligation.description || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">{t("detail.owner")}</dt>
            <dd className="text-sm text-slate-900">{obligation.owner}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              {t("detail.dueDate")}
            </dt>
            <dd className="text-sm text-slate-900">{obligation.dueDate}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              {t("detail.companyTaxId")}
            </dt>
            <dd className="text-sm text-slate-900">{obligation.companyTaxId}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              {t("detail.status")}
            </dt>
            <dd className="text-sm text-slate-900">{t("detail.version", { version: obligation.version })}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <Link
            href={`/obligations/${obligation.id}/edit`}
            className="text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            {t("detail.edit")}
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">{t("detail.document")}</h2>
        {docError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {docError}
          </p>
        )}
        {obligation.documentFilename ? (
          <p className="mt-2 text-sm text-slate-700">
            {t("detail.documentPresent", { filename: obligation.documentFilename })}
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-500">{t("detail.documentMissing")}</p>
            {obligation.requiresDocument && (
              <p className="mt-1 text-sm text-amber-700">{t("detail.documentRequired")}</p>
            )}
            <form action={boundAttachDocument} className="mt-3 flex flex-wrap items-end gap-2">
              <Input
                id="filename"
                name="filename"
                label={t("detail.attachDocument")}
                placeholder={t("detail.filenamePlaceholder")}
                required
              />
              <input type="hidden" name="version" value={obligation.version} />
              <SubmitButton
                label={t("attach.submit")}
                pendingLabel={t("attach.attaching")}
                variant="secondary"
              />
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
