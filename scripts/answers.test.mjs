import assert from "node:assert/strict";
import { test } from "node:test";
import { suggestDefaults, validateAnswers } from "./lib/answers.mjs";

const VALID = {
  industry: "gym",
  appName: "FitDesk",
  slug: "fitdesk",
  country: "PK",
  locales: ["en", "ur"],
  currency: "PKR",
  brand: { base: "#0f766e", strong: "#115e59", soft: "#ccfbf1" },
};

test("validateAnswers accepts a complete set", () => {
  assert.deepEqual(validateAnswers(VALID), { ok: true, answers: VALID });
});

test("validateAnswers names each bad field", () => {
  const result = validateAnswers({
    ...VALID,
    industry: "",
    slug: "fit desk",
    locales: ["ur", "en"],
    currency: "rs",
    brand: { base: "teal", strong: "#115e59", soft: "#ccfbf1" },
  });
  assert.equal(result.ok, false);
  for (const field of ["industry", "slug", "locales", "currency", "brand.base"]) {
    assert.ok(
      result.errors.some((e) => e.startsWith(field)),
      `expected an error for ${field}, got ${result.errors.join("; ")}`,
    );
  }
});

test("suggestDefaults fills a Pakistani gym", () => {
  const a = suggestDefaults({ industry: "gym", country: "PK" });
  assert.deepEqual(a.locales, ["en", "ur"]);
  assert.equal(a.currency, "PKR");
  assert.ok(a.appName.length > 0);
  assert.match(a.slug, /^[a-z0-9-]+$/);
  assert.equal(validateAnswers(a).ok, true);
});

test("suggestDefaults fills a UAE clinic", () => {
  const a = suggestDefaults({ industry: "clinic", country: "AE" });
  assert.deepEqual(a.locales, ["en", "ar"]);
  assert.equal(a.currency, "AED");
});

test("suggestDefaults keeps what the owner answered", () => {
  const a = suggestDefaults({ industry: "school", country: "PK", appName: "SchoolBook", currency: "USD" });
  assert.equal(a.appName, "SchoolBook");
  assert.equal(a.slug, "schoolbook");
  assert.equal(a.currency, "USD");
});

test("suggestDefaults falls back to English and USD for an unknown country", () => {
  const a = suggestDefaults({ industry: "salon", country: "ZZ" });
  assert.deepEqual(a.locales, ["en"]);
  assert.equal(a.currency, "USD");
});
