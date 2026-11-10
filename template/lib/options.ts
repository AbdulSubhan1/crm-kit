import type { AutocompleteOption } from "@/components/ui";

type Translate = (key: string) => string;

/** Option lists for Autocomplete, built once here so every form shows the same labels and grouping. */

/** Values whose labels live under one messages section, e.g. ("status", MEMBER_STATUSES). */
export function keyedOptions(t: Translate, section: string, values: readonly string[]): AutocompleteOption[] {
  return values.map((v) => ({ value: v, label: t(`${section}.${v}`) }));
}

/** Free-text values that are their own label, e.g. nationalities. */
export function plainOptions(values: readonly string[]): AutocompleteOption[] {
  return values.map((v) => ({ value: v, label: v }));
}
