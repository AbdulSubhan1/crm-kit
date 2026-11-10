import assert from "node:assert/strict";
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

  await put(join(crmDir, ".crm-kit.json"), JSON.stringify({ kitVersion: "0.1.0", answers: { industry: "gym" } }));
  await put(
    join(crmDir, "constants/permissions.ts"),
    'export const PERMISSIONS = {\n  "dashboard:view": "dashboard",\n  "members:view_all": "members",\n  "classes:create": "classes",\n} as const;\n',
  );
  await put(join(crmDir, "components/ui/calendar.tsx"), "/** A month of events. */\nexport function Calendar() {}\n");
  await put(join(crmDir, "components/ui/member-card.tsx"), "/** Shows a member's plan. */\nexport function MemberCard() {}\n");
  await put(join(crmDir, "components/ui/gym-badge.tsx"), "/** Gym only. */\nexport function GymBadge() {}\n");
  await put(join(crmDir, "components/ui/old.tsx"), "/** Shows a policy. */\nexport function Old() {}\n");
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
