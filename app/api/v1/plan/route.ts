import { buildConversationPlan } from "../../../message-engine";
import { parseConversationInput } from "../input";
import { chargeMachinePlan } from "../payment";

const jsonHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 20_000) {
    return Response.json(
      { error: "request_too_large" },
      { status: 413, headers: jsonHeaders },
    );
  }

  let body: unknown;
  try {
    body = await request.clone().json();
  } catch {
    return Response.json(
      { error: "invalid_json" },
      { status: 400, headers: jsonHeaders },
    );
  }

  const parsed = parseConversationInput(body);
  if (!parsed.ok) {
    return Response.json(
      { error: "invalid_input", details: parsed.errors },
      { status: 400, headers: jsonHeaders },
    );
  }

  const payment = await chargeMachinePlan(request);
  if (!payment) {
    return Response.json(
      { error: "machine_payments_not_configured" },
      { status: 503, headers: jsonHeaders },
    );
  }

  if (payment.status === 402) return payment.challenge;

  return payment.withReceipt(
    Response.json(
      {
        version: "1",
        generated_at: new Date().toISOString(),
        input: parsed.input,
        plan: buildConversationPlan(parsed.input),
        limits: "Writing support only; not legal, medical, employment, crisis, or safety advice.",
      },
      { headers: jsonHeaders },
    ),
  );
}
