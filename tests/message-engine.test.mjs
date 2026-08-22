import assert from "node:assert/strict";
import test from "node:test";

import {
  buildConversationPlan,
  scenarioOptions,
  toneOptions,
} from "../app/message-engine.ts";
import {
  isCheckoutReady,
  isValidPurchaseReturn,
} from "../app/commerce.ts";

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

test("recognizes only the configured payment-return value", () => {
  assert.equal(
    isValidPurchaseReturn("?unlock=a370a39cef224871921454eba60f669b"),
    true,
  );
  assert.equal(isValidPurchaseReturn("?unlock=wrong"), false);
  assert.equal(isValidPurchaseReturn(""), false);
});
