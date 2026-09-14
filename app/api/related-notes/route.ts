import { NextRequest, NextResponse } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = process.env.NVIDIA_MODEL || "moonshotai/kimi-k3";
const MAX_SOURCE_CHARS = 6000;

export type BackgroundNoteResult = {
  overview: string;
  keyPoints: string[];
  managementSummary: string;
  clinicalPearl?: string;
};

function extractJsonObject(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  // Some models add stray prose around the JSON despite instructions -- pull
  // out the outermost {...} block as a fallback.
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(candidate);
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
        max_tokens: 1100,
        temperature: 0.4,
        stream: false,
      }),
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach the NVIDIA API." }, { status: 502 });
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
    // Graceful fallback: still show something readable instead of an error.
    return NextResponse.json({
      note: { overview: content.trim(), keyPoints: [], managementSummary: "" } satisfies BackgroundNoteResult,
    });
  }

  return NextResponse.json({ note: parsed });
}
