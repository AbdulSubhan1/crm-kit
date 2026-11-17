---
name: new-crm
description: Start a new CRM for any industry from the CRM kit. Asks six start questions (suggesting answers for any skipped), creates the project from the kit's template, then runs the research, standards, build and test steps in order, stopping for the owner's go-ahead after each. Use when someone says "use the CRM kit", "build a CRM for <industry>" or "start a new CRM".
---

# New CRM

You are starting a new CRM with the CRM kit. The kit's template is a working, business-free app with the full UI library, coding standard, access control, audit log, i18n, knowledge base and tests. Everything business-specific comes from research the owner approves.

The kit's folder is the plugin root (two levels above this file). Scripts live in `scripts/`, references in `references/`.

## 1. Ask the six start questions

Ask them in one message, numbered:

1. Industry (required)
2. App name
3. Country or countries
4. Languages
5. Currency
6. Brand colour

For each question the owner skips or answers "you decide", suggest a value with a one-line reason, using `references/market-defaults.md`:

- **Industry:** never guess. If the owner is unsure, suggest 2–3 industries where a CRM clearly helps.
- **App name:** offer three short names.
- **Languages, currency and time zone:** follow from the country. Ask for the time zone only when the country has several (the US).
- **Brand colour:** offer 2–3 colours that suit the industry, shown as swatches.

Business questions (teams, roles, statuses, money rules) are **not** asked here. They come after research, in the format of `references/question-format.md`.

Confirm the final answers back in one short list, and wait for "go".

## 2. Create the project

1. Write the answers to a temp JSON file in this shape:

   ```json
   { "industry": "gym", "appName": "FitDesk", "slug": "fitdesk", "country": "PK", "locales": ["en", "ur"], "currency": "PKR", "timeZone": "Asia/Karachi", "brand": { "base": "#0f766e", "strong": "#115e59", "soft": "#ccfbf1" } }
   ```

2. Run `node <kit>/scripts/create.mjs --dest ~/<slug> --answers <file>`. It refuses a folder that already exists and isn't empty: ask the owner for another name instead of deleting anything.
3. In the new project:
   - Translate every new `messages/<locale>.json` from English. The keys stay the same; only the values change, and ICU placeholders like `{name}` stay as they are.
   - Run `npm install`, `npm run db:setup` and `npm run check`. All must pass before you continue.
4. Report: the folder, the commit, and how to run it (`npm run dev`, sign in as Admin).

**Never create a GitHub repository or a Vercel project without asking first.** Both are public actions.

## 3. Run the steps, one at a time

Run each step's skill. After each one, stop with a short summary and links to what it produced, and wait for the owner's "go":

1. `research-components`: which screens and components this industry needs, and building the missing ones.
2. `research-business`: the knowledge base, which is the requirements.
3. `standards`: check the coding standard against current official guidance.
4. `build-module`: the code, module by module.
5. `test`: Playwright tests for each role and journey.

If the owner asks to change something from an earlier step, go back to that step's skill, update its output, and carry the change forward.

## 4. Afterwards

When the CRM produced something generally useful (a component, a better rule, a script fix), offer to run `sync-back` so the next CRM gets it too.
