import { expect, test } from "@playwright/test";
import { loginAs, sidebar } from "./helpers";

// The platform every CRM starts with: sign-in, navigation by permission, the audit log and real 404s.
// Each module adds its own role and scope tests (see references/module-pattern in the CRM kit).

test("admin signs in and sees only platform navigation", async ({ page }) => {
  await loginAs(page, "admin");
  const links = await sidebar(page).getByRole("link").allInnerTexts();
  expect(links.map((l) => l.trim())).toEqual([
    "Dashboard",
    "Users",
    "Roles",
    "Audit log",
    "Component library",
    "Knowledge base",
  ]);
});

test("dashboard shows the empty state", async ({ page }) => {
  await loginAs(page, "admin");
  await expect(page.getByText("Nothing here yet")).toBeVisible();
});

test("audit log lists the seed entry", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/audit");
  await expect(page.getByText("Demo data created")).toBeVisible();
});

test("an unknown page is a real 404", async ({ page }) => {
  await loginAs(page, "admin");
  expect((await page.goto("/design-system/NoSuchComponent"))?.status()).toBe(404);
});
