import {
  LIVE_PRICE_ID,
  STRIPE_API_VERSION,
  isPaidSaywardSession,
  type StripeCheckoutSession,
} from "../../commerce-server";

const noStoreHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id")?.trim() ?? "";

  if (!/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId)) {
    return Response.json(
      { ok: false, error: "invalid_session_id" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    return Response.json(
      { ok: false, error: "purchase_verification_unavailable" },
      { status: 503, headers: noStoreHeaders },
    );
  }

  const stripeUrl = new URL(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
  );
  stripeUrl.searchParams.append("expand[]", "line_items");

  const stripeResponse = await fetch(stripeUrl, {
    headers: {
      Authorization: `Basic ${btoa(`${stripeSecretKey}:`)}`,
      "Stripe-Version": STRIPE_API_VERSION,
    },
  });

  if (!stripeResponse.ok) {
    console.error(
      JSON.stringify({
        event: "sayward.purchase_verification_failed",
        status: stripeResponse.status,
      }),
    );
    return Response.json(
      { ok: false, error: "purchase_not_verified" },
      { status: 402, headers: noStoreHeaders },
    );
  }

  const session = (await stripeResponse.json()) as StripeCheckoutSession;
  const expectedPriceId =
    process.env.STRIPE_EXPECTED_PRICE_ID?.trim() || LIVE_PRICE_ID;
  const ok = isPaidSaywardSession(session, expectedPriceId);

  return Response.json(
    ok ? { ok: true } : { ok: false, error: "purchase_not_verified" },
    { status: ok ? 200 : 402, headers: noStoreHeaders },
  );
}
