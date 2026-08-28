# Same-day machine revenue distribution plan

## Product surface

- Paid endpoint: `POST https://sayward.bmparent.chatgpt.site/api/v1/plan`
- Price: $0.50 per complete plan.
- Protocol: Machine Payments Protocol with Stripe.
- Discovery: `/api/v1`, `/api/v1/openapi.json`, `/llms.txt`, and `/agents`.

## Launch sequence

1. Create or connect an owner-controlled Tempo receiving address; do not discard or expose its
   recovery credential.
2. Configure the receiving address and a new high-entropy MPP signing secret in Sites.
3. Optionally create a least-privilege live Stripe key if the account has Shared Payment Token
   access, then configure it for Checkout Session reads and MPP Stripe charges.
4. Change the existing Payment Link return URL to use `{CHECKOUT_SESSION_ID}`.
5. Commit and push the exact validated source, package it, save a Sites version, and deploy it.
6. Verify the live discovery documents, fail-closed input behavior, and valid HTTP 402 challenge.
7. Register the live endpoint with MPPScan/service discovery.
8. Submit the service to the curated MPP catalog only after it satisfies the catalog's live-service
   requirements.
9. Check the relevant provider/chain receipt for an actual external settlement. Report zero honestly if none
   appears.

## Boundaries

- Do not self-pay to manufacture revenue evidence.
- Do not call a challenge, checkout visit, or simulated unlock a sale.
- Do not post from a personal social account without action-time approval.
- Do not log request bodies, payment-card data, or secret values.

## Viability limit

This removes the need for an operator or human customer to interact with Sayward's web UI, but it
cannot remove the need for a real external buyer. Revenue is possible only after production payment
configuration, discovery, and demand meet.
