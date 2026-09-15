import { NextRequest, NextResponse } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
// moonshotai/kimi-k3 (a 2.8T-param MoE reasoning model) was the original
// default and produced correct notes, but took 60s-2.5min per request in
// testing, and sometimes didn't respond at all within 4.5 minutes on even a
// trivial prompt -- confirmed against the live API, not assumed. Switched to
// nemotron-3.5-lightning: same "thinking" style but consistently much
// faster (~1-90s observed) and available on this account.
const MODEL = process.env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b";
const MAX_SOURCE_CHARS = 6000;

export type BackgroundNoteResult = {
  overview: string;
  keyPoints: string[];
  managementSummary: string;
  clinicalPearl?: string;
};

// Reasoning-style models on this endpoint mix their visible chain-of-thought
// into `message.content` itself (not cleanly confined to the separate
// `reasoning_content` field) -- e.g. "Here's a thinking process... Draft
// JSON: {...}". A naive first-"{"-to-last-"}" scan can grab the wrong braces
// when the model quotes the target JSON shape earlier while reasoning about
// it. Scanning backward from the final "}" and depth-matching to its real
// opening "{" reliably isolates the actual final answer instead.
function extractJsonObject(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const lastClose = cleaned.lastIndexOf("}");
  if (lastClose === -1) throw new Error("No JSON object found in model output.");

  let depth = 0;
  let start = -1;
  for (let i = lastClose; i >= 0; i--) {
    if (cleaned[i] === "}") depth++;
    else if (cleaned[i] === "{") {
      depth--;
      if (depth === 0) {
        start = i;
        break;
      }
    }
  }
  if (start === -1) throw new Error("Unbalanced braces in model output.");

  return JSON.parse(cleaned.slice(start, lastClose + 1));
}

function isValidNote(v: unknown): v is BackgroundNoteResult {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.overview === "string" &&
    o.overview.trim().length > 0 &&
    Array.isArray(o.keyPoints) &&
    o.keyPoints.every((k) => typeof k === "string") &&
    typeof o.managementSummary === "string"
  );
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "NVIDIA_API_KEY is not configured on the server. Add it to .env.local (see .env.local.example) and restart the dev server.",
      },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  const chapterTitle = typeof body?.chapterTitle === "string" ? body.chapterTitle.slice(0, 200) : "";
  const sectionTitle = typeof body?.sectionTitle === "string" ? body.sectionTitle.slice(0, 200) : "";
  const sourceTextRaw = typeof body?.sourceText === "string" ? body.sourceText : "";
  if (!sectionTitle) {
    return NextResponse.json({ error: "sectionTitle is required." }, { status: 400 });
  }
  const sourceText =
    sourceTextRaw.length > MAX_SOURCE_CHARS
      ? sourceTextRaw.slice(0, MAX_SOURCE_CHARS) + "\n[…content truncated…]"
      : sourceTextRaw;

  const prompt = `You are helping a clinician in Zimbabwe study the EDLIZ 2025 guideline inside a study app.

Chapter: "${chapterTitle}"
Section: "${sectionTitle}"

Guideline text for this section, extracted from the official PDF (extraction can leave awkward artifacts, especially dosing tables that come out as a flat run of values like "ceftriaxone iv 2g once a day 7-14 days and gentamicin iv 5mg/kg once a day" -- that's a table row, not prose):
"""
${sourceText}
"""

Write a detailed study note covering both (a) the underlying medical concept and (b) how this guideline approaches managing it. Rules:
- Write entirely in your own words, in clear complete sentences. Never quote raw fragments of the source verbatim and never just reformat the table-like text -- explain what it means instead.
- Ground the management/dosing content only in the medicines, doses, and regimens that actually appear in the text above. Do not invent or substitute a different drug, dose, route, or duration. If a specific figure is genuinely illegible from the extraction, say it should be confirmed against the guideline rather than guessing.
- Be specific and clinically useful, written for a working clinician, not a layperson summary.

Respond with ONLY a single JSON object, no markdown code fences, no commentary before or after it, exactly this shape:
{
  "overview": "3-5 sentences: what this condition/concept is and why it matters clinically",
  "keyPoints": ["5 to 8 short, specific clinical or management points, each in your own words"],
  "managementSummary": "2-4 sentences synthesizing how EDLIZ approaches managing this, in clear prose -- not a list of raw values",
  "clinicalPearl": "one concrete, practical tip or common pitfall clearly supported by the text -- omit this field entirely if none is well-supported"
}`;

  const upstreamTimeout = AbortSignal.timeout(90_000);

  let upstream: Response;
  try {
    upstream = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.4,
        stream: false,
        // Without this, nemotron-3.5-lightning spends its whole token budget
        // narrating chain-of-thought reasoning into the visible content
        // field before (sometimes never) reaching the actual JSON answer --
        // confirmed directly: same prompt went from finish_reason "length"
        // with zero JSON output at 2200 tokens, to a clean, complete answer
        // in 516 tokens / ~20s with this set. Silently ignored by models
        // that don't support it, so safe to always send.
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: upstreamTimeout,
    });
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "The model took too long to respond (90+ s) and the request was cancelled." : "Failed to reach the NVIDIA API." },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `Upstream error ${upstream.status}: ${text.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const data = await upstream.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "The model returned an empty response." }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = extractJsonObject(content);
  } catch {
    parsed = null;
  }

  if (!isValidNote(parsed)) {
    // This model's raw content can include its full visible chain-of-thought
    // when it doesn't cleanly land the requested JSON shape -- showing that
    // wall of "let me think about this..." text as if it were the note
    // would be worse than a clear, retryable error.
    return NextResponse.json(
      { error: "The model's response wasn't in the expected format. This is usually transient -- try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ note: parsed });
}
