import { Mppx, stripe, tempo } from "mppx/server";

export const MACHINE_PLAN_PRICE_USD = "0.50";
export const MACHINE_PLAN_SCOPE = "POST /api/v1/plan";

const tempoRecipientPattern = /^0x[A-Fa-f0-9]{40}$/;

function getStripeMethod() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) return null;

  return stripe.charge({
    secretKey: stripeSecretKey,
    networkId: process.env.STRIPE_NETWORK_ID?.trim() || "internal",
    currency: "usd",
    decimals: 2,
    paymentMethodTypes: ["card"],
    metadata: {
      product: "sayward_agent_plan",
      surface: "mpp",
    },
  });
}

function getTempoMethod() {
  const recipient = process.env.MPP_TEMPO_RECIPIENT?.trim() ?? "";
  if (!tempoRecipientPattern.test(recipient)) return null;

  return tempo.charge({
    recipient: recipient as `0x${string}`,
    testnet: process.env.MPP_TEMPO_TESTNET?.trim().toLowerCase() === "true",
  });
}

function serverOptions() {
  return {
    secretKey: process.env.MPP_SECRET_KEY?.trim(),
    realm: process.env.MPP_REALM?.trim() || "sayward.bmparent.chatgpt.site",
  };
}

function logPaymentSuccess({
  receipt,
}: {
  receipt: { reference: string; status: string };
}) {
  console.info(
    JSON.stringify({
      event: "sayward.mpp.payment_succeeded",
      reference: receipt.reference,
      status: receipt.status,
    }),
  );
}

const chargeOptions = {
  amount: MACHINE_PLAN_PRICE_USD,
  description: "One complete Sayward conversation plan",
  scope: MACHINE_PLAN_SCOPE,
  meta: { product: "sayward_agent_plan", version: "1" },
};

export function getConfiguredPaymentMethods() {
  const methods: string[] = [];
  if (getTempoMethod()) methods.push("tempo");
  if (getStripeMethod()) methods.push("stripe");
  return methods;
}

export async function chargeMachinePlan(request: Request) {
  if (!process.env.MPP_SECRET_KEY?.trim()) return null;

  const tempoMethod = getTempoMethod();
  const stripeMethod = getStripeMethod();

  if (tempoMethod && stripeMethod) {
    const server = Mppx.create({
      methods: [tempoMethod, stripeMethod],
      ...serverOptions(),
    });
    server.onPaymentSuccess(logPaymentSuccess);
    return server.compose(
      ["tempo/charge", chargeOptions],
      ["stripe/charge", chargeOptions],
    )(request);
  }

  if (tempoMethod) {
    const server = Mppx.create({ methods: [tempoMethod], ...serverOptions() });
    server.onPaymentSuccess(logPaymentSuccess);
    return server.tempo.charge(chargeOptions)(request);
  }

  if (stripeMethod) {
    const server = Mppx.create({ methods: [stripeMethod], ...serverOptions() });
    server.onPaymentSuccess(logPaymentSuccess);
    return server.stripe.charge(chargeOptions)(request);
  }

  return null;
}
