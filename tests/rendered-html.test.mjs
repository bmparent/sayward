import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function request(path = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
      ...init,
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the sellable Sayward experience", async () => {
  const response = await request();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Sayward — Find the words\. Keep your nerve\.<\/title>/i);
  assert.match(html, /Find the words\. Keep your nerve\./);
  assert.match(html, /Who is it for\?/);
  assert.match(html, /What happened\?/);
  assert.match(html, /What do you need\?/);
  assert.match(html, /Build my script/);
  assert.match(html, /Your script/);
  assert.match(html, /Unlock the full plan — \$3/);
  assert.match(html, /Your words stay in this browser\./);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/i);
});

test("server-renders the privacy and terms receipts", async () => {
  const [privacyResponse, termsResponse] = await Promise.all([
    request("/privacy"),
    request("/terms"),
  ]);

  assert.equal(privacyResponse.status, 200);
  assert.equal(termsResponse.status, 200);

  const [privacy, terms] = await Promise.all([
    privacyResponse.text(),
    termsResponse.text(),
  ]);

  assert.match(privacy, /Privacy, in plain language\./);
  assert.match(privacy, /processed in your browser/);
  assert.match(privacy, /Stripe processes the payment information/);
  assert.match(terms, /Simple terms for a simple tool\./);
  assert.match(terms, /It is not a subscription\./);
  assert.match(terms, /request a refund within seven days/);
});

test("publishes machine-readable agent discovery and fails closed without payment secrets", async () => {
  const [agentsResponse, serviceResponse, openapiResponse, planResponse] = await Promise.all([
    request("/agents"),
    request("/api/v1", { headers: { accept: "application/json" } }),
    request("/api/v1/openapi.json", { headers: { accept: "application/json" } }),
    request("/api/v1/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenario: "boundary",
        tone: "firm",
        person: "My manager",
        happened: "Extra work became the default.",
        need: "Reset priorities and ownership.",
      }),
    }),
  ]);

  assert.equal(agentsResponse.status, 200);
  assert.match(await agentsResponse.text(), /Sayward for software agents\./);

  assert.equal(serviceResponse.status, 200);
  assert.equal((await serviceResponse.json()).service, "Sayward Agent API");

  assert.equal(openapiResponse.status, 200);
  const openapi = await openapiResponse.json();
  assert.equal(openapi.openapi, "3.1.0");
  assert.deepEqual(openapi.paths["/api/v1/plan"].post["x-payment-info"].offers, []);
  assert.deepEqual(
    openapi.paths["/api/v1/plan"].post["x-payment-info"].supported_methods,
    ["tempo", "stripe"],
  );

  assert.equal(planResponse.status, 503);
  assert.equal((await planResponse.json()).error, "machine_payments_not_configured");
});

test("keeps the app responsive, private by default, and free of starter residue", async () => {
  const [app, commerce, engine, css, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/SaywardApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/commerce.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/message-engine.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(app, /XMLHttpRequest|OPENAI_API_KEY|STRIPE_SECRET/);
  assert.doesNotMatch(app, /buy\.stripe\.com\/placeholder/);
  assert.match(commerce, /NEXT_PUBLIC_STRIPE_CHECKOUT_URL/);
  assert.match(commerce, /https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/);
  assert.match(commerce, /buy\\\.stripe\\\.com/);
  assert.match(app, /Verifying your Stripe payment/);
  assert.match(app, /\/api\/verify-purchase/);
  assert.match(app, /window\.localStorage/);
  assert.match(app, /navigator\.clipboard/);
  assert.match(engine, /boundary/);
  assert.match(engine, /resignation/);
  assert.match(engine, /buildConversationPlan/);
  assert.match(css, /@media \(max-width: 820px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(page, /<SaywardApp \/>/);
  assert.match(layout, /favicon\.svg/);
  assert.match(layout, /Sayward — Find the words/);
});
