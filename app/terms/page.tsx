import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — Sayward",
  description: "The terms for using Sayward and purchasing full-plan access.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <Link className="wordmark" href="/">
        Sayward
      </Link>
      <h1>Simple terms for a simple tool.</h1>
      <p className="effective-date">Effective August 22, 2026</p>

      <h2>What Sayward provides</h2>
      <p>
        Sayward provides general writing support for difficult conversations. Its output is a
        draft for you to review and adapt. It is not legal, medical, mental-health, crisis,
        employment, or other professional advice.
      </p>

      <h2>What you are responsible for</h2>
      <p>
        You are responsible for deciding whether, when, and how to use a generated script.
        Do not use Sayward to threaten, harass, deceive, or break the law. If a situation may
        be unsafe or urgent, contact a qualified professional or local emergency service.
      </p>

      <h2>Purchase</h2>
      <p>
        The listed $3 payment is a one-time purchase that unlocks full plans in the browser
        after Sayward verifies the completed Stripe Checkout Session. It is not a subscription.
        Clearing that browser&apos;s site storage removes its local access flag.
      </p>

      <h2>Agent API</h2>
      <p>
        The Agent API charges the amount shown in its HTTP payment challenge for each completed
        request. Payment can be offered through the methods listed by the live API, including Tempo
        or Stripe when configured. Invalid requests are rejected before payment. A successful paid
        response includes a payment receipt. API output has the same writing-support limitations as
        the website.
      </p>

      <h2>Problems and refunds</h2>
      <p>
        If payment succeeds but the full plan does not unlock, use the merchant contact
        details on your Stripe receipt to request help. If the issue cannot be resolved, you
        may request a refund within seven days of purchase.
      </p>

      <h2>No guarantee</h2>
      <p>
        Conversation outcomes depend on people and circumstances outside the tool. Sayward
        does not promise a particular response, resolution, or result.
      </p>

      <Link className="back-link" href="/">
        Back to Sayward
      </Link>
    </main>
  );
}
