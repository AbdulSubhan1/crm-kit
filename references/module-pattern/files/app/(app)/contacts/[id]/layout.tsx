import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getContact } from "@/server/queries/contacts";

/**
 * Checks access before the page renders, so a contact outside the user's scope is a real 404 response
 * and not a 404 screen sent with status 200.
 */
export default async function ContactLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!(await getContact(user, (await params).id))) notFound();
  return children;
}
