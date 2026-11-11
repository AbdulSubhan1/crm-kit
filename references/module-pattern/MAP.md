# Module pattern: Contacts

One complete module, built and tested inside the template, then moved here. `build-module` copies it for each business module and renames it. It passed `npm run check` and its own four Playwright tests before it was moved.

## What it shows

| Concern | Where |
| --- | --- |
| Table with an internal `id`, a `public_id` UUID for links, a human `reference` (`CON-J2M3HX7`), and scope columns (`team_id`, `owner_id`) | `edits.patch` → `server/db/schema.ts` |
| Permissions `<area>:view_all \| view_team \| view_own \| create \| edit` | `edits.patch` → `constants/permissions.ts` |
| Sidebar item shown to anyone with a view permission | `edits.patch` → `constants/navigation.ts` |
| Messages: the module's namespace, `nav.<area>`, `permissions.*`, `permissionGroups.<area>` (English) | `messages.json`, merged into every `messages/<locale>.json` |
| Demo rows and their audit entries | `edits.patch` → `scripts/setup-db.ts` |
| Reference generator | `files/lib/reference.ts` (copy once; later modules reuse it with their own code) |
| Zod schema built only from `schemas/fields.ts` | `files/schemas/contact.ts` |
| Queries with `rowScope`, search by name/email/reference, `getContact(user, id \| uuid)`, a cached timeline | `files/server/queries/contacts.ts` |
| Guard: permission + scoped load for one-click actions | `files/server/guards.ts` (later modules add their guard to this file) |
| Form action returning `ActionResult` + redirect; one-click action with guard, audit, revalidate | `files/server/actions/contacts.ts` |
| React Hook Form via `useActionForm`, PhoneInput in `Field group` | `files/components/forms/contact-form.tsx` |
| List page: DataTable with search and pagination, Avatar, create button by permission; list skeleton | `files/app/(app)/contacts/(list)/` |
| Create page | `files/app/(app)/contacts/new/page.tsx` |
| Detail: UUID link, `layout.tsx` access check (real 404), DetailList, note form, Timeline from the audit log | `files/app/(app)/contacts/[id]/` |
| Tests: create + list, UUID link + timeline, note on timeline, 404 for unknown and numeric ids | `files/e2e/contacts.spec.ts` |

## How to use it for a new module

Example: the knowledge base defines **members** for a gym, with the short code `MEM`.

1. Copy `files/` into the project, renaming `contact` → `member`, `contacts` → `members`, `Contact` → `Member`, `CON` → `MEM`. Rename the folders too (`app/(app)/members/...`).
2. From the project root, run `git apply <kit>/references/module-pattern/edits.patch` (where `<kit>` is the folder containing `.claude-plugin/`), then rename the same way. It touches no message files, so it applies to every market. If it doesn't apply cleanly because the project has changed, make the same edits by hand: the patch shows exactly what each file gains.
3. Replace the example fields (`name`, `email`, `phone`, `notes`) with the fields the knowledge base's data model lists. Keep `publicId`, `reference`, the scope columns and the timestamps.
4. Merge `messages.json` into every `messages/<locale>.json`, renamed, and translate the values for each non-English locale. Keys stay the same, and ICU placeholders like `{name}` stay as they are.
5. Add the module's nav label to the expected list in `e2e/01-access.spec.ts`.
6. Regenerate the migration (`npm run db:generate`), reset the local data (`npm run db:setup -- --reset`), then run `npm run check` and the module's spec.

## Gotchas met while building it

- After removing or renaming routes, delete `.next/` before `npm run check`. Otherwise stale generated route types fail the type check.
- A list route may have `loading.tsx`; a detail route must not stream before its access check. That is why the check lives in `[id]/layout.tsx`: a `notFound()` after streaming starts is sent with status 200.
- Playwright selectors for "the first row" must skip the "New …" button link (see `firstContact` in the spec).
