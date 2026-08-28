import {
  scenarioOptions,
  toneOptions,
  type ConversationInput,
  type Scenario,
  type Tone,
} from "../../message-engine.ts";

const scenarios = new Set<Scenario>(scenarioOptions.map((option) => option.value));
const tones = new Set<Tone>(toneOptions.map((option) => option.value));

type ParseResult =
  | { ok: true; input: ConversationInput }
  | { ok: false; errors: string[] };

export function parseConversationInput(value: unknown): ParseResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }

  const candidate = value as Record<string, unknown>;
  const scenario = candidate.scenario;
  const tone = candidate.tone;
  const person = candidate.person;
  const happened = candidate.happened;
  const need = candidate.need;
  const errors: string[] = [];

  if (typeof scenario !== "string" || !scenarios.has(scenario as Scenario)) {
    errors.push("scenario must be one of: boundary, raise, apology, resignation, dispute, other.");
  }
  if (typeof tone !== "string" || !tones.has(tone as Tone)) {
    errors.push("tone must be one of: warm, direct, firm.");
  }

  for (const [name, field, maximum] of [
    ["person", person, 120],
    ["happened", happened, 500],
    ["need", need, 500],
  ] as const) {
    if (typeof field !== "string" || !field.trim()) {
      errors.push(`${name} must be a non-empty string.`);
    } else if (field.length > maximum) {
      errors.push(`${name} must be ${maximum} characters or fewer.`);
    }
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    input: {
      scenario: scenario as Scenario,
      tone: tone as Tone,
      person: (person as string).trim(),
      happened: (happened as string).trim(),
      need: (need as string).trim(),
    },
  };
}
