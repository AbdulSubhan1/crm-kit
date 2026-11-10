import { PERMISSIONS } from "@/constants/permissions";

export type Permission = keyof typeof PERMISSIONS;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export function isPermission(value: string): value is Permission {
  return value in PERMISSIONS;
}

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  teamId: number | null;
  teamName: string | null;
  permissions: Permission[];
};

export function can(user: Pick<SessionUser, "permissions">, permission: Permission) {
  return user.permissions.includes(permission);
}

export type Scope = "all" | "team" | "own" | "none";

/**
 * The widest data scope a user has for one area of records, from its view permissions:
 * `<area>:view_all` > `<area>:view_team` > `<area>:view_own`.
 */
export function scopeOf(user: Pick<SessionUser, "permissions">, area: string): Scope {
  const has = (p: string) => (user.permissions as string[]).includes(p);
  if (has(`${area}:view_all`)) return "all";
  if (has(`${area}:view_team`)) return "team";
  if (has(`${area}:view_own`)) return "own";
  return "none";
}
