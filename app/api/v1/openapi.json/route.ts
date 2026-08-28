import { MACHINE_PLAN_SCOPE, getConfiguredPaymentMethods } from "../payment";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const methods = getConfiguredPaymentMethods();
  const tempoTestnet = process.env.MPP_TEMPO_TESTNET?.trim().toLowerCase() === "true";
  const offers = methods.map((method) =>
    method === "tempo"
      ? {
          amount: "500000",
          currency: tempoTestnet
            ? "0x20c0000000000000000000000000000000000000"
            : "0x20C000000000000000000000b9537d11c60E8b50",
          intent: "charge",
          method,
          scope: MACHINE_PLAN_SCOPE,
        }
      : {
          amount: "50",
          currency: "usd",
          intent: "charge",
          method,
          scope: MACHINE_PLAN_SCOPE,
        },
  );

  return Response.json(
    {
      openapi: "3.1.0",
      info: {
        title: "Sayward Agent API",
        version: "1.0.0",
        description: "Generate a complete, deterministic difficult-conversation plan after an inline MPP payment.",
        "x-guidance":
          "Send one valid conversation brief to POST /api/v1/plan. The first response is an MPP payment challenge; retry the same request with payment authorization to receive the complete plan.",
      },
      servers: [{ url: origin }],
      paths: {
        "/api/v1/plan": {
          post: {
            operationId: "createConversationPlan",
            summary: "Create one complete conversation plan",
            description: "Valid input is checked before payment. A paid retry returns the plan and a Payment-Receipt header.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  example: {
                    scenario: "dispute",
                    tone: "warm",
                    person: "a teammate",
                    happened: "The milestone was missed without an update.",
                    need: "Agree on a new deadline and earlier risk communication.",
                  },
                  schema: {
                    type: "object",
                    additionalProperties: false,
                    required: ["scenario", "tone", "person", "happened", "need"],
                    properties: {
                      scenario: {
                        type: "string",
                        enum: ["boundary", "raise", "apology", "resignation", "dispute", "other"],
                      },
                      tone: { type: "string", enum: ["warm", "direct", "firm"] },
                      person: { type: "string", minLength: 1, maxLength: 120 },
                      happened: { type: "string", minLength: 1, maxLength: 500 },
                      need: { type: "string", minLength: 1, maxLength: 500 },
                    },
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Paid conversation plan with a Payment-Receipt header.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["version", "generated_at", "input", "plan", "limits"],
                      properties: {
                        version: { type: "string" },
                        generated_at: { type: "string", format: "date-time" },
                        input: { type: "object" },
                        plan: {
                          type: "object",
                          required: ["opening", "pushback", "exit", "checklist"],
                          properties: {
                            opening: { type: "string" },
                            pushback: { type: "string" },
                            exit: { type: "string" },
                            checklist: { type: "array", items: { type: "string" } },
                          },
                        },
                        limits: { type: "string" },
                      },
                    },
                  },
                },
              },
              "400": { description: "Invalid input; no payment is attempted." },
              "402": { description: "Payment Required" },
              "503": { description: "Payment configuration is unavailable." },
            },
            "x-payment-info": {
              price: { mode: "fixed", currency: "USD", amount: "0.50" },
              protocols: offers.map((offer) => ({
                mpp: {
                  method: offer.method,
                  intent: offer.intent,
                  currency: offer.currency,
                },
              })),
              offers,
              supported_methods: ["tempo", "stripe"],
            },
          },
        },
      },
      "x-service-info": {
        name: "Sayward",
        homepage: origin,
        documentation: `${origin}/agents`,
        privacy: `${origin}/privacy`,
        terms: `${origin}/terms`,
      },
    },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
