import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { translate, type Locale } from "@/i18n/dictionaries";
import type { Status } from "@/types/obligation";

const STATUS_VARIANT: Record<Status, BadgeVariant> = {
  pending: "neutral",
  in_progress: "info",
  submitted: "warning",
  done: "success",
};

const STATUS_LABEL_KEY: Record<Status, `status.${Status}`> = {
  pending: "status.pending",
  in_progress: "status.in_progress",
  submitted: "status.submitted",
  done: "status.done",
};

export function StatusBadge({ status, locale }: { status: Status; locale: Locale }) {
  const label = translate(locale, STATUS_LABEL_KEY[status]);
  return (
    <Badge variant={STATUS_VARIANT[status]} aria-label={label}>
      {label}
    </Badge>
  );
}
