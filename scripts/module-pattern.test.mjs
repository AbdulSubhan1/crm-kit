import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createProject } from "./create.mjs";

const KIT = fileURLToPath(new URL("../", import.meta.url));
const PATTERN = join(KIT, "references/module-pattern");
const BRAND = { base: "#0f766e", strong: "#115e59", soft: "#ccfbf1" };

for (const [country, locales, currency] of [
  ["PK", ["en", "ur"], "PKR"],
  ["GB", ["en", "fr"], "GBP"],
  ["US", ["en"], "USD"],
  ["AE", ["en", "ar"], "AED"],
]) {
  test(`the module pattern's patch applies to a fresh ${locales.join("+")} project`, async () => {
    const dest = join(await mkdtemp(join(tmpdir(), "crm-kit-pattern-")), "app");
    await createProject(
      dest,
      { industry: "gym", appName: "FitDesk", slug: "fitdesk", country, locales, currency, brand: BRAND },
      { kitDir: KIT },
    );
    execFileSync("git", ["apply", "--check", join(PATTERN, "edits.patch")], { cwd: dest, stdio: "pipe" });
  });
}

test("the pattern's messages cover every key its code uses", async () => {
  const messages = JSON.parse(await readFile(join(PATTERN, "messages.json"), "utf8"));
  assert.ok(messages.contacts?.create, "contacts namespace");
  assert.ok(messages.nav?.contacts, "nav item");
  assert.ok(messages.permissions?.["contacts:view_all"], "permission labels");
  assert.ok(messages.permissionGroups?.contacts, "permission group");
  // Keys the template already has don't need to be in the pattern
  const template = JSON.parse(await readFile(join(KIT, "template/messages/en.json"), "utf8"));
  assert.ok(messages.placeholders?.note ?? template.placeholders?.note, "note placeholder");
});
