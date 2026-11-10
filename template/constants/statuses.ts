import type { BadgeTone } from "@/components/ui";

// The colour of every status value in the app; Badge reads it. Labels come from messages ("status.<value>").
// Each module adds its own statuses here, e.g. a membership's "active", "frozen", "expired".
export const STATUS_TONE: Record<string, BadgeTone> = {
  active: "green",
  inactive: "grey",
};
