import assert from "node:assert/strict";
import test from "node:test";

import {
  buildConversationPlan,
  scenarioOptions,
  toneOptions,
} from "../app/message-engine.ts";
import {
  getPurchaseSessionId,
  isCheckoutReady,
} from "../app/commerce.ts";
import { isPaidSaywardSession } from "../app/commerce-server.ts";
import { parseConversationInput } from "../app/api/v1/input.ts";
import {
  chargeMachinePlan,
} from "../app/api/v1/payment.ts";

const baseInput = {
  scenario: "boundary",
  tone: "firm",
  person: "My manager",
  happened: "I have been taking on extra work outside my role",
  need: "I need us to reset priorities",
};

test("builds a complete, deterministic conversation plan", () => {
  const first = buildConversationPlan(baseInput);
  const second = buildConversationPlan(baseInput);

  assert.deepEqual(first, second);
  assert.match(first.opening, /^I need to set a clear boundary\./);
  assert.match(first.opening, /outside my role\./);
  assert.match(first.opening, /reset priorities\.$/);
  assert.match(first.pushback, /my position has not changed/i);
  assert.match(first.pushback, /My request remains the same:/);
  assert.equal(first.checklist.length, 3);
  assert.match(first.checklist[0], /My manager/);
});

test("supports every published scenario and tone combination", () => {
  assert.equal(scenarioOptions.length, 6);
  assert.equal(toneOptions.length, 3);

  for (const scenario of scenarioOptions) {
    for (const tone of toneOptions) {
      const plan = buildConversationPlan({
        ...baseInput,
        scenario: scenario.value,
        tone: tone.value,
      });

      assert.ok(plan.opening.length > 40, `${scenario.value}/${tone.value} opening`);
      assert.ok(plan.pushback.length > 40, `${scenario.value}/${tone.value} pushback`);
      assert.ok(plan.exit.length > 30, `${scenario.value}/${tone.value} exit`);
      assert.equal(plan.checklist.length, 3);
    }
  }
});

test("normalizes whitespace and supplies sentence punctuation", () => {
  const plan = buildConversationPlan({
    ...baseInput,
    happened: "  I   missed the deadline  ",
    need: "  I need a revised date?  ",
    person: "  Jordan  ",
  });

  assert.doesNotMatch(plan.opening, /\s{2,}/);
  assert.match(plan.opening, /I missed the deadline\./);
  assert.match(plan.opening, /I need a revised date\?$/);
  assert.match(plan.checklist[0], /Jordan/);
});

test("accepts only Stripe-hosted Payment Links", () => {
  assert.equal(isCheckoutReady("https://buy.stripe.com/abc123"), true);
  assert.equal(isCheckoutReady("https://buy.stripe.com/abc123?prefilled_email=a%40b.com"), true);
  assert.equal(isCheckoutReady("https://example.com/checkout"), false);
  assert.equal(isCheckoutReady("javascript:alert(1)"), false);
  assert.equal(isCheckoutReady(""), false);
});

test("accepts only Stripe Checkout Session identifiers from the return URL", () => {
  assert.equal(getPurchaseSessionId("?session_id=cs_live_abc123"), "cs_live_abc123");
  assert.equal(getPurchaseSessionId("?session_id=cs_test_abc123"), "cs_test_abc123");
  assert.equal(getPurchaseSessionId("?session_id=not-a-session"), null);
  assert.equal(getPurchaseSessionId("?unlock=anything"), null);
});

test("verifies payment completion and the exact Sayward price", () => {
  const paidSession = {
    id: "cs_live_abc123",
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    line_items: { data: [{ price: { id: "price_sayward" } }] },
  };

  assert.equal(isPaidSaywardSession(paidSession, "price_sayward"), true);
  assert.equal(isPaidSaywardSession({ ...paidSession, payment_status: "unpaid" }, "price_sayward"), false);
  assert.equal(isPaidSaywardSession(paidSession, "price_other"), false);
});

test("validates and normalizes machine API input before payment", () => {
  const parsed = parseConversationInput({
    ...baseInput,
    person: "  My manager  ",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.ok && parsed.input.person, "My manager");

  const invalid = parseConversationInput({ ...baseInput, need: "" });
  assert.equal(invalid.ok, false);
});

test("emits a Stripe-backed HTTP 402 challenge without contacting Stripe", async () => {
  const priorStripeKey = process.env.STRIPE_SECRET_KEY;
  const priorMppKey = process.env.MPP_SECRET_KEY;
  const priorTempoRecipient = process.env.MPP_TEMPO_RECIPIENT;

  try {
    process.env.STRIPE_SECRET_KEY = "test-only-not-a-stripe-key";
    process.env.MPP_SECRET_KEY = "0123456789abcdef0123456789abcdef";
    delete process.env.MPP_TEMPO_RECIPIENT;

    const payment = await chargeMachinePlan(
      new Request("https://example.test/api/v1/plan", { method: "POST" }),
    );

    assert.ok(payment);
    assert.equal(payment.status, 402);
    assert.match(payment.challenge.headers.get("www-authenticate") ?? "", /^Payment /);
    assert.match(payment.challenge.headers.get("www-authenticate") ?? "", /method="stripe"/);
  } finally {
    if (priorStripeKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = priorStripeKey;
    if (priorMppKey === undefined) delete process.env.MPP_SECRET_KEY;
    else process.env.MPP_SECRET_KEY = priorMppKey;
    if (priorTempoRecipient === undefined) delete process.env.MPP_TEMPO_RECIPIENT;
    else process.env.MPP_TEMPO_RECIPIENT = priorTempoRecipient;
  }
});

test("emits an open-network Tempo HTTP 402 fallback without a Stripe key", async () => {
  const priorStripeKey = process.env.STRIPE_SECRET_KEY;
  const priorMppKey = process.env.MPP_SECRET_KEY;
  const priorTempoRecipient = process.env.MPP_TEMPO_RECIPIENT;
  const priorTempoTestnet = process.env.MPP_TEMPO_TESTNET;

  try {
    delete process.env.STRIPE_SECRET_KEY;
    process.env.MPP_SECRET_KEY = "0123456789abcdef0123456789abcdef";
    process.env.MPP_TEMPO_RECIPIENT = "0x000000000000000000000000000000000000dEaD";
    process.env.MPP_TEMPO_TESTNET = "true";

    const payment = await chargeMachinePlan(
      new Request("https://example.test/api/v1/plan", { method: "POST" }),
    );

    assert.ok(payment);
    assert.equal(payment.status, 402);
    assert.match(payment.challenge.headers.get("www-authenticate") ?? "", /method="tempo"/);
  } finally {
    if (priorStripeKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = priorStripeKey;
    if (priorMppKey === undefined) delete process.env.MPP_SECRET_KEY;
    else process.env.MPP_SECRET_KEY = priorMppKey;
    if (priorTempoRecipient === undefined) delete process.env.MPP_TEMPO_RECIPIENT;
    else process.env.MPP_TEMPO_RECIPIENT = priorTempoRecipient;
    if (priorTempoTestnet === undefined) delete process.env.MPP_TEMPO_TESTNET;
    else process.env.MPP_TEMPO_TESTNET = priorTempoTestnet;
  }
});
