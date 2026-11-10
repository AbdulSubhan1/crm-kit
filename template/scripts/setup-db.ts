/**
 * Creates the tables and fills them with demo data.
 *   npm run db:setup            -> migrate, seed only if empty
 *   npm run db:setup -- --reset -> wipe everything and seed again
 * Modules add their demo records to seed() below.
 */
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { DEMO_PASSWORD } from "@/constants/config";
import { DEMO_ACCOUNTS, DEMO_ROLES } from "@/constants/demo";
import { ALL_PERMISSIONS } from "@/lib/rbac";
import { db, schema } from "@/server/db";

async function migrate() {
  if (process.env.DATABASE_URL) {
    await migrateNeon(db as never, { migrationsFolder: "./drizzle" });
  } else {
    await migratePglite(db, { migrationsFolder: "./drizzle" });
  }
}

// Every table in the public schema, so new modules never need to edit this
async function wipe() {
  const result = await db.execute<{ tablename: string }>(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  );
  const tables = result.rows.map((r) => `"${r.tablename}"`);
  if (tables.length) await db.execute(sql.raw(`TRUNCATE ${tables.join(", ")} RESTART IDENTITY CASCADE`));
}

async function seed() {
  const roleIds = new Map<string, number>();
  for (const role of DEMO_ROLES) {
    const [row] = await db
      .insert(schema.roles)
      .values({ name: role.name, description: role.description, isSystem: role.isSystem ?? false })
      .returning();
    roleIds.set(role.key, row.id);
    const permissions = role.permissions === "all" ? ALL_PERMISSIONS : role.permissions;
    await db.insert(schema.rolePermissions).values(permissions.map((permission) => ({ roleId: row.id, permission })));
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await db
    .insert(schema.users)
    .values(DEMO_ACCOUNTS.map((u) => ({ name: u.name, email: u.email, passwordHash, roleId: roleIds.get(u.role)! })));

  await db
    .insert(schema.auditLogs)
    .values({ userId: null, action: "seed", entity: "system", details: "Demo data created" });
}

async function main() {
  const reset = process.argv.includes("--reset");
  await migrate();
  if (reset) await wipe();
  const existing = await db.select({ id: schema.roles.id }).from(schema.roles).limit(1);
  if (existing.length === 0) {
    await seed();
    console.log(`Seeded demo data. Demo password for every user: ${DEMO_PASSWORD}`);
  } else {
    console.log("Database already has data. Use --reset to wipe and reseed.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
