---
name: sync-back
description: Move generic improvements from a CRM built with the CRM kit back into the kit (new UI components, coding-standard and lint changes, script fixes), so the next CRM starts with them. Bumps the kit version and writes the changelog. Use when a CRM produced something reusable, or when the standards step approved a rule change.
---

# Sync back

Run from inside a CRM made with the kit (it has `.crm-kit.json`).

**Write to the owner's git checkout of the kit, never to the installed plugin.** An installed plugin lives in Claude Code's cache (`~/.claude/plugins/...`), which is replaced on every update. Anything written there is lost and can't be committed. Find the checkout:

- If `CRM_KIT_DIR` is set, use it.
- Otherwise ask the owner where it is, suggesting `~/crm-kit`.
- If there is none, offer to clone it with `git clone https://github.com/AbdulSubhan1/crm-kit ~/crm-kit`. Ask first.

Below, `<kit>` means that checkout.

## 1. Find candidates

List what changed in the CRM since it started from the kit:

```bash
git log --oneline "$(git rev-list --max-parents=0 HEAD)"..HEAD
git diff --stat "$(git rev-list --max-parents=0 HEAD)" -- components/ui AGENTS.md eslint.config.mjs scripts components/layout lib
```

Candidates are:

- **New or improved UI components** in `components/ui/`, with their registry entries and demos.
- **Coding-standard changes** in `AGENTS.md` and `eslint.config.mjs`, usually from the `standards` step.
- **Fixes to shared scripts and helpers**: `scripts/`, `lib/`, `components/layout/`.

Anything about this business (its records, statuses, roles, wording) stays in the CRM. So do its own settings: `constants/market.ts`, `messages/`, `package.json` and `.crm-kit.json`. The script refuses those.

## 2. Ask the owner

Show the candidates in the format of `references/question-format.md`:

- what each file is;
- why it looks generic or not;
- your recommendation.

Group them: "send to the kit" and "keep here". Wait for the owner's go.

## 3. Copy

```bash
node <kit>/scripts/sync-back.mjs --kit <kit> --crm . --bump minor --note "<one line for the changelog>" <file> <file> ...
```

Use `--bump patch` for fixes, `minor` for new components or rules, and `major` only for changes that break existing CRMs.

The script refuses:

- the plugin cache and anything that isn't a git checkout;
- the CRM's own settings;
- missing paths and folders;
- paths outside the CRM;
- files whose **new** lines (compared with the kit's copy of the file) contain a business word: the CRM's industry, its module names from `constants/permissions.ts`, `BUSINESS_WORDS`, or old names like `pd_…`.

It decides every file before copying any.

Read its `skipped` list. If a refused file is really generic (for example the word appears in a demo), take the business word out of the file in the CRM first, then sync again.

A new component needs its registry entry and demos too. Copy them by hand into the kit's `template/components/ui/registry.ts` and `template/components/design-system/demos/<category>.tsx`, using generic sample text from `messages` → `samples`.

## 4. Check the kit

In the kit:

1. `cd template && npm run ui:usage && npm run check` must pass.
2. `npm run check` at the kit root (kit self-check) must report nothing.
3. Commit on a branch: `feat: <note> (from <crm name>)`.
4. Offer to push. Never push without the owner's go.
