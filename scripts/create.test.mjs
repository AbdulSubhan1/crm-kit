import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createProject } from "./create.mjs";

const KIT = new URL("../", import.meta.url).pathname;
const ANSWERS = {
  industry: "gym",
  appName: "FitDesk",
  slug: "fitdesk",
  country: "PK",
  locales: ["en", "ur"],
  currency: "PKR",
  brand: { base: "#0f766e", strong: "#115e59", soft: "#ccfbf1" },
};

test("creates a configured project with one commit", async () => {
  const dest = join(await mkdtemp(join(tmpdir(), "crm-kit-create-")), "fitdesk");
  const { dir } = await createProject(dest, ANSWERS, { kitDir: KIT });
  assert.equal(dir, dest);

  const pkg = JSON.parse(await readFile(join(dest, "package.json"), "utf8"));
  assert.equal(pkg.name, "fitdesk");
  assert.match(await readFile(join(dest, "constants/market.ts"), "utf8"), /APP_NAME = "FitDesk"/);
  await access(join(dest, "messages/ur.json"));

  const marker = JSON.parse(await readFile(join(dest, ".crm-kit.json"), "utf8"));
  assert.equal(marker.kitVersion, "0.1.0");
  assert.deepEqual(marker.answers, ANSWERS);

  for (const skipped of ["node_modules", ".next", ".pglite", "test-results"]) {
    await assert.rejects(access(join(dest, skipped)), `${skipped} should not be copied`);
  }

  const log = execFileSync("git", ["log", "--format=%s"], { cwd: dest, encoding: "utf8" }).trim().split("\n");
  assert.deepEqual(log, ["chore: start from crm-kit 0.1.0"]);
});

test("the files create writes pass the project's own Prettier check", async (t) => {
  const prettier = join(KIT, "template/node_modules/.bin/prettier");
  try {
    await access(prettier);
  } catch {
    return t.skip("template dependencies are not installed");
  }
  const dest = join(await mkdtemp(join(tmpdir(), "crm-kit-format-")), "fitdesk");
  await createProject(dest, ANSWERS, { kitDir: KIT });
  // Prettier loads the Tailwind plugin from the project, so borrow the template's installed packages
  await symlink(join(KIT, "template/node_modules"), join(dest, "node_modules"));
  // Throws (exit 1) if any written file is not formatted the way npm run check expects
  execFileSync(prettier, ["--check", ".crm-kit.json", "package.json", "constants/market.ts", "messages", "app/globals.css"], {
    cwd: dest,
    stdio: "pipe",
  });
});

test("refuses a folder that exists and is not empty, and leaves it alone", async () => {
  const dest = await mkdtemp(join(tmpdir(), "crm-kit-busy-"));
  await writeFile(join(dest, "notes.txt"), "keep me");
  await assert.rejects(
    createProject(dest, ANSWERS, { kitDir: KIT }),
    new RegExp(`Folder ${dest} already exists and is not empty`),
  );
  assert.deepEqual(await readdir(dest), ["notes.txt"]);
});

test("an empty existing folder is fine", async () => {
  const dest = await mkdtemp(join(tmpdir(), "crm-kit-empty-"));
  await mkdir(dest, { recursive: true });
  await createProject(dest, ANSWERS, { kitDir: KIT });
  await access(join(dest, "package.json"));
});

test("invalid answers create nothing", async () => {
  const dest = join(await mkdtemp(join(tmpdir(), "crm-kit-bad-")), "nope");
  await assert.rejects(createProject(dest, { ...ANSWERS, slug: "Fit Desk" }, { kitDir: KIT }), /slug/);
  await assert.rejects(access(dest));
});
