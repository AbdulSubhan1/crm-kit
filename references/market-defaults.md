# Market defaults

`new-crm` asks six start questions. When the owner skips one or says "you decide", it suggests the value below and gives the reason in one line. The same table lives in code in `scripts/lib/answers.mjs` (`MARKETS`, `DEFAULT_BRAND`, `suggestDefaults`); change both together.

| Question     | Suggestion                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| Industry     | Required. If the owner is unsure, suggest 2–3 industries where a CRM clearly helps, one line each             |
| App name     | `<Industry>Desk` plus two more short names that fit the industry, e.g. for a gym: FitDesk, ClubRoster, GymLog |
| Country      | From the conversation or the owner's location                                                                 |
| Languages    | From the country (table below)                                                                                |
| Currency     | From the country (table below)                                                                                |
| Time zone    | From the country (table below); not asked unless the country spans several zones                              |
| Brand colour | Teal `#0f766e` / `#115e59` / `#ccfbf1` by default; offer 2–3 that suit the industry, shown as swatches        |

| Country | Languages | Currency | Time zone                          |
| ------- | --------- | -------- | ---------------------------------- |
| PK      | en, ur    | PKR      | Asia/Karachi                       |
| AE      | en, ar    | AED      | Asia/Dubai                         |
| SA      | en, ar    | SAR      | Asia/Riyadh                        |
| QA      | en, ar    | QAR      | Asia/Qatar                         |
| KW      | en, ar    | KWD      | Asia/Kuwait                        |
| BH      | en, ar    | BHD      | Asia/Bahrain                       |
| OM      | en, ar    | OMR      | Asia/Muscat                        |
| IN      | en, hi    | INR      | Asia/Kolkata                       |
| GB      | en        | GBP      | Europe/London                      |
| US      | en        | USD      | America/New_York (ask: many zones) |
| other   | en        | USD      | UTC                                |

## Brand colours

A brand colour has three shades: `base` for buttons and links, `strong` for hover and text on soft backgrounds, `soft` for tinted backgrounds. Check that white text on `base` and `strong` text on `soft` reach WCAG AA contrast (4.5:1).

## Right-to-left languages

`ar`, `ur`, `fa`, `he`, `ps` and `sd` switch the layout to right-to-left (`RTL` in `scripts/configure.mjs`). The template's Arabic font (IBM Plex Sans Arabic) also covers Urdu and Persian. A language in another script needs its font added in `app/layout.tsx`.

## Phone numbers

The country must be in `template/constants/countries.ts` (dialling code and number lengths). `configure` refuses a country that isn't, so add it there first.
