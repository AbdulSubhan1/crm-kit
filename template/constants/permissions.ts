// Every permission in the app, mapped to its group. Roles in the database grant a subset of these.
// Labels are in messages/<locale>.json under "permissions" and "permissionGroups".
// Each module adds its own, e.g. "members:view_all", "members:view_team", "members:view_own", "members:edit".
export const PERMISSIONS = {
  "dashboard:view": "dashboard",
  "users:manage": "admin",
  "roles:manage": "admin",
  "audit:view": "admin",
} as const;
