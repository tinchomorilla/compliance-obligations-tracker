"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent } from "react";

import { Select } from "@/components/ui/Select";
import { useTranslation } from "@/i18n/useTranslation";
import { STATUSES } from "@/types/obligation";

export function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const current = searchParams.get("status") ?? "";

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const options = [
    { value: "", label: t("filter.all") },
    ...STATUSES.map((status) => ({ value: status, label: t(`status.${status}`) })),
  ];

  return (
    <Select
      id="status-filter"
      label={t("filter.label")}
      options={options}
      value={current}
      onChange={handleChange}
      className="max-w-xs"
    />
  );
}
