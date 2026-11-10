# Adding a component to the UI library

Every component follows the same steps, so the library stays one system. `npm run check` fails if any are missed.

1. **File:** `components/ui/<kebab-name>.tsx`, one exported component, `data-ui="<Name>"` on its root element.
2. **Rules:** classes only (no `style`), library components inside it rather than raw elements where one exists, RTL-safe classes (`ms-`, `ps-`, `start-`), `min-w-0` on text containers, mobile-first breakpoints. `"use client"` only if it needs state, effects or browser APIs.
3. **Text:** no hard-coded words; labels come in as props or from `messages` (`common.*`), in every locale.
4. **Accessibility:** the right role and labels, full keyboard support, a visible focus ring, and reduced motion respected.
5. **Export** it from `components/ui/index.ts`.
6. **Registry:** an entry in `components/ui/registry.ts` with name, file, category (`UI_GROUPS`), description, props, an example and keyboard keys.
7. **Demos:** named demos in `components/design-system/demos/<category>.tsx`, using generic sample text from `messages` → `samples` and `components/design-system/samples.ts`. Never business data.
8. **Test:** if it has behaviour (opens, filters, moves focus), add a test in `e2e/04-ui-library.spec.ts`.
9. **Usage map:** run `npm run ui:usage`.
10. **Check:** run `npm run check`, then only the new test: `npm run test:e2e -- e2e/04-ui-library.spec.ts --grep <Name>`.

Effects (MotionHighlight, SpotlightCard) are the only components that set CSS variables from JavaScript (`el.style.setProperty`), never a `style` attribute.
