import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./helpers";

const firstContact = (page: Page) => page.locator('main a[href^="/contacts/"]:not([href="/contacts/new"])').first();

// The module pattern's own tests: copy and rename them with the module (see references/module-pattern/MAP.md)

test("admin creates a contact and sees it in the list", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/contacts/new");
  await page.getByLabel("Full name").fill("Hamza Tariq");
  await page.getByLabel("Email").fill("hamza@example.com");
  await page.getByRole("textbox", { name: "Phone" }).fill("501234567");
  await page.getByRole("button", { name: "Create contact" }).click();

  await expect(page).toHaveURL(/\/contacts\/[0-9a-f-]{36}$/, { timeout: 20_000 });
  await page.goto("/contacts?q=Hamza");
  await expect(page.getByRole("link", { name: "Hamza Tariq" })).toBeVisible();
});

test("contact page uses a UUID link and shows the audit timeline", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/contacts");
  await firstContact(page).click();
  await expect(page).toHaveURL(/\/contacts\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
  await expect(page.getByText(/created this contact/)).toBeVisible();
});

test("adding a note puts it on the timeline", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/contacts");
  await firstContact(page).click();
  await page.getByLabel("Note").fill("Called about the yearly plan");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Called about the yearly plan")).toBeVisible();
});

test("an unknown contact UUID is a 404", async ({ page }) => {
  await loginAs(page, "admin");
  expect((await page.goto("/contacts/00000000-0000-4000-8000-000000000000"))?.status()).toBe(404);
  expect((await page.goto("/contacts/1"))?.status()).toBe(404);
});
