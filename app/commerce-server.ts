export const STRIPE_API_VERSION = "2026-02-25.clover";
export const LIVE_PRICE_ID = "price_1U7M4lKC8pRG5Tr9p17AgSr0";

type StripeLineItem = {
  price?: { id?: string | null } | null;
};

export type StripeCheckoutSession = {
  id?: string;
  livemode?: boolean;
  mode?: string | null;
  payment_status?: string | null;
  status?: string | null;
  line_items?: { data?: StripeLineItem[] } | null;
};

export function isPaidSaywardSession(
  session: StripeCheckoutSession,
  expectedPriceId = LIVE_PRICE_ID,
) {
  const lineItems = session.line_items?.data ?? [];

  return (
    /^cs_(?:live|test)_[A-Za-z0-9]+$/.test(session.id ?? "") &&
    session.mode === "payment" &&
    session.status === "complete" &&
    session.payment_status === "paid" &&
    lineItems.some((item) => item.price?.id === expectedPriceId)
  );
}
