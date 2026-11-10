# Quality and testing

## Commands

| Command               | What it does                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| `npm run check`       | Type check, ESLint (including the UI library rules), Prettier check, UI registry and usage check |
| `npm run format`      | Formats every file with Prettier, including Tailwind class order                                 |
| `npm run ui:usage`    | Regenerates `components/ui/usage.json`                                                           |
| `npm run test:e2e`    | Runs the Playwright tests against a fresh local database                                         |
| `npm run test:e2e:ui` | The same tests in Playwright's interactive UI                                                    |

## End-to-end tests

The tests are in `e2e/` and cover:

- **Platform:** the admin signs in and sees only platform navigation, the dashboard empty state, the audit log, and a real 404 for an unknown page.
- **Each module:** its role access, scope (another person's record is a 404) and main journeys, added by the module.
- **Component library:** every component's page renders, and the interactive ones (menus, dialogs, date picker, multi-select…) work.

The whole suite grows with every module, so it is **on demand only**: nothing runs it automatically. Day to day, run `npm run check` and only the tests for what you changed:

```bash
npx playwright install chromium                                  # once
npm run test:e2e -- e2e/02-journey.spec.ts                       # one file
npm run test:e2e -- e2e/04-ui-library.spec.ts --grep DatePicker  # matching tests only
npm run test:e2e                                                 # everything, before a release
```

They can also run from GitHub: **Actions → E2E tests → Run workflow**.

## Pull requests

Every PR runs two jobs:

1. **Checks:** `npm run check` and `npm run build`. The PR cannot merge if they fail.
2. **Review:** an AI reviewer reads the diff against `AGENTS.md` and comments on any rule it breaks. It needs the `ANTHROPIC_API_KEY` repository secret.
