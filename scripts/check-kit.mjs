// The kit's self-check: skills are well formed and point at files that exist, the template carries no
// business words, and the two manifests agree on the version.   node scripts/check-kit.mjs
import { access, readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BUSINESS_PATTERNS, BUSINESS_WORDS } from "./sync-back.mjs";

// Migrations are scanned too: a business table name there means business code came back
const SKIP_DIRS = new Set(["node_modules", ".next", "test-results", "playwright-report", ".git"]);
const SKIP_FILES = new Set(["package-lock.json", "next-env.d.ts"]);
const TEXT = /\.(tsx?|mjs|js|json|md|css|ya?ml|sql)$/;
// Paths inside the kit that skills may mention. Kit scripts are .mjs; a skill's "scripts/setup-db.ts"
// is the CRM's own file, so only .mjs scripts are checked.
const KIT_PATH = /\b(?:(?:references|skills|template)\/[\w./()[\]-]*[\w)\]]|scripts\/[\w./-]+\.mjs)/g;

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // drizzle/meta snapshots use "policies" for Postgres row-security settings, not business data
      const drizzleMeta = entry.name === "meta" && dir.endsWith("drizzle");
      if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith(".pglite") && !drizzleMeta) yield* walk(join(dir, entry.name));
    } else if (TEXT.test(entry.name) && !SKIP_FILES.has(entry.name)) {
      yield join(dir, entry.name);
    }
  }
}

async function checkSkills(kitDir, problems) {
  const skillsDir = join(kitDir, "skills");
  for (const name of await readdir(skillsDir)) {
    const rel = `skills/${name}/SKILL.md`;
    let text;
    try {
      text = await readFile(join(kitDir, rel), "utf8");
    } catch {
      problems.push(`${rel}: missing`);
      continue;
    }
    const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    if (!/^name:\s*\S/m.test(front)) problems.push(`${rel}: missing name`);
    else if (front.match(/^name:\s*(.+)$/m)[1].trim() !== name) problems.push(`${rel}: name does not match its folder`);
    if (!/^description:\s*\S/m.test(front)) problems.push(`${rel}: missing description`);

    for (const [path] of text.matchAll(KIT_PATH)) {
      if (!(await exists(join(kitDir, path)))) problems.push(`${rel}: ${path} does not exist`);
    }
  }
}

async function checkTemplate(kitDir, problems) {
  const words = BUSINESS_WORDS.map((w) => [w, new RegExp(`\\b${w}\\b`, "i")]);
  for await (const file of walk(join(kitDir, "template"))) {
    const lines = (await readFile(file, "utf8")).split("\n");
    lines.forEach((line, i) => {
      const word = words.find(([, re]) => re.test(line))?.[0] ?? BUSINESS_PATTERNS.map((re) => line.match(re)?.[0]).find(Boolean);
      if (word) problems.push(`${relative(kitDir, file)}:${i + 1}: business word "${word}"`);
    });
  }
}

async function checkManifests(kitDir, problems) {
  const read = async (name) => JSON.parse(await readFile(join(kitDir, ".claude-plugin", name), "utf8"));
  const plugin = await read("plugin.json");
  const market = await read("marketplace.json");
  const listed = market.plugins?.find((p) => p.name === plugin.name);
  if (!listed) problems.push(`marketplace.json does not list ${plugin.name}`);
  else if (listed.version !== plugin.version) {
    problems.push(`version mismatch: plugin.json ${plugin.version}, marketplace.json ${listed.version}`);
  }
}

/** @returns {Promise<string[]>} problems, empty when the kit is fine */
export async function checkKit(kitDir) {
  const problems = [];
  await checkSkills(kitDir, problems);
  await checkTemplate(kitDir, problems);
  await checkManifests(kitDir, problems);
  return problems;
}

// CLI
if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  const problems = await checkKit(fileURLToPath(new URL("../", import.meta.url)));
  for (const p of problems) console.log(p);
  process.exit(problems.length ? 1 : 0);
}
