"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { id } from "@/schemas/fields";
import { logAudit } from "@/server/audit";
import { requirePermission } from "@/server/auth";
import { db, schema } from "@/server/db";

const { roles, users, teams } = schema;

async function requireOtherUser(formData: FormData) {
  const user = await requirePermission("users:manage");
  const targetId = id.parse(formData.get("userId"));
  if (targetId === user.id) throw new Error("You cannot change your own account here");
  const [target] = await db.select().from(users).where(eq(users.id, targetId));
  if (!target) throw new Error("errors.notFound");
  return { user, target };
}

export async function updateUser(formData: FormData) {
  const { user, target } = await requireOtherUser(formData);
  const rawTeam = String(formData.get("teamId") ?? "");
  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.id, id.parse(formData.get("roleId"))));
  const [team] = rawTeam
    ? await db
        .select()
        .from(teams)
        .where(eq(teams.id, Number(rawTeam)))
    : [];
  if (!role || (rawTeam && !team)) throw new Error("errors.notFound");

  await db
    .update(users)
    .set({ roleId: role.id, teamId: team?.id ?? null })
    .where(eq(users.id, target.id));
  await logAudit({
    userId: user.id,
    action: "update",
    entity: "user",
    entityId: target.id,
    details: [target.name, role.name, team?.name].filter(Boolean).join(", "),
  });
  revalidatePath("/admin/users");
}

export async function toggleUserActive(formData: FormData) {
  const { user, target } = await requireOtherUser(formData);
  await db.update(users).set({ active: !target.active }).where(eq(users.id, target.id));
  await logAudit({
    userId: user.id,
    action: target.active ? "deactivate" : "activate",
    entity: "user",
    entityId: target.id,
    details: target.name,
  });
  revalidatePath("/admin/users");
}
