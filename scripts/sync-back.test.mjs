import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { syncBack } from "./sync-back.mjs";

async function put(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

// A tiny kit and a tiny gym CRM made from it
async function setup() {
  const root = await mkdtemp(join(tmpdir(), "crm-kit-sync-"));
  const kitDir = join(root, "kit");
  const crmDir = join(root, "crm");
  const manifest = (v) => JSON.stringify({ name: "crm-kit", version: v }, null, 2);
  await put(join(kitDir, ".claude-plugin/plugin.json"), manifest("0.1.0"));
  await put(
    join(kitDir, ".claude-plugin/marketplace.json"),
    JSON.stringify({ name: "crm-kit", plugins: [{ name: "crm-kit", version: "0.1.0", source: "./" }] }, null, 2),
  );
  await put(join(kitDir, "CHANGELOG.md"), "# Changelog\n\n## 0.1.0\n\n- First version.\n");
  await put(join(kitDir, "template/components/ui/button.tsx"), "export function Button() {}\n");
  await put(join(kitDir, "template/AGENTS.md"), "# Coding standard\n\n- Use the UI library.\n");
  // The kit is the owner's git checkout, never the plugin cache
  execFileSync("git", ["init", "-q"], { cwd: kitDir });

  await put(join(crmDir, ".crm-kit.json"), JSON.stringify({ kitVersion: "0.1.0", answers: { industry: "gym" } }));
  await put(
    join(crmDir, "constants/permissions.ts"),
    'export const PERMISSIONS = {\n  "dashboard:view": "dashboard",\n  "members:view_all": "members",\n  "classes:create": "classes",\n} as const;\n',
  );
  await put(join(crmDir, "components/ui/calendar.tsx"), "/** A month of events. */\nexport function Calendar() {}\n");
  await put(join(crmDir, "components/ui/member-card.tsx"), "/** Shows a member's plan. */\nexport function MemberCard() {}\n");
  await put(join(crmDir, "components/ui/gym-badge.tsx"), "/** Gym only. */\nexport function GymBadge() {}\n");
  await put(join(crmDir, "components/ui/old.tsx"), "/** Shows a policy. */\nexport function Old() {}\n");
  await put(join(crmDir, "components/ui/cookie.tsx"), 'export const NAME = "pd_session";\n');
  await put(join(crmDir, "constants/market.ts"), 'export const APP_NAME = "FitDesk";\n');
  // Same as the kit's copy except one new generic rule and one gym-only line
  await put(
    join(crmDir, "AGENTS.md"),
    "# Coding standard\n\n- Use the UI library.\n- Never log secrets.\n",
  );
  return { kitDir, crmDir };
}

test("copies a generic file, bumps both manifests and adds a changelog entry", async () => {
  const { kitDir, crmDir } = await setup();
  const result = await syncBack({
    crmDir,
    kitDir,
    files: ["components/ui/calendar.tsx"],
    bump: "minor",
    note: "Calendar component",
  });
  assert.deepEqual(result.copied, ["components/ui/calendar.tsx"]);
  assert.deepEqual(result.skipped, []);
  assert.equal(result.version, "0.2.0");
  assert.match(await readFile(join(kitDir, "template/components/ui/calendar.tsx"), "utf8"), /Calendar/);
  assert.equal(JSON.parse(await readFile(join(kitDir, ".claude-plugin/plugin.json"), "utf8")).version, "0.2.0");
  const market = JSON.parse(await readFile(join(kitDir, ".claude-plugin/marketplace.json"), "utf8"));
  assert.equal(market.plugins[0].version, "0.2.0");
  const changelog = await readFile(join(kitDir, "CHANGELOG.md"), "utf8");
  assert.ok(changelog.indexOf("## 0.2.0") < changelog.indexOf("## 0.1.0"));
  assert.match(changelog, /## 0\.2\.0\n\n- Calendar component/);
});

test("skips files with business words: the industry, module areas and insurance words", async () => {
  const { kitDir, crmDir } = await setup();
  const result = await syncBack({
    crmDir,
    kitDir,
    files: ["components/ui/member-card.tsx", "components/ui/gym-badge.tsx", "components/ui/old.tsx"],
    bump: "patch",
    note: "nothing generic",
  });
  assert.deepEqual(result.copied, []);
  assert.deepEqual(
    result.skipped.map((s) => s.reason),
    ['contains business word "member"', 'contains business word "gym"', 'contains business word "policy"'],
  );
  await assert.rejects(access(join(kitDir, "template/components/ui/member-card.tsx")));
});

test("skips paths outside the CRM", async () => {
  const { kitDir, crmDir } = await setup();
  const result = await syncBack({
    crmDir,
    kitDir,
    files: ["../kit/CHANGELOG.md", "/etc/hosts"],
    bump: "patch",
    note: "x",
  });
  assert.deepEqual(
    result.skipped.map((s) => s.reason),
    ["outside the CRM", "outside the CRM"],
  );
});

test("nothing copied means no version bump", async () => {
  const { kitDir, crmDir } = await setup();
  const result = await syncBack({ crmDir, kitDir, files: ["components/ui/old.tsx"], bump: "minor", note: "x" });
  assert.equal(result.version, "0.1.0");
  assert.doesNotMatch(await readFile(join(kitDir, "CHANGELOG.md"), "utf8"), /0\.2\.0/);
});

test("refuses a kit folder that is not a git checkout", async () => {
  const { kitDir, crmDir } = await setup();
  const { rm } = await import("node:fs/promises");
  await rm(join(kitDir, ".git"), { recursive: true });
  await assert.rejects(
    syncBack({ crmDir, kitDir, files: ["components/ui/calendar.tsx"], bump: "minor", note: "x" }),
    /is not a git checkout of the kit/,
  );
});

test("refuses the plugin cache even if it is a git checkout", async () => {
  const { crmDir } = await setup();
  const cache = join(await mkdtemp(join(tmpdir(), "home-")), ".claude/plugins/cache/crm-kit/crm-kit/0.1.0");
  await mkdir(cache, { recursive: true });
  execFileSync("git", ["init", "-q"], { cwd: cache });
  await assert.rejects(
    syncBack({ crmDir, kitDir: cache, files: ["components/ui/calendar.tsx"], bump: "minor", note: "x" }),
    /plugin cache/,
  );
});

test("a missing file or a folder is skipped before anything is copied", async () => {
  const { kitDir, crmDir } = await setup();
  const result = await syncBack({
    crmDir,
    kitDir,
    files: ["components/ui/calendar.tsx", "components/ui/typo.tsx", "components/ui"],
    bump: "minor",
    note: "Calendar",
  });
  assert.deepEqual(result.copied, ["components/ui/calendar.tsx"]);
  assert.deepEqual(result.skipped, [
    { file: "components/ui/typo.tsx", reason: "not found" },
    { file: "components/ui", reason: "not a file" },
  ]);
  assert.equal(result.version, "0.2.0");
});

test("industry names with & and short words do not block everything", async () => {
  const { kitDir, crmDir } = await setup();
  await put(join(crmDir, ".crm-kit.json"), JSON.stringify({ answers: { industry: "gyms & fitness and more" } }));
  const result = await syncBack({ crmDir, kitDir, files: ["components/ui/calendar.tsx"], bump: "minor", note: "x" });
  assert.deepEqual(result.copied, ["components/ui/calendar.tsx"]);
});

test("hyphenated industries are matched as written", async () => {
  const { kitDir, crmDir } = await setup();
  await put(join(crmDir, ".crm-kit.json"), JSON.stringify({ answers: { industry: "e-commerce" } }));
  await put(join(crmDir, "components/ui/cart.tsx"), "/** An e-commerce cart. */\nexport function Cart() {}\n");
  const result = await syncBack({ crmDir, kitDir, files: ["components/ui/cart.tsx"], bump: "patch", note: "x" });
  assert.deepEqual(result.skipped, [{ file: "components/ui/cart.tsx", reason: 'contains business word "e-commerce"' }]);
});

test("a file the kit already has is judged only by the lines the CRM added", async () => {
  const { kitDir, crmDir } = await setup();
  await put(join(kitDir, "template/AGENTS.md"), "# Coding standard\n\n- Use the UI library, e.g. members/[id]/layout.tsx.\n");
  await put(
    join(crmDir, "AGENTS.md"),
    "# Coding standard\n\n- Use the UI library, e.g. members/[id]/layout.tsx.\n- Never log secrets.\n",
  );
  const ok = await syncBack({ crmDir, kitDir, files: ["AGENTS.md"], bump: "minor", note: "Secrets rule" });
  assert.deepEqual(ok.copied, ["AGENTS.md"]);

  await put(join(crmDir, "AGENTS.md"), "# Coding standard\n\n- Members always have a trainer.\n");
  const bad = await syncBack({ crmDir, kitDir, files: ["AGENTS.md"], bump: "minor", note: "x" });
  assert.deepEqual(bad.skipped.map((s) => s.reason), ['contains business word "members"']);
});

test("old PolicyDesk cookie names are business words", async () => {
  const { kitDir, crmDir } = await setup();
  const result = await syncBack({ crmDir, kitDir, files: ["components/ui/cookie.tsx"], bump: "patch", note: "x" });
  assert.deepEqual(result.skipped.map((s) => s.reason), ['contains business word "pd_session"']);
});

test("market settings, messages and project files are never synced", async () => {
  const { kitDir, crmDir } = await setup();
  await put(join(crmDir, "messages/ur.json"), "{}\n");
  await put(join(crmDir, "package.json"), "{}\n");
  const result = await syncBack({
    crmDir,
    kitDir,
    files: ["constants/market.ts", "messages/ur.json", "package.json", ".crm-kit.json"],
    bump: "patch",
    note: "x",
  });
  assert.deepEqual(result.copied, []);
  assert.ok(result.skipped.every((s) => s.reason === "belongs to this CRM's setup"), JSON.stringify(result.skipped));
});
