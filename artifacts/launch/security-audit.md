# Sayward dependency audit

Captured on August 22, 2026.

## Production result

Command run from the repository root:

```text
npm audit --omit=dev --json
```

Result after upgrading Next.js from 16.2.6 to 16.3.2:

```text
info: 0
low: 0
moderate: 0
high: 0
critical: 0
total: 0
```

## Why the upgrade was required

The initial audit reported four affected production packages, including a directly pinned
Next.js version with current security advisories. The narrow patched upgrade removed every
known production finding in the npm audit database used for this run.

## Limits

- An npm audit is a package-advisory check, not a penetration test.
- The app has no application API, database, user account, or secret Stripe key.
- Payment entitlement is intentionally browser-local and can be bypassed by a technical user.
- The paid link and successful return still require live end-to-end verification after Stripe
  account verification.
