import assert from "node:assert/strict";
import { appendFile, cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { test } from "node:test";
import { checkKit } from "./check-kit.mjs";

const KIT = new URL("../", import.meta.url).pathname;
const HEAVY = new Set(["node_modules", ".next", "test-results", "playwright-report", ".git"]);

async function copyOfKit() {
  const dir = await mkdtemp(join(tmpdir(), "crm-kit-check-"));
  await cp(KIT, dir, {
    recursive: true,
    filter: (src) => !HEAVY.has(basename(src)) && !basename(src).startsWith(".pglite"),
  });
  return dir;
}

test("the kit as committed has no problems", async () => {
  assert.deepEqual(await checkKit(await copyOfKit()), []);
});

test("a skill without a description is reported", async () => {
  const dir = await copyOfKit();
  const path = join(dir, "skills/new-crm/SKILL.md");
  await writeFile(path, (await readFile(path, "utf8")).replace(/^description:.*\n/m, ""));
  assert.ok((await checkKit(dir)).includes("skills/new-crm/SKILL.md: missing description"));
});

test("a skill pointing at a missing reference or script is reported", async () => {
  const dir = await copyOfKit();
  await appendFile(join(dir, "skills/new-crm/SKILL.md"), "\nSee references/missing.md and scripts/missing.mjs.\n");
  const problems = await checkKit(dir);
  assert.ok(problems.includes("skills/new-crm/SKILL.md: references/missing.md does not exist"));
  assert.ok(problems.includes("skills/new-crm/SKILL.md: scripts/missing.mjs does not exist"));
});

test("a business word in the template is reported with its line", async () => {
  const dir = await copyOfKit();
  await appendFile(join(dir, "template/app/(app)/page.tsx"), "\n// shows the newest lead\n");
  const problems = await checkKit(dir);
  assert.ok(
    problems.some((p) => /^template\/app\/\(app\)\/page\.tsx:\d+: business word "lead"$/.test(p)),
    problems.join("\n"),
  );
});

test("manifests with different versions are reported", async () => {
  const dir = await copyOfKit();
  const path = join(dir, ".claude-plugin/marketplace.json");
  await writeFile(path, (await readFile(path, "utf8")).replace('"version": "0.1.0"', '"version": "0.9.0"'));
  assert.ok((await checkKit(dir)).includes("version mismatch: plugin.json 0.1.0, marketplace.json 0.9.0"));
});
