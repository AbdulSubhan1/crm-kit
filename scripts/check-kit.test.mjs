import assert from "node:assert/strict";
import { appendFile, cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { test } from "node:test";
import { checkKit } from "./check-kit.mjs";

const KIT = new URL("../", import.meta.url).pathname;
const { version: VERSION } = JSON.parse(await readFile(join(KIT, ".claude-plugin/plugin.json"), "utf8"));
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
  await writeFile(path, (await readFile(path, "utf8")).replace(`"version": "${VERSION}"`, '"version": "9.9.9"'));
  assert.ok((await checkKit(dir)).includes(`version mismatch: plugin.json ${VERSION}, marketplace.json 9.9.9`));
});

test("old cookie names and business tables in migrations are reported", async () => {
  const dir = await copyOfKit();
  await appendFile(join(dir, "template/constants/config.ts"), '\nexport const OLD = "pd_session";\n');
  const { mkdir } = await import("node:fs/promises");
  await mkdir(join(dir, "template/drizzle"), { recursive: true });
  await writeFile(join(dir, "template/drizzle/0001_x.sql"), 'CREATE TABLE "leads" ("id" serial);\n');
  const problems = await checkKit(dir);
  assert.ok(problems.some((p) => /constants\/config\.ts:\d+: business word "pd_session"/.test(p)), problems.join("\n"));
  assert.ok(problems.some((p) => /drizzle\/0001_x\.sql:1: business word "leads"/.test(p)), problems.join("\n"));
});

test("the CLI works from a folder whose path has a space", async () => {
  const { execFileSync } = await import("node:child_process");
  const parent = join(await mkdtemp(join(tmpdir(), "crm kit ")), "office work");
  await cp(await copyOfKit(), parent, { recursive: true });
  await appendFile(join(parent, "template/app/(app)/page.tsx"), "\n// shows the newest lead\n");
  let failed = false;
  try {
    execFileSync("node", [join(parent, "scripts/check-kit.mjs")], { stdio: "pipe" });
  } catch (err) {
    failed = true;
    assert.match(err.stdout.toString(), /business word "lead"/);
  }
  assert.ok(failed, "check-kit exited 0 from a path with a space");
});
