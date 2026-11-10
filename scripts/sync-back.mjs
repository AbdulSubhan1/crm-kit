// Copies generic improvements from a CRM back into the kit's template, bumps the version and logs the change.
//   node scripts/sync-back.mjs --crm ~/fitdesk --bump minor --note "Calendar component" components/ui/calendar.tsx ...
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize } from "node:path";

/** Words that mark code as belonging to one business. The kit's own first CRM was an insurance CRM. */
export const BUSINESS_WORDS = [
  "lead",
  "leads",
  "policy",
  "policies",
  "quote",
  "quotes",
  "kyc",
  "insurance",
  "insurer",
  "policydesk",
];

const PLATFORM_AREAS = new Set(["dashboard", "users", "roles", "audit"]);

const singular = (w) => (w.endsWith("ies") ? `${w.slice(0, -3)}y` : w.endsWith("es") && /(ss|x|ch|sh)es$/.test(w) ? w.slice(0, -2) : w.replace(/s$/, ""));

/** The CRM's own business words: its industry and the areas of its permissions, singular and plural. */
async function crmWords(crmDir) {
  const words = [];
  try {
    const { answers } = JSON.parse(await readFile(join(crmDir, ".crm-kit.json"), "utf8"));
    if (answers?.industry) words.push(...answers.industry.toLowerCase().split(/\s+/));
  } catch {
    // A CRM made before .crm-kit.json existed still has its permissions
  }
  try {
    const perms = await readFile(join(crmDir, "constants/permissions.ts"), "utf8");
    for (const [, area] of perms.matchAll(/"([a-z_]+):[a-z_]+"/g)) {
      if (!PLATFORM_AREAS.has(area)) words.push(area, singular(area));
    }
  } catch {
    // No permissions file: only the base words apply
  }
  return [...new Set(words)];
}

function businessWord(text, words) {
  const lower = text.toLowerCase();
  return words.find((w) => new RegExp(`\\b${w.replace(/[^a-z0-9]/g, "")}\\b`).test(lower));
}

function bumpVersion(version, bump) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

async function updateJson(path, update) {
  try {
    const json = JSON.parse(await readFile(path, "utf8"));
    update(json);
    await writeFile(path, JSON.stringify(json, null, 2) + "\n");
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

/**
 * @param {{ crmDir: string, kitDir: string, files: string[], bump: "patch" | "minor" | "major", note: string }} options
 * @returns {Promise<{ copied: string[], skipped: { file: string, reason: string }[], version: string }>}
 */
export async function syncBack({ crmDir, kitDir, files, bump, note }) {
  const words = [...(await crmWords(crmDir)), ...BUSINESS_WORDS];
  const copied = [];
  const skipped = [];

  for (const file of files) {
    const rel = normalize(file);
    if (isAbsolute(rel) || rel.startsWith("..")) {
      skipped.push({ file, reason: "outside the CRM" });
      continue;
    }
    const content = await readFile(join(crmDir, rel), "utf8");
    const word = businessWord(`${rel}\n${content}`, words);
    if (word) {
      skipped.push({ file, reason: `contains business word "${word}"` });
      continue;
    }
    const target = join(kitDir, "template", rel);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(crmDir, rel), target);
    copied.push(rel);
  }

  const pluginPath = join(kitDir, ".claude-plugin/plugin.json");
  let { version } = JSON.parse(await readFile(pluginPath, "utf8"));
  if (copied.length) {
    version = bumpVersion(version, bump);
    await updateJson(pluginPath, (j) => (j.version = version));
    await updateJson(join(kitDir, ".claude-plugin/marketplace.json"), (j) => {
      for (const p of j.plugins ?? []) if (p.name === "crm-kit") p.version = version;
    });
    const changelogPath = join(kitDir, "CHANGELOG.md");
    const changelog = await readFile(changelogPath, "utf8");
    const entry = `## ${version}\n\n- ${note}\n- Files: ${copied.map((f) => `\`${f}\``).join(", ")}\n\n`;
    const at = changelog.indexOf("## ");
    await writeFile(changelogPath, at < 0 ? `${changelog}\n${entry}` : changelog.slice(0, at) + entry + changelog.slice(at));
  }
  return { copied, skipped, version };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const take = (name) => {
    const i = args.indexOf(name);
    return i < 0 ? undefined : args.splice(i, 2)[1];
  };
  const crmDir = take("--crm");
  const bump = take("--bump") ?? "patch";
  const note = take("--note");
  if (!crmDir || !note || args.length === 0) {
    console.error('Usage: node scripts/sync-back.mjs --crm <folder> --bump patch|minor|major --note "<what>" <file> ...');
    process.exit(1);
  }
  const kitDir = new URL("../", import.meta.url).pathname;
  const result = await syncBack({ crmDir, kitDir, files: args, bump, note });
  console.log(JSON.stringify(result, null, 2));
}
