import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Sayward",
  description: "How Sayward handles conversation drafts and purchase access.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="wordmark" href="/">
        Sayward
      </Link>
      <h1>Privacy, in plain language.</h1>
      <p className="effective-date">Effective August 22, 2026</p>

      <h2>Your drafts</h2>
      <p>
        The names and conversation details you enter are processed in your browser to create
        your script. Sayward does not send or save those drafts on an application server.
      </p>

      <h2>Purchase access</h2>
      <p>
        When you purchase the full plan, checkout is handled by Stripe. Stripe processes the
        payment information under its own privacy policy. After a successful payment, Sayward
        stores a small access flag in this browser so the full plan stays unlocked here. It
        does not contain your conversation text or payment-card details.
      </p>

      <h2>Hosting data</h2>
      <p>
        Like most hosted websites, the hosting provider may process basic request information
        such as an IP address, browser type, timestamp, and requested page for security and
        operations. Sayward does not add advertising trackers or analytics cookies.
      </p>

      <h2>Your control</h2>
      <p>
        You can clear your drafts by refreshing or closing the page. Clearing site storage in
        your browser also removes the local purchase-access flag.
      </p>

      <Link className="back-link" href="/">
        Back to Sayward
      </Link>
    </main>
  );
}
