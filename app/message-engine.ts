export type Scenario =
  | "boundary"
  | "raise"
  | "apology"
  | "resignation"
  | "dispute"
  | "other";

export type Tone = "warm" | "direct" | "firm";

export type ConversationInput = {
  scenario: Scenario;
  tone: Tone;
  person: string;
  happened: string;
  need: string;
};

export type ConversationPlan = {
  opening: string;
  pushback: string;
  exit: string;
  checklist: string[];
};

export const scenarioOptions: Array<{ value: Scenario; label: string }> = [
  { value: "boundary", label: "Boundary" },
  { value: "raise", label: "Raise" },
  { value: "apology", label: "Apology" },
  { value: "resignation", label: "Resignation" },
  { value: "dispute", label: "Dispute" },
  { value: "other", label: "Other" },
];

export const toneOptions: Array<{ value: Tone; label: string }> = [
  { value: "warm", label: "Warm" },
  { value: "direct", label: "Direct" },
  { value: "firm", label: "Firm" },
];

function sentence(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

const openers: Record<Scenario, Record<Tone, string>> = {
  boundary: {
    warm: "I care about our relationship, so I want to be honest about something.",
    direct: "I need to address something directly.",
    firm: "I need to set a clear boundary.",
  },
  raise: {
    warm: "I appreciate the opportunities I have had here, and I would like to talk about my compensation.",
    direct: "I would like to discuss adjusting my compensation.",
    firm: "I want to have a clear conversation about my compensation and responsibilities.",
  },
  apology: {
    warm: "I owe you a sincere apology.",
    direct: "I want to apologize clearly and without making excuses.",
    firm: "I take responsibility for what happened, and I want to address it directly.",
  },
  resignation: {
    warm: "I am grateful for my time here, and I need to share an important decision.",
    direct: "I am letting you know that I have decided to resign.",
    firm: "I have made a final decision to resign from my role.",
  },
  dispute: {
    warm: "I would like to resolve an issue that has been weighing on me.",
    direct: "I need to address a disagreement and work toward a fair resolution.",
    firm: "I am formally raising an issue that needs to be resolved.",
  },
  other: {
    warm: "I value our relationship, and I want to talk honestly about something important.",
    direct: "I need to have a direct conversation about something important.",
    firm: "I need to be clear about an issue that cannot remain unresolved.",
  },
};

const closers: Record<Scenario, Record<Tone, string>> = {
  boundary: {
    warm: "I hope we can respect this and move forward with a clearer understanding.",
    direct: "I have been clear about what I need, and I am going to follow through on it.",
    firm: "This boundary is not up for negotiation, so I am ending the conversation for now.",
  },
  raise: {
    warm: "Could we agree on a date to revisit this with a specific answer?",
    direct: "Let us set a date for a decision and the next steps.",
    firm: "I need a clear decision and timeline, so let us agree on both now.",
  },
  apology: {
    warm: "I understand if you need time, and I am committed to rebuilding trust through my actions.",
    direct: "I do not expect an immediate response; I will show the change through what I do next.",
    firm: "I accept the impact of my actions and will demonstrate the change rather than argue my intent.",
  },
  resignation: {
    warm: "I want to make the transition thoughtful, and I will follow up with the details in writing.",
    direct: "I will send the formal notice and transition details in writing today.",
    firm: "My decision is final; I will now focus on a professional handoff.",
  },
  dispute: {
    warm: "I would like us to agree on the next step and put it in writing.",
    direct: "Let us document the resolution and the date it will be completed.",
    firm: "If we cannot resolve this now, I will document the issue and use the appropriate next step.",
  },
  other: {
    warm: "I hope we can take a little time and return to this with the goal of understanding each other.",
    direct: "I have said what I need to say, so I am going to pause here and follow up in writing.",
    firm: "I am not willing to keep circling this, so I am ending the conversation for now.",
  },
};

export function buildConversationPlan(input: ConversationInput): ConversationPlan {
  const happened = sentence(input.happened);
  const need = sentence(input.need);
  const person = input.person.trim() || "the other person";
  const opening = `${openers[input.scenario][input.tone]} ${happened} ${need}`
    .replace(/\s+/g, " ")
    .trim();

  const pushbackLead =
    input.tone === "warm"
      ? "I hear that you see it differently."
      : input.tone === "direct"
        ? "I understand your perspective, but it does not change what I am asking for."
        : "I have heard your response, and my position has not changed.";

  const pushback = `${pushbackLead} My request remains the same: ${need}`.trim();

  return {
    opening,
    pushback,
    exit: closers[input.scenario][input.tone],
    checklist: [
      `Choose a private moment when ${person} is not rushed.`,
      "Say the opening once, then pause instead of filling the silence.",
      "Keep your request specific and avoid adding old grievances.",
    ],
  };
}
