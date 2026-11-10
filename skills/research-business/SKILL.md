---
name: research-business
description: CRM kit step 2. Research how the industry runs in the CRM's country (roles, records, journeys, statuses, money, local rules) and write the knowledge base in docs/, which is the requirements. Decides what the research settles, asks the owner only the rest. Use after research-components, or when the business rules of a CRM need to be (re)defined.
---

# Research the business

**Input:** the industry, country and languages (`.crm-kit.json`), and `docs/research/components.md`.
**Output:** the knowledge base in `docs/`, in the format of `references/kb-format.md`.
**Stops:** after the knowledge base is written, for the owner's approval. Nothing is coded in this step.

## 1. Research

Find how businesses in this industry and country actually run, with sources, using:

- operator guides, software help centres, industry associations;
- the country's rules (tax, receipts, data protection, sector rules);
- what the leading products track (already found in the components step).

Cover:

1. The people and their daily jobs, which become the roles.
2. The records they keep and their fields, which become the data model.
3. The journeys from first contact to repeat business, with each record's statuses, which become the workflows.
4. Money: prices, plans, discounts, payments, refunds, receipts and currency.
5. Recurring work: renewals, expiries, reminders.
6. Whether the business works in teams or branches, and who sees whose records.
7. Local rules that affect the app.

## 2. Decide, then ask

- What the research settles with confidence becomes a decision, with its source, in a **"Calls I made"** list.
- What it can't settle, or what is the owner's own choice (pricing rules, approval steps, whether to have branches), is asked in the format of `references/question-format.md`. That means one message, most important first, each with a recommendation.

## 3. Write the knowledge base

Fill the template's `docs/` pages and add the sources page, following `references/kb-format.md`:

- start-here training guide
- overview
- roles and access
- workflows with Mermaid diagrams
- data model with reference codes
- sources

Name each module that `build-module` will build, in order, in the overview. Run `npm run check` (Prettier formats the Markdown).

Stop. Summarise the roles, modules and the decisions to check, with a link to `/kb` and to each page. Wait for approval. The approved knowledge base is the contract for the code.
