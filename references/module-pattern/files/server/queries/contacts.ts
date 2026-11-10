import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cache } from "react";
import type { Page } from "@/lib/pagination";
import type { SessionUser } from "@/lib/rbac";
import { db, schema } from "@/server/db";
import { rowScope } from "./scope";

const { contacts, users, auditLogs } = schema;
const owner = alias(users, "owner");
const actor = alias(users, "actor");

const scope = (user: SessionUser) => rowScope(user, "contacts", { team: contacts.teamId, owner: contacts.ownerId });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One page of contacts in the user's scope. `q` matches the name, email or reference. */
export async function listContacts(user: SessionUser, { q, page }: { q?: string; page: Page }) {
  const where: SQL | undefined = and(
    scope(user),
    q
      ? or(ilike(contacts.name, `%${q}%`), ilike(contacts.email, `%${q}%`), ilike(contacts.reference, `%${q.trim()}%`))
      : undefined,
  );
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: contacts.id,
        publicId: contacts.publicId,
        reference: contacts.reference,
        name: contacts.name,
        email: contacts.email,
        ownerName: owner.name,
        updatedAt: contacts.updatedAt,
      })
      .from(contacts)
      .leftJoin(owner, eq(contacts.ownerId, owner.id))
      .where(where)
      .orderBy(desc(contacts.updatedAt), desc(contacts.id))
      .limit(page.limit)
      .offset(page.offset),
    db.select({ total: count() }).from(contacts).where(where),
  ]);
  return { rows, total };
}

/** One contact inside the user's scope, or null. Pages pass the UUID from the URL; actions pass the id. */
export async function getContact(user: SessionUser, key: number | string) {
  if (typeof key === "string" && !UUID.test(key)) return null;
  const [row] = await db
    .select({ contact: contacts, ownerName: owner.name })
    .from(contacts)
    .leftJoin(owner, eq(contacts.ownerId, owner.id))
    .where(and(typeof key === "string" ? eq(contacts.publicId, key) : eq(contacts.id, key), scope(user)));
  return row ?? null;
}

/** The contact's audit trail, newest first. */
export const contactTimeline = cache((contactId: number) =>
  db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      details: auditLogs.details,
      createdAt: auditLogs.createdAt,
      userName: actor.name,
    })
    .from(auditLogs)
    .leftJoin(actor, eq(auditLogs.userId, actor.id))
    .where(and(eq(auditLogs.entity, "contact"), eq(auditLogs.entityId, contactId)))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id)),
);
