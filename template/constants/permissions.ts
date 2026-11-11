// Every permission in the app, mapped to its group. Roles in the database grant a subset of these.
// Labels are in messages/<locale>.json under "permissions" and "permissionGroups".
// Each module adds its own: <area>:view_all, <area>:view_team, <area>:view_own, <area>:create, <area>:edit.
export const PERMISSIONS = {
  "dashboard:view": "dashboard",
  "users:manage": "admin",
  "roles:manage": "admin",
  "audit:view": "admin",
} as const;
