import { CURRENCY, TIME_ZONE } from "@/constants/market";

export function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(
    amount,
  );
}

// In the market's zone: on Vercel the server runs in UTC, so a late-evening date would otherwise show the next day
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});
const DATE_TIME = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: TIME_ZONE });

export function shortDate(value: Date | string) {
  return SHORT_DATE.format(new Date(value));
}

export function dateTime(value: Date | string) {
  return DATE_TIME.format(new Date(value));
}

/** Turns a stored value like "needs_analysis" into "Needs analysis". */
export function label(value: string) {
  const text = value.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
