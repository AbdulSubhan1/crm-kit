---
name: build-module
description: CRM kit step 4. Build the CRM's business modules from its approved knowledge base, one module at a time, by copying and renaming the kit's module pattern and following AGENTS.md exactly; npm run check must pass after each module. Use after the knowledge base and standard are approved, or to add a module to an existing CRM.
---

# Build modules

**Input:** the approved knowledge base in `docs/` (modules, data model, roles, workflows) and `AGENTS.md`.
**Output:** working modules, each in its own commit, and the dashboard and demo data.
**Stops:** after each module, with what was built and how to try it.

Read `AGENTS.md` before writing any code. It is the standard; this skill does not repeat it.

## For each module, in the order the overview lists

1. **Copy the pattern:** follow `references/module-pattern/MAP.md`.
   - Copy `references/module-pattern/files/` and apply `references/module-pattern/edits.patch`.
   - Rename contact/contacts/CON to the module's names and reference code.
2. **Shape it to the knowledge base**, in this order:
   1. `constants/` for statuses (`constants/statuses.ts` with their tones) and options;
   2. the table in `server/db/schema.ts`, then `npm run db:generate`;
   3. the Zod schema from `schemas/fields.ts` only;
   4. queries with `rowScope`;
   5. server actions with a guard and an audit entry;
   6. pages and feature components from the UI library only;
   7. messages in **every** locale;
   8. seed rows in `scripts/setup-db.ts`;
   9. the roles and their permissions in `constants/demo.ts`, from the knowledge base's roles;
   10. the sidebar item.
3. **Teams:** use the team scope only if the knowledge base says the business has teams. Then add the teams admin page and team names to the seed, and translate what the business calls a team.
4. **Check:**
   - `rm -rf .next && npm run db:setup -- --reset && npm run check`. It must pass.
   - The module's own spec: `npm run test:e2e -- e2e/<module>.spec.ts`.
5. **Commit** `feat(<module>): <what>`. Stop with a short summary and the page to open.

## After the last module

- **Dashboard:** replace the empty state with the tiles and panels the knowledge base asks for (Stat with NumberTicker, lists, a renewals-style "coming up" panel).
- **Training guide:** check that the practice run in `docs/00-start-here.md` matches the real screens, and update it if not.
- **Run** `npm run ui:usage` and `npm run check`.

If the knowledge base turns out to be missing something, stop and ask the owner. Then update the knowledge base, not just the code.
