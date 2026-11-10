# Knowledge base format

The knowledge base is the requirements. It lives in the CRM's `docs/`, renders at `/kb` in the app, and is what `build-module` builds from. Pages are numbered so they sort; the first is the training guide.

| File | Holds |
| --- | --- |
| `00-start-here.md` | **Training guide** for someone who has never seen the app or the industry. It covers: what the app does; a glossary table of words they'll see; who does what (role, daily job, where they work); a table of screens; a practice run per role with a Mermaid sequence diagram; and "when something blocks you". |
| `01-overview.md` | The business in plain words, the main journey as a Mermaid flowchart, main ideas, and the record types. |
| `02-roles-and-access.md` | Keep the template's permission/scope explanation; add each role, what it can do, and the decided team structure. |
| `03-workflows.md` | One section per journey: a Mermaid state diagram of the statuses, what moves a record from one status to the next, and who may do it. |
| `04-data-model.md` | Keep the platform tables; add the business tables as a Mermaid ER diagram, each table's fields and their rules, and reference codes (e.g. `MEM` for members). |
| `09-sources.md` | Every source used, grouped by topic, with the date it was read. |
| `research/components.md` | From `research-components`. |

## Writing rules

- Plain words for someone new to the industry; explain every industry word in the glossary.
- "The system shall …" is not needed; describe what people do and what the app does.
- Every rule that came from research links its source. Every decision the owner made is marked "decided by the owner".
- Use the CRM's own names everywhere (Members, not Contacts).
- Add new strings to `messages/` only when the code is written, not in the knowledge base step.
