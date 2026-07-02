"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/useTranslation";
import { transitionObligation } from "@/lib/actions";
import type { Status } from "@/types/obligation";

export function TransitionButtons({
  obligationId,
  version,
  availableTransitions,
}: {
  obligationId: number;
  version: number;
  availableTransitions: Status[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [localVersion, setLocalVersion] = useState(version);
  const [localTransitions, setLocalTransitions] = useState(availableTransitions);


  if (version > localVersion) {
    setLocalVersion(version);
    setLocalTransitions(availableTransitions);
  }

  const isPending = pendingStatus !== null;

  async function handleClick(target: Status) {
    if (isPending) return;
    setError(null);
    setPendingStatus(target);

    const result = await transitionObligation(obligationId, target, localVersion);

    if (!result.ok) {
      setError(result.message);
    } else {
      setLocalVersion(result.version);
      setLocalTransitions(result.availableTransitions);
    }
    setPendingStatus(null);

    if (!isRefreshing) {
      startRefreshTransition(() => {
        router.refresh();
      });
    }
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">{t("transitions.title")}</h2>
      {localTransitions.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{t("transitions.empty")}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {localTransitions.map((status) => (
            <Button
              key={status}
              type="button"
              variant="secondary"
              disabled={isPending}
              aria-busy={pendingStatus === status}
              onClick={() => handleClick(status)}
            >
              {t("transitions.moveTo", { status: t(`status.${status}`) })}
            </Button>
          ))}
        </div>
      )}
      {error && (
        <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 text-sm text-red-600">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={() => router.refresh()}>
            {t("transitions.refresh")}
          </Button>
        </div>
      )}
    </div>
  );
}
