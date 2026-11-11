// Copies generic improvements from a CRM back into the kit's template, bumps the version and logs the change.
//   node scripts/sync-back.mjs --kit ~/crm-kit --crm ~/fitdesk --bump minor --note "Calendar component" <file> ...
// The kit must be the owner's git checkout: an installed plugin lives in Claude Code's cache, which is
// replaced on every update, so anything written there is lost.
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Words that mark code as belonging to one business. The kit's own first CRM was an insurance CRM. */
export const BUSINESS_WORDS = [
  "lead",
  "leads",
  "policy",
  "policies",
  "quote",
  "quotes",
  "quotation",
  "kyc",
  "insurance",
  "insured",
  "insurer",
  "insurers",
  "policydesk",
];

/** Patterns that are business-specific but not whole words, e.g. PolicyDesk's cookie names. */
export const BUSINESS_PATTERNS = [/\bpd_\w+/i];

/** One CRM's own settings and identity; they never belong in the shared template. */
const CRM_ONLY = [/^constants\/market\.ts$/, /^messages\//, /^package(-lock)?\.json$/, /^\.crm-kit\.json$/, /^\.env/];

const PLATFORM_AREAS = new Set(["dashboard", "users", "roles", "audit"]);
const STOPWORDS = new Set(["and", "the", "for", "with", "services", "service", "business", "company", "more"]);

const singular = (w) =>
  w.endsWith("ies") ? `${w.slice(0, -3)}y` : /(ss|x|ch|sh)es$/.test(w) ? w.slice(0, -2) : w.replace(/s$/, "");
const escape = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The CRM's own business words: its industry and the areas of its permissions, singular and plural. */
async function crmWords(crmDir) {
  const words = [];
  try {
    const { answers } = JSON.parse(await readFile(join(crmDir, ".crm-kit.json"), "utf8"));
    const industry = (answers?.industry ?? "").toLowerCase();
    // Keep hyphenated words whole ("e-commerce"); drop symbols, short words and filler
    for (const w of industry.split(/[^a-z0-9-]+/)) {
      if (w.length >= 3 && !STOPWORDS.has(w)) words.push(w);
    }
  } catch {
    // A CRM made before .crm-kit.json existed still has its permissions
  }
  try {
    const perms = await readFile(join(crmDir, "constants/permissions.ts"), "utf8");
    // Only real entries, not examples in comments
    const code = perms
      .split("\n")
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    for (const [, area] of code.matchAll(/"([a-z_]+):[a-z_]+"/g)) {
      if (!PLATFORM_AREAS.has(area)) words.push(area, singular(area));
    }
  } catch {
    // No permissions file: only the base words apply
  }
  return [...new Set(words)];
}

/** The first business word or pattern in `text`, or undefined. */
export function businessWord(text, words) {
  const lower = text.toLowerCase();
  const word = words.find((w) => new RegExp(`(?<![\\w-])${escape(w)}(?![\\w-])`).test(lower));
  if (word) return word;
  for (const pattern of BUSINESS_PATTERNS) {
    const hit = text.match(pattern);
    if (hit) return hit[0];
  }
  return undefined;
}

/** Throws unless kitDir is the owner's git checkout of the kit (not Claude Code's plugin cache). */
function assertKitCheckout(kitDir) {
  const dir = resolve(kitDir);
  if (dir.split("/").join("/").includes("/.claude/plugins/")) {
    throw new Error(`${dir} is the installed plugin cache. Pass your git checkout of the kit, e.g. --kit ~/crm-kit`);
  }
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: dir, stdio: "pipe" });
  } catch {
    throw new Error(`${dir} is not a git checkout of the kit. Clone it first: git clone https://github.com/AbdulSubhan1/crm-kit`);
  }
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

const readOrEmpty = (path) => readFile(path, "utf8").catch(() => "");

/** Why `rel` can't be synced, or undefined when it can. Reads nothing outside the CRM. */
async function reasonToSkip(rel, crmDir, kitDir, words) {
  if (isAbsolute(rel) || rel.startsWith("..")) return "outside the CRM";
  if (CRM_ONLY.some((re) => re.test(rel))) return "belongs to this CRM's setup";
  let info;
  try {
    info = await stat(join(crmDir, rel));
  } catch {
    return "not found";
  }
  if (!info.isFile()) return "not a file";
  // A file the kit already has is judged only by the lines this CRM added
  const kitLines = new Set((await readOrEmpty(join(kitDir, "template", rel))).split("\n"));
  const added = (await readFile(join(crmDir, rel), "utf8"))
    .split("\n")
    .filter((line) => !kitLines.has(line))
    .join("\n");
  const word = businessWord(`${rel}\n${added}`, words);
  return word ? `contains business word "${word}"` : undefined;
}

/**
 * @param {{ crmDir: string, kitDir: string, files: string[], bump: "patch" | "minor" | "major", note: string }} options
 * @returns {Promise<{ copied: string[], skipped: { file: string, reason: string }[], version: string }>}
 */
export async function syncBack({ crmDir, kitDir, files, bump, note }) {
  assertKitCheckout(kitDir);
  const words = [...(await crmWords(crmDir)), ...BUSINESS_WORDS];

  // Decide every file first, so a bad path never leaves a half-done sync
  const copied = [];
  const skipped = [];
  for (const file of files) {
    const rel = normalize(file);
    const reason = await reasonToSkip(rel, crmDir, kitDir, words);
    if (reason) skipped.push({ file, reason });
    else copied.push(rel);
  }

  for (const rel of copied) {
    const target = join(kitDir, "template", rel);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(crmDir, rel), target);
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
if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  const args = process.argv.slice(2);
  const take = (name) => {
    const i = args.indexOf(name);
    return i < 0 ? undefined : args.splice(i, 2)[1];
  };
  const kitDir = take("--kit") ?? process.env.CRM_KIT_DIR;
  const crmDir = take("--crm");
  const bump = take("--bump") ?? "patch";
  const note = take("--note");
  if (!kitDir || !crmDir || !note || args.length === 0) {
    console.error(
      'Usage: node sync-back.mjs --kit <your crm-kit checkout> --crm <folder> --bump patch|minor|major --note "<what>" <file> ...',
    );
    process.exit(1);
  }
  try {
    console.log(JSON.stringify(await syncBack({ crmDir, kitDir, files: args, bump, note }), null, 2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
