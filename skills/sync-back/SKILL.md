---
name: sync-back
description: Move generic improvements from a CRM built with the CRM kit back into the kit (new UI components, coding-standard and lint changes, script fixes), so the next CRM starts with them. Bumps the kit version and writes the changelog. Use when a CRM produced something reusable, or when the standards step approved a rule change.
---

# Sync back

Run from inside a CRM made with the kit (it has `.crm-kit.json`). The kit's folder is the plugin root (two levels above this file).

## 1. Find candidates

List what changed in the CRM since it started from the kit:

```bash
git log --oneline "$(git rev-list --max-parents=0 HEAD)"..HEAD
git diff --stat "$(git rev-list --max-parents=0 HEAD)" -- components/ui AGENTS.md eslint.config.mjs scripts components/layout lib constants/market.ts
```

Candidates are:

- **New or improved UI components** in `components/ui/`, with their registry entries and demos.
- **Coding-standard changes** in `AGENTS.md` and `eslint.config.mjs`, usually from the `standards` step.
- **Fixes to shared scripts and helpers**: `scripts/`, `lib/`, `components/layout/`.

Anything about this business (its records, statuses, roles, wording) stays in the CRM.

## 2. Ask the owner

Show the candidates in the format of `references/question-format.md`:

- what each file is;
- why it looks generic or not;
- your recommendation.

Group them: "send to the kit" and "keep here". Wait for the owner's go.

## 3. Copy

```bash
node <kit>/scripts/sync-back.mjs --crm . --bump minor --note "<one line for the changelog>" <file> <file> ...
```

Use `--bump patch` for fixes, `minor` for new components or rules, and `major` only for changes that break existing CRMs.

The script refuses:

- any file containing a business word: the CRM's industry, its module names from `constants/permissions.ts`, or the words in `BUSINESS_WORDS`;
- any path outside the CRM.

Read its `skipped` list. If a refused file is really generic (for example the word appears in a demo), take the business word out of the file in the CRM first, then sync again.

A new component needs its registry entry and demos too. Copy them by hand into the kit's `template/components/ui/registry.ts` and `template/components/design-system/demos/<category>.tsx`, using generic sample text from `messages` → `samples`.

## 4. Check the kit

In the kit:

1. `cd template && npm run ui:usage && npm run check` must pass.
2. `npm run check` at the kit root (kit self-check) must report nothing.
3. Commit on a branch: `feat: <note> (from <crm name>)`.
4. Offer to push. Never push without the owner's go.
