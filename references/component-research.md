# Component research

How the UI library was built for the first CRM, and how to grow it for each new industry. We study how good products behave and rebuild that behaviour ourselves. We never copy their code, styles or assets.

## 1. Study the industry's leading products

- Pick 3–5 well-known products for the industry (for gyms: Mindbody, Glofox, PushPress, Zen Planner).
- Use their public pages, demo videos, help centres and screenshots in reviews.
- For each product, note:
  - the main screens (front desk, schedule, member profile, billing, reports);
  - what is on each screen;
  - the components each screen needs: a weekly class calendar, a check-in scanner, a membership card, a payment schedule.
- Keep the source link for every claim.

## 2. Study good component libraries for behaviour

Open the component in a browser and use it: click, tab, use the arrow keys, Escape, resize to phone width, switch to RTL. The first CRM used shadcn.io for this. Write down:

- the named variants it offers (basic, with icons, with a submenu, sizes, disabled…);
- keyboard support (which keys do what);
- what happens on phones and in RTL;
- accessibility roles and labels (open the accessibility tree).

## 3. Compare with what the library has

Read `components/ui/registry.ts` in the CRM. For each needed component, decide:

- **covered:** an existing component does it, maybe with a new variant;
- **new:** build it.

## 4. Write it down

`docs/research/components.md` in the CRM:

| Screen | Component | Covered by / new | Why | Sources |
| --- | --- | --- | --- | --- |

Then a short list of new components, each with its variants and keyboard keys. Stop for the owner's go before building.
