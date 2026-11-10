// Creates a new CRM project from template/: copies it, applies the start answers and makes the first commit.
//   node scripts/create.mjs --dest ~/fitdesk --answers answers.json
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { configureProject } from "./configure.mjs";
import { validateAnswers } from "./lib/answers.mjs";

// Build output, local databases and installed packages never travel
const SKIP = new Set(["node_modules", ".next", "test-results", "playwright-report", "next-env.d.ts"]);
const skipped = (name) => SKIP.has(name) || name.startsWith(".pglite");

async function isEmptyOrMissing(dir) {
  try {
    return (await readdir(dir)).length === 0;
  } catch {
    return true;
  }
}

/**
 * @param {string} dest the new project's folder
 * @param {object} answers the six start answers
 * @param {{ kitDir: string }} options
 * @returns {Promise<{ dir: string }>}
 */
export async function createProject(dest, answers, { kitDir }) {
  const checked = validateAnswers(answers);
  if (!checked.ok) throw new Error(`Invalid answers: ${checked.errors.join("; ")}`);
  const dir = resolve(dest);
  if (!(await isEmptyOrMissing(dir))) throw new Error(`Folder ${dir} already exists and is not empty`);

  const { version } = JSON.parse(await readFile(join(kitDir, ".claude-plugin/plugin.json"), "utf8"));
  await mkdir(dir, { recursive: true });
  await cp(join(kitDir, "template"), dir, { recursive: true, filter: (src) => !skipped(basename(src)) });

  await configureProject(dir, checked.answers);
  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.name = checked.answers.slug;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  // Lets sync-back and later checks know which kit version and answers this project started from
  await writeFile(
    join(dir, ".crm-kit.json"),
    JSON.stringify({ kitVersion: version, answers: checked.answers }, null, 2) + "\n",
  );

  const git = (...args) => execFileSync("git", args, { cwd: dir, stdio: "pipe" });
  git("init", "-q", "-b", "main");
  git("add", "-A");
  git("commit", "-q", "-m", `chore: start from crm-kit ${version}`);
  return { dir };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (name) => process.argv[process.argv.indexOf(name) + 1];
  if (!process.argv.includes("--dest") || !process.argv.includes("--answers")) {
    console.error("Usage: node scripts/create.mjs --dest <folder> --answers <answers.json>");
    process.exit(1);
  }
  const answers = JSON.parse(await readFile(arg("--answers"), "utf8"));
  const kitDir = new URL("../", import.meta.url).pathname;
  const { dir } = await createProject(arg("--dest"), answers, { kitDir });
  console.log(`Created ${dir}`);
}
