import { Spinner } from "@/components/ui/Spinner";
import { translate } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export default async function DashboardLoading() {
  const locale = await getLocale();
  return (
    <div className="flex justify-center py-16">
      <Spinner label={translate(locale, "loading.text")} />
    </div>
  );
}
