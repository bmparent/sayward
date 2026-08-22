"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CHECKOUT_URL,
  STORAGE_KEY,
  isCheckoutReady,
  isValidPurchaseReturn,
} from "./commerce";
import {
  buildConversationPlan,
  scenarioOptions,
  toneOptions,
  type Scenario,
  type Tone,
} from "./message-engine";

const example = {
  scenario: "boundary" as Scenario,
  tone: "firm" as Tone,
  person: "My manager",
  happened:
    "I have been taking on extra work outside my role without additional support or recognition.",
  need: "I need us to reset priorities and agree on what is actually part of my role.",
};

function CopyIcon() {
  return (
    <span aria-hidden="true" className="copy-icon">
      <span />
    </span>
  );
}

export function SaywardApp() {
  const [scenario, setScenario] = useState<Scenario>(example.scenario);
  const [tone, setTone] = useState<Tone>(example.tone);
  const [person, setPerson] = useState(example.person);
  const [happened, setHappened] = useState(example.happened);
  const [need, setNeed] = useState(example.need);
  const [submitted, setSubmitted] = useState(example);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const validReturn = isValidPurchaseReturn(window.location.search);
      const stored = window.localStorage.getItem(STORAGE_KEY) === "yes";

      if (validReturn) {
        window.localStorage.setItem(STORAGE_KEY, "yes");
        setJustUnlocked(true);
        window.history.replaceState({}, "", window.location.pathname);
      }

      setUnlocked(validReturn || stored);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const plan = useMemo(() => buildConversationPlan(submitted), [submitted]);

  function buildScript(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!person.trim() || !happened.trim() || !need.trim()) {
      setError("Add a person, what happened, and the outcome you need.");
      return;
    }

    setError("");
    setSubmitted({ scenario, tone, person, happened, need });

    if (window.matchMedia("(max-width: 820px)").matches) {
      window.requestAnimationFrame(() => {
        document.getElementById("your-script")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1600);
  }

  function startCheckout() {
    if (!isCheckoutReady()) {
      setCheckoutError("Checkout is being activated. Please try again shortly.");
      return;
    }

    setCheckoutError("");
    window.location.assign(CHECKOUT_URL);
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Sayward home">
          Sayward
        </a>
        <p>Your words stay in this browser.</p>
      </header>

      <div className="workbench" id="top">
        <section className="composer" aria-labelledby="page-title">
          <div className="intro">
            <h1 id="page-title">Find the words. Keep your nerve.</h1>
            <p>A clear script for the conversation you have been avoiding.</p>
          </div>

          <form onSubmit={buildScript} noValidate>
            <fieldset className="choice-fieldset scenario-fieldset">
              <legend>Scenario</legend>
              <div className="scenario-options">
                {scenarioOptions.map((option) => (
                  <button
                    aria-pressed={scenario === option.value}
                    className={scenario === option.value ? "is-selected" : ""}
                    key={option.value}
                    onClick={() => setScenario(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="text-field">
              <span>Who is it for?</span>
              <input
                maxLength={120}
                onChange={(event) => setPerson(event.target.value)}
                value={person}
              />
              <small>{person.length}/120</small>
            </label>

            <label className="text-field">
              <span>What happened?</span>
              <textarea
                maxLength={500}
                onChange={(event) => setHappened(event.target.value)}
                rows={3}
                value={happened}
              />
              <small>{happened.length}/500</small>
            </label>

            <label className="text-field">
              <span>What do you need?</span>
              <textarea
                maxLength={500}
                onChange={(event) => setNeed(event.target.value)}
                rows={3}
                value={need}
              />
              <small>{need.length}/500</small>
            </label>

            <fieldset className="choice-fieldset tone-fieldset">
              <legend>Tone</legend>
              <div className="tone-options">
                {toneOptions.map((option) => (
                  <button
                    aria-pressed={tone === option.value}
                    className={tone === option.value ? "is-selected" : ""}
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}

            <button className="build-button" type="submit">
              Build my script
            </button>
          </form>
        </section>

        <section className="manuscript" id="your-script" aria-labelledby="script-heading">
          <div className="manuscript-label" id="script-heading">
            Your script
          </div>

          {justUnlocked ? (
            <div className="unlock-notice" role="status">
              Full plan unlocked on this device.
            </div>
          ) : null}

          <ScriptSection
            copied={copied === "Opening"}
            heading="Opening"
            onCopy={() => copyText("Opening", plan.opening)}
            text={plan.opening}
          />

          {unlocked ? (
            <>
              <ScriptSection
                copied={copied === "Pushback"}
                heading="If they push back"
                onCopy={() => copyText("Pushback", plan.pushback)}
                text={plan.pushback}
              />
              <ScriptSection
                copied={copied === "Exit"}
                heading="Exit line"
                onCopy={() => copyText("Exit", plan.exit)}
                text={plan.exit}
              />
              <section className="prep-section">
                <h2>Before you say it</h2>
                <ol>
                  {plan.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </section>
              <div className="access-active">Full access active in this browser.</div>
            </>
          ) : (
            <LockedPlan checkoutError={checkoutError} onCheckout={startCheckout} />
          )}
        </section>
      </div>

      <footer>
        <p>Writing support, not legal, medical, or crisis advice.</p>
        <p className="footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <span>© 2026 Sayward</span>
        </p>
      </footer>
    </main>
  );
}

function ScriptSection({
  heading,
  text,
  copied,
  onCopy,
}: {
  heading: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <section className="script-section">
      <div className="script-heading-row">
        <h2>{heading}</h2>
        <button className="copy-button" onClick={onCopy} type="button">
          <CopyIcon />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p>{text}</p>
    </section>
  );
}

function LockedPlan({
  checkoutError,
  onCheckout,
}: {
  checkoutError: string;
  onCheckout: () => void;
}) {
  return (
    <div className="locked-plan">
      <div aria-hidden="true" className="locked-preview">
        <div>
          <span>If they push back</span>
          <i />
          <i />
          <i className="short" />
        </div>
        <div>
          <span>Exit line</span>
          <i />
          <i className="short" />
        </div>
      </div>
      <div className="paywall">
        <span aria-hidden="true" className="lock-mark" />
        <p>The full plan includes pushback replies, an exit line, and a three-step prep list.</p>
        <button onClick={onCheckout} type="button">
          Unlock the full plan — $3
        </button>
        <small>One-time purchase. Unlocks full plans in this browser.</small>
        {checkoutError ? (
          <span className="checkout-error" role="alert">
            {checkoutError}
          </span>
        ) : null}
      </div>
    </div>
  );
}
