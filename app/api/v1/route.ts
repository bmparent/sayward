import {
  MACHINE_PLAN_PRICE_USD,
  MACHINE_PLAN_SCOPE,
  getConfiguredPaymentMethods,
} from "./payment";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const paymentMethods = getConfiguredPaymentMethods();
  const configured = Boolean(
    process.env.MPP_SECRET_KEY?.trim() && paymentMethods.length,
  );

  return Response.json(
    {
      service: "Sayward Agent API",
      version: "1",
      status: configured ? "ready" : "payment_configuration_required",
      protocol: "Machine Payments Protocol",
      payment_methods: paymentMethods,
      supported_payment_methods: ["tempo", "stripe"],
      price: { amount: MACHINE_PLAN_PRICE_USD, currency: "USD", intent: "charge" },
      endpoint: `${origin}/api/v1/plan`,
      scope: MACHINE_PLAN_SCOPE,
      discovery: `${origin}/api/v1/openapi.json`,
      documentation: `${origin}/agents`,
    },
    {
      headers: {
        "cache-control": "no-store",
        Link: `</api/v1/openapi.json>; rel="service-desc"`,
      },
    },
  );
}
