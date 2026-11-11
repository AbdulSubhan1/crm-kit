---
name: standards
description: CRM kit step 3. Check the CRM's coding standard (AGENTS.md and the lint rules) against current official guidance for Next.js, React, security and accessibility, propose changes with sources, and after approval apply them to the CRM and send them back to the kit. Use before writing a CRM's code, or when the standard needs a review.
---

# Check the coding standard

**Input:** the CRM's `AGENTS.md`, `eslint.config.mjs`, `package.json`, and `references/standards-sources.md`.
**Output:** an approved diff applied to the CRM, and the same change in the kit.
**Stops:** after proposing the diff.

## 1. Decide the depth

Read "Last full review" in `references/standards-sources.md`:

- **Done for the current kit version:** check only what changed since that date. Look at release notes and security advisories for Next.js, React and the main dependencies, and run `npm audit --omit=dev`.
- **Not done:** do a full review against every source in the table.

## 2. Compare

For each source, find rules that are:

- **missing**, for example a new security header or an accessibility requirement;
- **out of date**, for example an API that changed;
- **contradicting** current guidance.

Check dependency versions for advisories too; an upgrade counts as a standard change.

## 3. Propose

Write the proposal in one message:

- each change as a small diff to `AGENTS.md`, `eslint.config.mjs` or `package.json`;
- why, with the source link;
- what it costs to adopt.

Keep the standard ours: add or tighten rules, but don't import a generic style guide. Stop for approval.

## 4. Apply

1. Apply the approved changes in the CRM.
2. Run `npm run check` and the targeted tests the change affects.
3. Commit (`chore(standards): <what>`).
4. Run `sync-back` for the same files, so the kit's template gets the change. It writes to the owner's git checkout of the kit (see the `sync-back` skill), never to the installed plugin.
5. In that checkout, update "Last full review" in `references/standards-sources.md`, and commit it with the synced files.
