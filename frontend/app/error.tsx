"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/i18n/useTranslation";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card role="alert" className="border-red-200 bg-red-50">
      <h2 className="text-base font-semibold text-red-800">{t("error.title")}</h2>
      <p className="mt-1 text-sm text-red-700">{error.message || t("error.generic")}</p>
      <Button type="button" variant="danger" className="mt-4" onClick={reset}>
        {t("error.retry")}
      </Button>
    </Card>
  );
}
