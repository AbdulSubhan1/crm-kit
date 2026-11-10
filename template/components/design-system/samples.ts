import type { AutocompleteOption, BadgeTone } from "@/components/ui";

// Sample values for the component demos. They are not business data: labels are messages under "samples".

export const SAMPLE_STATUSES = ["new", "pending", "approved", "rejected"] as const;
export type SampleStatus = (typeof SAMPLE_STATUSES)[number] | "active" | "inactive" | "overdue" | "high";

export const SAMPLE_TONE: Record<SampleStatus, BadgeTone> = {
  new: "blue",
  pending: "amber",
  approved: "green",
  rejected: "red",
  active: "green",
  inactive: "grey",
  overdue: "red",
  high: "plum",
};

export const SAMPLE_PLANS = ["basic", "standard", "premium", "family", "student"] as const;

/** Cities grouped by country, for the Autocomplete demos. */
export const CITY_OPTIONS: AutocompleteOption[] = [
  { value: "karachi", label: "Karachi", group: "Pakistan" },
  { value: "lahore", label: "Lahore", group: "Pakistan" },
  { value: "islamabad", label: "Islamabad", group: "Pakistan" },
  { value: "dubai", label: "Dubai", group: "United Arab Emirates" },
  { value: "abu-dhabi", label: "Abu Dhabi", group: "United Arab Emirates" },
  { value: "sharjah", label: "Sharjah", group: "United Arab Emirates" },
  { value: "riyadh", label: "Riyadh", group: "Saudi Arabia" },
  { value: "jeddah", label: "Jeddah", group: "Saudi Arabia" },
];
