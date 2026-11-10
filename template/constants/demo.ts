import type { Permission } from "@/lib/rbac";

// The seeded roles and demo users. The sign-in page shows one button per demo account, and
// scripts/setup-db.ts creates them. Each CRM adds its roles here from its approved knowledge base;
// labels are messages under "login.roles.<key>" and "login.roles.<key>Hint".

export type DemoRole = {
  key: string;
  name: string;
  description: string;
  isSystem?: boolean;
  permissions: Permission[] | "all";
};

export const DEMO_ROLES: DemoRole[] = [
  {
    key: "admin",
    name: "Admin",
    description: "Full access, including users, roles and the audit log",
    isSystem: true,
    permissions: "all",
  },
];

export const DEMO_ACCOUNTS: { name: string; email: string; role: string }[] = [
  { name: "Sara Admin", email: "admin@example.com", role: "admin" },
];
