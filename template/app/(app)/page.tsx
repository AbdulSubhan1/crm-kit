import { getTranslations } from "next-intl/server";
import { EmptyState, Forbidden, PageHeader, Panel } from "@/components/ui";
import { can } from "@/lib/rbac";
import { requireUser } from "@/server/auth";

// Modules add their tiles and panels here once the knowledge base says what the dashboard shows
export default async function DashboardPage() {
  const user = await requireUser();
  if (!can(user, "dashboard:view")) return <Forbidden permission="dashboard:view" />;

  const t = await getTranslations("dashboard");
  return (
    <>
      <PageHeader
        title={t("greeting", { name: user.name.split(" ")[0] })}
        description={t("roleNote", { role: user.roleName })}
      />
      <Panel flush>
        <EmptyState icon="dashboard" title={t("emptyTitle")} description={t("emptyBody")} />
      </Panel>
    </>
  );
}
