# Standards sources

The `standards` step checks the CRM's `AGENTS.md` against these. Read the current version of each, compare, and propose changes with links.

| Area | Source |
| --- | --- |
| Next.js App Router: data fetching, server actions, caching, `params`, security | https://nextjs.org/docs |
| React: rules of React, hooks, server components | https://react.dev/reference/rules |
| Security: authentication, session management, access control, file upload | OWASP ASVS 4.0.3: https://owasp.org/www-project-application-security-verification-standard/ |
| Accessibility | WCAG 2.2 AA: https://www.w3.org/TR/WCAG22/ and the WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/ |
| Dependencies | `npm audit --omit=dev`, plus the Next.js and React security advisories |

## Last full review

- Kit version 0.1.0, 2026-11-11: the standard as inherited from the first CRM (PolicyDesk). It already includes:
  - the move to Next.js 15.5.29 and React 19.1.10 for CVE-2025-66478;
  - the rule that detail routes check access in `layout.tsx`, because a `loading.tsx` turns `notFound()` into a 200.

Update this section after every full review, so later CRMs only check what changed since.
