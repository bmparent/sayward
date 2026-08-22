# Sayward dependency audit

Captured on August 22, 2026.

## Final result

Command run from the repository root:

```text
npm audit --json
```

Result after upgrading the active framework/build stack and removing unused database starter
packages:

```text
info: 0
low: 0
moderate: 0
high: 0
critical: 0
total: 0
```

The production-only audit also reports zero known vulnerabilities.

## Why the refresh was required

The initial audit reported four affected production packages, including a directly pinned
Next.js version with current security advisories. The narrow patched upgrade removed every
known production finding in the npm audit database used for this run. A second pass upgraded
Vinext, Vite, Cloudflare's Vite plugin, Wrangler, React, and the React server bundle, then applied
safe transitive fixes. Unused Drizzle scaffolding was removed. The final full audit reports zero
known findings across installed production and development packages.

## Limits

- An npm audit is a package-advisory check, not a penetration test.
- The app has no application API, database, user account, or secret Stripe key.
- Payment entitlement is intentionally browser-local and can be bypassed by a technical user.
- The paid link and successful return still require live end-to-end verification after Stripe
  account verification.
