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

- Kit version 0.2.1, 2026-11-17 (a check of what changed since 0.1.0, from AgencyDesk):
  - Next.js 15.5.29 and React 19.1.10 already carry the November 2026 security release ([Next.js](https://nextjs.org/blog/november-2026-security-release)).
  - `npm audit --omit=dev` flagged PostCSS 8.4.31 bundled inside Next.js 15 (4 advisories, 2 high, e.g. [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q)) and KaTeX under Mermaid (1 low, [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7)). `overrides` in `template/package.json` pin the patched versions.
  - To plan: Next.js 15 reportedly gets security fixes until 31 January 2027 ([third-party report](https://www.buildmvpfast.com/blog/nextjs-november-2026-security-release-cache-leak)). Move the template to Next.js 16 before then.

Update this section after every full review, so later CRMs only check what changed since.
