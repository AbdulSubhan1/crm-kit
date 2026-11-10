import { DEFAULT_LOCALE as DEFAULT, LOCALES } from "./market";

export { LOCALE_NAMES, LOCALES, RTL_LOCALES } from "./market";
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = DEFAULT;
export const LOCALE_COOKIE = "app_locale";

/** Text stored in the database in several languages. English is always present. */
export type Localized = { en: string } & Partial<Record<Locale, string>>;
