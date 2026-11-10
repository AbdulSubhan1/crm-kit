import { getTranslations } from "next-intl/server";
import { Avatar, ButtonLink, CellText, DataTable, Forbidden, Icon, PageHeader } from "@/components/ui";
import { shortDate } from "@/lib/format";
import { pageFrom } from "@/lib/pagination";
import { can, scopeOf } from "@/lib/rbac";
import type { SearchParams } from "@/lib/url";
import { requireUser } from "@/server/auth";
import { listContacts } from "@/server/queries/contacts";

export default async function ContactsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireUser();
  if (scopeOf(user, "contacts") === "none") return <Forbidden permission="contacts:view_own" />;

  const params = await searchParams;
  const page = pageFrom(params);
  const [{ rows, total }, t] = await Promise.all([listContacts(user, { q: params.q, page }), getTranslations()]);

  return (
    <>
      <PageHeader
        title={t("contacts.title")}
        description={t("contacts.description")}
        action={
          can(user, "contacts:create") && (
            <ButtonLink href="/contacts/new" variant="primary">
              <Icon name="plus" size={16} />
              {t("contacts.new")}
            </ButtonLink>
          )
        }
      />
      <DataTable
        path="/contacts"
        params={params}
        rows={rows}
        rowKey={(c) => c.id}
        search={{ placeholder: t("contacts.search") }}
        pagination={{ page: page.page, pageSize: page.limit, total }}
        empty={{ title: t("contacts.empty"), icon: "users" }}
        columns={[
          {
            key: "name",
            header: t("contacts.name"),
            cell: (c) => <CellText href={`/contacts/${c.publicId}`} primary={c.name} secondary={c.reference} />,
          },
          { key: "email", header: t("contacts.email"), cell: (c) => <CellText primary={c.email} /> },
          {
            key: "owner",
            header: t("contacts.owner"),
            cell: (c) =>
              c.ownerName ? (
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar name={c.ownerName} size="sm" />
                  <span className="truncate">{c.ownerName}</span>
                </span>
              ) : (
                <span className="text-muted">{t("common.unassigned")}</span>
              ),
          },
          { key: "updated", header: t("contacts.updated"), nowrap: true, cell: (c) => shortDate(c.updatedAt) },
        ]}
      />
    </>
  );
}
