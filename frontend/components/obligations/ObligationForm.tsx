import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { translate, type Locale } from "@/i18n/dictionaries";
import { OBLIGATION_TYPES, type ObligationType } from "@/types/obligation";

import { SubmitButton } from "./SubmitButton";

export interface ObligationFormValues {
  type?: ObligationType;
  title: string;
  description: string;
  dueDate: string;
  owner: string;
  requiresDocument: boolean;
  companyTaxId?: string;
}

export function ObligationForm({
  mode,
  action,
  locale,
  error,
  defaultValues,
  version,
}: {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
  locale: Locale;
  error?: string;
  defaultValues: ObligationFormValues;
  version?: number;
}) {
  const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
    translate(locale, key, params);

  return (
    <form action={action} className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {mode === "create" && (
        <Select
          id="type"
          name="type"
          label={t("form.type")}
          required
          defaultValue={defaultValues.type ?? ""}
          options={OBLIGATION_TYPES.map((type) => ({
            value: type,
            label: t(`type.${type}`),
          }))}
        />
      )}

      <Input
        id="title"
        name="title"
        label={t("form.title")}
        required
        defaultValue={defaultValues.title}
      />

      <Textarea
        id="description"
        name="description"
        label={t("form.description")}
        rows={3}
        defaultValue={defaultValues.description}
      />

      <Input
        id="dueDate"
        name="dueDate"
        type="date"
        label={t("form.dueDate")}
        required
        defaultValue={defaultValues.dueDate}
      />

      <Input
        id="owner"
        name="owner"
        label={t("form.owner")}
        required
        defaultValue={defaultValues.owner}
      />

      {mode === "create" && (
        <Input
          id="companyTaxId"
          name="companyTaxId"
          label={t("form.companyTaxId")}
          required
          defaultValue={defaultValues.companyTaxId ?? ""}
        />
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="requiresDocument"
          name="requiresDocument"
          defaultChecked={defaultValues.requiresDocument}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:outline-none"
        />
        <label htmlFor="requiresDocument" className="text-sm font-medium text-slate-700">
          {t("form.requiresDocument")}
        </label>
      </div>

      {mode === "edit" && version !== undefined && (
        <input type="hidden" name="version" value={version} />
      )}

      <div className="flex gap-2">
        <SubmitButton
          label={mode === "create" ? t("form.create.submit") : t("form.edit.submit")}
          pendingLabel={t("form.saving")}
        />
      </div>
    </form>
  );
}
