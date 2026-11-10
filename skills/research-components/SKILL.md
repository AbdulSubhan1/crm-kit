---
name: research-components
description: CRM kit step 1. Research the industry's leading products and good UI libraries, list the screens and components the CRM needs, compare them with the UI library, and after approval build the missing components to the library's standard. Use after new-crm creates the project, or when a CRM needs new UI components.
---

# Research components

**Input:** a CRM made with the kit, and its industry (from `.crm-kit.json`).
**Output:** `docs/research/components.md`, then the new components in `components/ui/`.
**Stops:** twice, once after the research and once after building.

## 1. Research

Follow `references/component-research.md`:

1. Study 3–5 leading products in the industry (behaviour only, with links).
2. Study component behaviour on good UI libraries in the browser: shadcn.io and similar. Click through each variant, the keyboard, phone width and RTL.
3. Read `components/ui/registry.ts` and decide for each needed component whether it is covered or new.

Write `docs/research/components.md`:

- the screens table;
- the new components with their variants and keys;
- a short **"Calls I made"** list.

Stop, summarise in a few lines with the link, and wait for "go". Ask only what the research couldn't settle, in the format of `references/question-format.md`.

## 2. Build

For each approved new component, follow `references/component-checklist.md` step by step:

- file, export, registry entry, demos, test, `ui:usage`;
- then `npm run check`, and the component's own test only.

Commit each component on its own (`feat(ui): <Name>`). Stop with a list of what was added and a link to each component's page (`/design-system/<Name>`).

A component that would help any CRM is a candidate for `sync-back`. Mention it in the summary.
