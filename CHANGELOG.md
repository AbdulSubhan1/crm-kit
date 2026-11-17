# Changelog

## 0.2.0

UX and security work from PolicyDesk, synced back.

- **DataTable:** whole rows can be links, columns hide by `priority` when the table is narrow, rows become stacked cards on phones (`mobile="rows"` with `summary`), filters can be tabs with counts, `refine` adds dropdown and on/off filters, and `numeric` columns line up their digits.
- **New components:** `TableFilters` (used by DataTable's `refine`) and `PriceBreakdown` (a price line by line, with the total).
- **New props:**
  - Field: `optional` and `tag`.
  - ListRow: `href`.
  - PageHeader: `badges`.
  - Panel: `collapsible` and `summary`, so it folds on phones.
  - PillNav: `variant="segment"`.
  - Progress: `tone`.
  - RadioGroup: `variant="pills"`, `inputProps`, `invalid` and `error`.
  - Stat: `hint`, `delta`, `badge` and `action`.
  - Tabs: counts shown as chips.
  - Alert: `className`.
- **Colours:** darker `muted` and `warn` tokens, which pass WCAG AA contrast.
- **Time zone:** `TIME_ZONE` in `constants/market.ts`, filled from the country (a new `timeZone` start answer, optional). `shortDate` and `dateTime` format in it, so dates no longer follow the server's UTC clock.
- **Login protection:** `server/login-guard.ts` blocks an address after 10 failed logins in 15 minutes and shows one message for every wrong login. `server/monitor.ts` reports login events to a monitor such as Pulse when `MONITOR_URL` and `MONITOR_LOG_TOKEN` are set.
- Registry entries, demos and `usage.json` for all of the above. The kit tests read the version from `plugin.json` instead of hard-coding it.

## 0.1.0

- First version, extracted from PolicyDesk: business-free template, market settings, module pattern (Contacts), the seven skills, `create`, `configure`, `sync-back` and the kit self-check.
