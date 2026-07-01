"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/i18n/useTranslation";

export default function ObligationDetailError({
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
      <div className="mt-4 flex items-center gap-3">
        <Button type="button" variant="danger" onClick={reset}>
          {t("error.retry")}
        </Button>
        <Link href="/" className="text-sm font-medium text-slate-700 underline underline-offset-2">
          {t("detail.back")}
        </Link>
      </div>
    </Card>
  );
}
