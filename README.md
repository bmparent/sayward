# Sayward

Sayward sells deterministic difficult-conversation plans through two surfaces:

- A browser product with a free opening and a $3 one-time Stripe checkout for the full plan.
- A machine-payable HTTP API that charges $0.50 per complete plan through Machine Payments
  Protocol (MPP), with Tempo as the open-network path and Stripe as an optional agent-payment path.

The browser engine remains local. The API processes one validated request in memory and returns the
same deterministic plan with an MPP payment receipt.

**Live product:** [sayward.bmparent.chatgpt.site](https://sayward.bmparent.chatgpt.site)

## Run from the repository root

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` for local payment-path development. Never put Stripe or MPP
secrets in a `NEXT_PUBLIC_` variable or commit them.

## Browser checkout

The browser sends customers to the existing Stripe Payment Link. Its post-payment redirect must be:

```text
https://sayward.bmparent.chatgpt.site/?session_id={CHECKOUT_SESSION_ID}
```

Sayward then retrieves that Checkout Session server-side and unlocks only when it is complete,
paid, and contains `STRIPE_EXPECTED_PRICE_ID`. The browser stores only a local access flag. Keep
`NEXT_PUBLIC_BROWSER_CHECKOUT_ENABLED=false` until the Stripe verifier and redirect are both live;
the UI then routes visitors to the working machine-payable API instead of accepting an
undeliverable browser payment.

## Machine-payable API

Discovery endpoints:

- `GET /api/v1`
- `GET /openapi.json` (canonical registry document)
- `GET /api/v1/openapi.json`
- `GET /llms.txt`
- `GET /agents`

Paid endpoint:

```http
POST /api/v1/plan
Content-Type: application/json

{
  "scenario": "boundary",
  "tone": "firm",
  "person": "My manager",
  "happened": "Extra work has become the default.",
  "need": "Reset priorities and ownership."
}
```

Valid unpaid requests receive an HTTP 402 MPP challenge for $0.50. A successful paid retry returns
the plan and a `Payment-Receipt` header. Invalid input is rejected before payment. The live
discovery document lists only the payment methods that are actually configured.

Required server-only production variables:

```text
STRIPE_SECRET_KEY=
STRIPE_EXPECTED_PRICE_ID=price_1U7M4lKC8pRG5Tr9p17AgSr0
STRIPE_NETWORK_ID=internal
NEXT_PUBLIC_BROWSER_CHECKOUT_ENABLED=false
MPP_SECRET_KEY=
MPP_REALM=sayward.bmparent.chatgpt.site
MPP_TEMPO_RECIPIENT=
MPP_TEMPO_TESTNET=false
```

`MPP_SECRET_KEY` must be a high-entropy secret of at least 32 bytes. `MPP_TEMPO_RECIPIENT` must be a
revenue-receiving address controlled by the owner. The Stripe key must have only the permissions
needed to read Checkout Sessions and create the payment objects required by the MPP Stripe method.
Stripe Shared Payment Tokens are a private preview, so Tempo is the non-preview fallback rather
than assuming the Stripe account has agent-payment access.

## Validation

```bash
npm run lint
npm test
```

The suite builds the production worker, exercises all 18 scenario/tone combinations, verifies the
paid-session rules, validates API input, renders the product and policy pages, tests discovery, and
confirms paid endpoints fail closed when secrets are absent.

## Privacy and limits

- Browser drafts are not sent to the application server.
- Agent API request bodies are processed server-side and should not contain secrets or highly
  sensitive information.
- Stripe handles payment-card data.
- The app does not promise a specific conversation outcome.
- Revenue is proven only by provider payment analytics, never by deployment or a simulated unlock.

## Deployment

The project is configured for ChatGPT Sites in `.openai/hosting.json`. Build and test from the
repository root, configure production secrets through the hosting environment, package the exact
validated output, then save and publicly deploy that version. Register the live API with compatible
MPP discovery services only after the production 402 response is verified.
