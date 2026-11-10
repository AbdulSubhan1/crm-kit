import { useLocale, useTranslations } from "next-intl";
import { Button, Hidden, Icon } from "@/components/ui";
import { LOCALE_NAMES, LOCALES } from "@/constants/i18n";
import { setLocale } from "@/server/actions/auth";

/** Switches to the next language in LOCALES; the choice is kept in a cookie. */
export function LocaleSwitch() {
  const locale = useLocale();
  const t = useTranslations("common");
  const next = LOCALES[(LOCALES.indexOf(locale as (typeof LOCALES)[number]) + 1) % LOCALES.length];
  return (
    <form action={setLocale}>
      <Hidden name="locale" value={next} />
      <Button size="sm" variant="inverse" aria-label={t("language")}>
        <Icon name="globe" size={16} />
        <span lang={next}>{LOCALE_NAMES[next]}</span>
      </Button>
    </form>
  );
}
