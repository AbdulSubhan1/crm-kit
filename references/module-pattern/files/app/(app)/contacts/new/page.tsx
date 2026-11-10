import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/forms/contact-form";
import { Forbidden, PageHeader } from "@/components/ui";
import { can } from "@/lib/rbac";
import { requireUser } from "@/server/auth";

export default async function NewContactPage() {
  const user = await requireUser();
  if (!can(user, "contacts:create")) return <Forbidden permission="contacts:create" />;
  const t = await getTranslations("contacts");

  return (
    <>
      <PageHeader back={{ href: "/contacts", label: t("title") }} title={t("new")} />
      <ContactForm />
    </>
  );
}
