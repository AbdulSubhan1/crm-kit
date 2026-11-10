// Applies the start answers to a project made from template/: market settings, languages and brand colour.
import { copyFile, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { validateAnswers } from "./lib/answers.mjs";

/** Scripts written right to left. Any other language is laid out left to right. */
export const RTL = new Set(["ar", "ur", "fa", "he", "ps", "sd"]);

const nameOf = (code) => new Intl.DisplayNames([code], { type: "language" }).of(code) ?? code;

function marketFile(a) {
  const locales = a.locales.map((l) => `"${l}"`).join(", ");
  const rtl = a.locales.filter((l) => RTL.has(l)).map((l) => `"${l}"`).join(", ");
  const names = a.locales.map((l) => `${l}: ${JSON.stringify(nameOf(l))}`).join(", ");
  return `// The market this CRM serves. The CRM kit's configure script writes this file from the start answers;
// everything that depends on the market (languages, direction, phone numbers, money) reads it from here.

export const APP_NAME = ${JSON.stringify(a.appName)};

/** English first, then the market's languages. */
export const LOCALES = [${locales}] as const;
export const DEFAULT_LOCALE = "en";
export const RTL_LOCALES: readonly string[] = [${rtl}];
export const LOCALE_NAMES: Record<(typeof LOCALES)[number], string> = { ${names} };

/** ISO 3166-1 country for phone numbers. */
export const DEFAULT_COUNTRY = "${a.country}";

/** ISO 4217 currency for money. */
export const CURRENCY = "${a.currency}";
`;
}

/**
 * @param {string} dir project root
 * @param {object} answers the six start answers (see scripts/lib/answers.mjs)
 */
export async function configureProject(dir, answers) {
  const checked = validateAnswers(answers);
  if (!checked.ok) throw new Error(`Invalid answers: ${checked.errors.join("; ")}`);
  const a = checked.answers;

  // Check everything before changing anything
  const countries = await readFile(join(dir, "constants/countries.ts"), "utf8");
  if (!countries.includes(`code: "${a.country}"`)) {
    throw new Error(`${a.country} is not in constants/countries.ts. Add its dialling code and number lengths first.`);
  }

  await writeFile(join(dir, "constants/market.ts"), marketFile(a));

  // Messages: one file per locale. New languages start as a copy of English for the new-crm skill to translate.
  const messages = join(dir, "messages");
  for (const file of await readdir(messages)) {
    const locale = file.replace(/\.json$/, "");
    if (!a.locales.includes(locale)) await rm(join(messages, file));
  }
  const present = new Set((await readdir(messages)).map((f) => f.replace(/\.json$/, "")));
  for (const locale of a.locales) {
    if (!present.has(locale)) await copyFile(join(messages, "en.json"), join(messages, `${locale}.json`));
  }
  for (const locale of a.locales) {
    const path = join(messages, `${locale}.json`);
    const json = JSON.parse(await readFile(path, "utf8"));
    json.app.name = a.appName;
    await writeFile(path, JSON.stringify(json, null, 2) + "\n");
  }

  const cssPath = join(dir, "app/globals.css");
  const css = await readFile(cssPath, "utf8");
  const brand = `/* brand:start */
  --color-brand: ${a.brand.base};
  --color-brand-strong: ${a.brand.strong};
  --color-brand-soft: ${a.brand.soft};
  /* brand:end */`;
  await writeFile(cssPath, css.replace(/\/\* brand:start \*\/[\s\S]*?\/\* brand:end \*\//, brand));
}
