---
name: test
description: CRM kit step 5. Write Playwright tests for each role's access and each main journey in the CRM's knowledge base, run only the new specs while working and the full suite once at the end, then report. Use after build-module, or when a CRM's tests need to cover a new journey.
---

# Test

**Input:** the knowledge base's roles and workflows, and the built modules.
**Output:** specs in `e2e/`, all passing, and a short report.
**Stops:** after the full run, with the results.

## Specs to write

1. **`e2e/01-access.spec.ts`** (extend the template's spec):
   - each demo role signs in and sees exactly its sidebar items;
   - a page outside the role shows "You don't have access to this page".
2. **Scope:** for each scoped area, a person with own- or team-scope gets a real **404** (status, not just the screen) on someone else's record.
3. **One spec per journey** in `docs/03-workflows.md`:
   - walk a record from its first to its last status, switching roles with `loginAs` the way real people hand work over;
   - check each status change and the record's timeline.
4. **Language:** switching to the second language turns the layout right-to-left where the language is RTL.
5. Keep `e2e/04-ui-library.spec.ts` green; it already covers every component page.

## How

- Use the helpers in `e2e/helpers.ts`: `loginAs`, `sidebar`, `pick` for Autocomplete, `pickDate` for DatePicker. Add a role to `ROLES` for each demo role.
- Use stable selectors: roles and labels, UUID URL patterns `/[0-9a-f-]{36}/`, references by their code pattern.
- Give redirects to a page the dev server may still be compiling a longer timeout (20 s).

## Running

- **While writing:** run only the spec you are on, `npm run test:e2e -- e2e/<spec>.spec.ts`. The full suite is slow; never run it after every change.
- **At the end:** run the full suite once (`npm run test:e2e`), in the background, with the output redirected to a file. Then read the summary.

Report:

- passed and failed counts;
- for each failure, the cause and whether it's the test or the app;
- any journey the knowledge base describes that no test covers.

Fix app bugs with a failing test first.
