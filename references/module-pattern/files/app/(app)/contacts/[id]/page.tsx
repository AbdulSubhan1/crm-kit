import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  Badge,
  Button,
  DetailList,
  EmptyState,
  Hidden,
  Input,
  PageHeader,
  Panel,
  PanelSection,
  Timeline,
} from "@/components/ui";
import { dateTime } from "@/lib/format";
import { can } from "@/lib/rbac";
import { addContactNote } from "@/server/actions/contacts";
import { requireUser } from "@/server/auth";
import { contactTimeline, getContact } from "@/server/queries/contacts";

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const row = await getContact(user, (await params).id);
  if (!row) notFound();
  const { contact, ownerName } = row;
  const [timeline, t] = await Promise.all([contactTimeline(contact.id), getTranslations()]);

  return (
    <>
      <PageHeader
        back={{ href: "/contacts", label: t("contacts.title") }}
        title={contact.name}
        description={t("contacts.ownedBy", { owner: ownerName ?? t("common.unassigned") })}
        action={<Badge tone="grey">{contact.reference}</Badge>}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title={t("contacts.details")} className="self-start">
          <DetailList
            columns={2}
            items={[
              { label: t("contacts.email"), value: contact.email },
              { label: t("contacts.phone"), value: contact.phone },
              { label: t("contacts.notes"), value: contact.notes },
            ]}
          />
        </Panel>
        <Panel title={t("contacts.activity")} flush>
          {can(user, "contacts:edit") && (
            <PanelSection muted>
              <form action={addContactNote} className="flex gap-2">
                <Hidden name="contactId" value={contact.id} />
                <Input name="note" aria-label={t("contacts.note")} placeholder={t("placeholders.note")} required />
                <Button size="sm">{t("contacts.addNote")}</Button>
              </form>
            </PanelSection>
          )}
          {timeline.length === 0 ? (
            <EmptyState title={t("contacts.noActivity")} />
          ) : (
            <PanelSection>
              <Timeline
                items={timeline.map((e) => ({
                  id: e.id,
                  icon: e.action === "note" ? "edit" : "plus",
                  tone: e.action === "note" ? "info" : "brand",
                  title: t(`contacts.events.${e.action === "note" ? "note" : "create"}`, {
                    name: e.userName ?? t("audit.system"),
                  }),
                  description: e.action === "note" ? e.details : undefined,
                  time: dateTime(e.createdAt),
                }))}
              />
            </PanelSection>
          )}
        </Panel>
      </div>
    </>
  );
}
