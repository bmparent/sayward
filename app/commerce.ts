const LIVE_CHECKOUT_URL = "https://buy.stripe.com/5kQaEYflE8cd65ueWr8Zq00";

export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL?.trim() || LIVE_CHECKOUT_URL;
export const BROWSER_CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_BROWSER_CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
export const STORAGE_KEY = "sayward-lifetime-access";

export function isCheckoutReady(url = CHECKOUT_URL) {
  return /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+(?:[/?#].*)?$/.test(url);
}

export function getPurchaseSessionId(search: string) {
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id")?.trim() ?? "";
  return /^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId) ? sessionId : null;
}
