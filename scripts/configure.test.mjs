import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { configureProject } from "./configure.mjs";

const TEMPLATE = new URL("../template/", import.meta.url).pathname;
const BRAND = { base: "#0f766e", strong: "#115e59", soft: "#ccfbf1" };

// A throwaway copy of the files configure touches
async function project() {
  const dir = await mkdtemp(join(tmpdir(), "crm-kit-configure-"));
  for (const path of ["constants", "messages", "app/globals.css"]) {
    await cp(join(TEMPLATE, path), join(dir, path), { recursive: true });
  }
  return dir;
}

const answers = (over = {}) => ({
  industry: "gym",
  appName: "FitDesk",
  slug: "fitdesk",
  country: "PK",
  locales: ["en", "ur"],
  currency: "PKR",
  brand: BRAND,
  ...over,
});

test("writes the market, swaps Arabic for Urdu and sets the brand", async () => {
  const dir = await project();
  await configureProject(dir, answers());

  const market = await readFile(join(dir, "constants/market.ts"), "utf8");
  assert.match(market, /APP_NAME = "FitDesk"/);
  assert.match(market, /LOCALES = \["en", "ur"\] as const/);
  assert.match(market, /RTL_LOCALES: readonly string\[\] = \["ur"\]/);
  assert.match(market, /DEFAULT_COUNTRY = "PK"/);
  assert.match(market, /CURRENCY = "PKR"/);
  assert.match(market, /ur: "اردو"/);

  const en = JSON.parse(await readFile(join(dir, "messages/en.json"), "utf8"));
  const ur = JSON.parse(await readFile(join(dir, "messages/ur.json"), "utf8"));
  assert.deepEqual(Object.keys(ur).sort(), Object.keys(en).sort());
  assert.equal(en.app.name, "FitDesk");
  assert.equal(ur.app.name, "FitDesk");
  await assert.rejects(access(join(dir, "messages/ar.json")));

  const css = await readFile(join(dir, "app/globals.css"), "utf8");
  const brand = css.slice(css.indexOf("/* brand:start */"), css.indexOf("/* brand:end */"));
  for (const hex of Object.values(BRAND)) assert.ok(brand.includes(hex), `${hex} missing from the brand block`);
});

test("a left-to-right second language has no RTL locales", async () => {
  const dir = await project();
  await configureProject(dir, answers({ country: "GB", locales: ["en", "fr"], currency: "GBP" }));
  const market = await readFile(join(dir, "constants/market.ts"), "utf8");
  assert.match(market, /RTL_LOCALES: readonly string\[\] = \[\]/);
  assert.match(market, /fr: "français"/);
});

test("English only keeps a single locale file", async () => {
  const dir = await project();
  await configureProject(dir, answers({ country: "US", locales: ["en"], currency: "USD" }));
  await assert.rejects(access(join(dir, "messages/ar.json")));
  await access(join(dir, "messages/en.json"));
});

test("a country without phone rules is refused before anything changes", async () => {
  const dir = await project();
  const before = await readFile(join(dir, "constants/market.ts"), "utf8");
  await assert.rejects(configureProject(dir, answers({ country: "ZZ" })), /ZZ is not in constants\/countries.ts/);
  assert.equal(await readFile(join(dir, "constants/market.ts"), "utf8"), before);
});
