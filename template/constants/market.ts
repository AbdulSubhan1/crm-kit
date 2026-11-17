// The market this CRM serves. The CRM kit's configure script writes this file from the start answers;
// everything that depends on the market (languages, direction, phone numbers, money, dates) reads it from here.

export const APP_NAME = "CRM";

/** English first, then the market's languages. */
export const LOCALES = ["en", "ar"] as const;
export const DEFAULT_LOCALE = "en";
export const RTL_LOCALES: readonly string[] = ["ar"];
export const LOCALE_NAMES: Record<(typeof LOCALES)[number], string> = { en: "English", ar: "العربية" };

/** ISO 3166-1 country for phone numbers. */
export const DEFAULT_COUNTRY = "AE";

/** ISO 4217 currency for money. */
export const CURRENCY = "USD";

/** IANA time zone every date is shown in, whatever the server's own zone. */
export const TIME_ZONE = "Asia/Dubai";
