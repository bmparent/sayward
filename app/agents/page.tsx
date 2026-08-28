import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent API — Sayward",
  description: "A machine-payable API for complete Sayward conversation plans.",
};

export default function AgentsPage() {
  return (
    <main className="legal-page agent-page">
      <Link className="wordmark" href="/">
        Sayward
      </Link>
      <article>
        <h1>Sayward for software agents.</h1>
        <p>
          Create a complete difficult-conversation plan through a paid HTTP request. The endpoint
          uses the Machine Payments Protocol, validates the request before charging, and returns a
          payment receipt with the response. Production can offer Tempo stablecoin payments,
          Stripe agent payments, or both.
        </p>
        <h2>Endpoint</h2>
        <pre>POST /api/v1/plan</pre>
        <p>Price: $0.50 USD per completed plan through MPP.</p>
        <h2>Request</h2>
        <pre>{`{
  "scenario": "boundary",
  "tone": "firm",
  "person": "My manager",
  "happened": "Extra work has become the default.",
  "need": "Reset priorities and ownership."
}`}</pre>
        <h2>Discovery</h2>
        <p>
          <Link href="/api/v1">Service metadata</Link>
          {" · "}
          <Link href="/api/v1/openapi.json">OpenAPI payment metadata</Link>
          {" · "}
          <Link href="/llms.txt">llms.txt</Link>
        </p>
        <p>
          Sayward provides writing support only. It is not legal, medical, employment, crisis, or
          safety advice.
        </p>
      </article>
    </main>
  );
}
