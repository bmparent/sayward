export const CHECKOUT_URL = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL?.trim() ?? "";
export const STORAGE_KEY = "sayward-lifetime-access";

const UNLOCK_TOKEN = "a370a39cef224871921454eba60f669b";

export function isCheckoutReady(url = CHECKOUT_URL) {
  return /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+(?:[/?#].*)?$/.test(url);
}

export function isValidPurchaseReturn(search: string) {
  const params = new URLSearchParams(search);
  return params.get("unlock") === UNLOCK_TOKEN;
}
