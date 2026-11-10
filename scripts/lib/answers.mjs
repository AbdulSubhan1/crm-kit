// The six start questions of a new CRM, checked and, where unanswered, suggested.
// The same table is written out for people in references/market-defaults.md.

/** Languages (English first) and currency per country, ISO codes. */
export const MARKETS = {
  PK: { locales: ["en", "ur"], currency: "PKR" },
  AE: { locales: ["en", "ar"], currency: "AED" },
  SA: { locales: ["en", "ar"], currency: "SAR" },
  QA: { locales: ["en", "ar"], currency: "QAR" },
  KW: { locales: ["en", "ar"], currency: "KWD" },
  BH: { locales: ["en", "ar"], currency: "BHD" },
  OM: { locales: ["en", "ar"], currency: "OMR" },
  IN: { locales: ["en", "hi"], currency: "INR" },
  GB: { locales: ["en"], currency: "GBP" },
  US: { locales: ["en"], currency: "USD" },
};

const FALLBACK = { locales: ["en"], currency: "USD" };

/** Teal: calm, readable on white and dark, and not tied to any one industry. */
export const DEFAULT_BRAND = { base: "#0f766e", strong: "#115e59", soft: "#ccfbf1" };

const HEX = /^#[0-9a-f]{6}$/i;

const titleCase = (s) => s.replace(/(^|[\s-])(\w)/g, (_, sep, c) => sep + c.toUpperCase()).replace(/[\s-]/g, "");
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * @param {unknown} a
 * @returns {{ ok: true, answers: object } | { ok: false, errors: string[] }}
 */
export function validateAnswers(a) {
  const errors = [];
  const x = a && typeof a === "object" ? a : {};
  if (typeof x.industry !== "string" || !x.industry.trim()) errors.push("industry: required");
  if (typeof x.appName !== "string" || !x.appName.trim()) errors.push("appName: required");
  if (typeof x.slug !== "string" || !/^[a-z0-9-]+$/.test(x.slug)) errors.push("slug: use lowercase letters, digits and -");
  if (typeof x.country !== "string" || !/^[A-Z]{2}$/.test(x.country)) errors.push("country: use a 2-letter ISO code");
  if (!Array.isArray(x.locales) || x.locales[0] !== "en" || !x.locales.every((l) => /^[a-z]{2}$/.test(l))) {
    errors.push('locales: a list of 2-letter codes starting with "en"');
  }
  if (typeof x.currency !== "string" || !/^[A-Z]{3}$/.test(x.currency)) errors.push("currency: use a 3-letter ISO code");
  for (const key of ["base", "strong", "soft"]) {
    if (!HEX.test(x.brand?.[key] ?? "")) errors.push(`brand.${key}: use a hex colour like #0f766e`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, answers: x };
}

/**
 * Fills every start question the owner left out. The industry is required; everything else has a suggestion.
 * @param {{ industry: string } & Record<string, unknown>} partial
 */
export function suggestDefaults(partial) {
  const country = typeof partial.country === "string" ? partial.country.toUpperCase() : "PK";
  const market = MARKETS[country] ?? FALLBACK;
  const appName = partial.appName ?? `${titleCase(partial.industry)}Desk`;
  return {
    industry: partial.industry,
    appName,
    slug: partial.slug ?? slugify(appName),
    country,
    locales: partial.locales ?? market.locales,
    currency: partial.currency ?? market.currency,
    brand: partial.brand ?? DEFAULT_BRAND,
  };
}
