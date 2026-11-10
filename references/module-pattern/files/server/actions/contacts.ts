"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { newReference } from "@/lib/reference";
import type { ActionResult } from "@/schemas/action-result";
import { contactSchema, type ContactInput } from "@/schemas/contact";
import { id, requiredText } from "@/schemas/fields";
import { logAudit } from "@/server/audit";
import { requirePermission } from "@/server/auth";
import { db, schema } from "@/server/db";
import { requireContact } from "@/server/guards";

const { contacts } = schema;

export async function createContact(input: ContactInput): Promise<ActionResult> {
  const user = await requirePermission("contacts:create");
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  // The creator owns it, inside their team, so "own" and "team" scopes see it straight away
  const [contact] = await db
    .insert(contacts)
    .values({ ...parsed.data, reference: newReference("CON"), teamId: user.teamId, ownerId: user.id })
    .returning();
  await logAudit({
    userId: user.id,
    action: "create",
    entity: "contact",
    entityId: contact.id,
    details: contact.reference,
  });
  redirect(`/contacts/${contact.publicId}`);
}

/** One-click form on the contact page: adds a note to its timeline. */
export async function addContactNote(formData: FormData) {
  const note = requiredText(2, 500).parse(formData.get("note"));
  const { user, contact } = await requireContact("contacts:edit", id.parse(formData.get("contactId")));
  await db.update(contacts).set({ updatedAt: new Date() }).where(eq(contacts.id, contact.id));
  await logAudit({ userId: user.id, action: "note", entity: "contact", entityId: contact.id, details: note });
  revalidatePath("/contacts/[id]", "page");
}
