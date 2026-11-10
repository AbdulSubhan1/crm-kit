import type { Permission } from "@/lib/rbac";
import { requirePermission } from "@/server/auth";
import { getContact } from "@/server/queries/contacts";

// Guards for server actions: check the permission, then load the record only if it is inside the user's scope.

export async function requireContact(permission: Permission, contactId: number) {
  const user = await requirePermission(permission);
  const row = await getContact(user, contactId);
  if (!row) throw new Error("errors.notFound");
  return { user, ...row };
}
