import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/server/db";

const { users, roles, rolePermissions, teams } = schema;

/** Every user with their role and team, for the Users admin page. */
export function listUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      active: users.active,
      roleId: users.roleId,
      roleName: roles.name,
      teamId: users.teamId,
      teamName: teams.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(teams, eq(users.teamId, teams.id))
    .orderBy(users.id);
}

export function listRoles() {
  return db.select().from(roles).orderBy(roles.id);
}

export function listTeams() {
  return db.select().from(teams).orderBy(teams.name);
}

/** Granted permissions as "roleId:permission" and active users per role, for the Roles admin page. */
export async function roleMatrix() {
  const [grants, counts] = await Promise.all([
    db.select().from(rolePermissions),
    db
      .select({ roleId: users.roleId, count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.active, true))
      .groupBy(users.roleId),
  ]);
  return {
    granted: new Set(grants.map((g) => `${g.roleId}:${g.permission}`)),
    activeUsers: new Map(counts.map((c) => [c.roleId, c.count])),
  };
}
