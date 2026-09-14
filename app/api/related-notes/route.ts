import { NextRequest, NextResponse } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = process.env.NVIDIA_MODEL || "moonshotai/kimi-k3";

export async function POST(req: NextRequest) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "NVIDIA_API_KEY is not configured on the server. Add it to .env.local (see .env.local.example) and restart the dev server." },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  const chapterTitle = typeof body?.chapterTitle === "string" ? body.chapterTitle.slice(0, 200) : "";
  const sectionTitle = typeof body?.sectionTitle === "string" ? body.sectionTitle.slice(0, 200) : "";
  if (!sectionTitle) {
    return NextResponse.json({ error: "sectionTitle is required." }, { status: 400 });
  }

  const prompt = `A clinician in Zimbabwe is studying the EDLIZ 2025 guideline, chapter "${chapterTitle}", section "${sectionTitle}".

Write a short background note (180-260 words) on the core medical concept behind this section: what it is, key pathophysiology or clinical context, and why it matters. This supplements the guideline -- do NOT repeat or invent specific dosing, drug names, or treatment instructions, since those must come only from the guideline itself. Plain prose, no headings, no markdown formatting, no bullet points.`;

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
        max_tokens: 500,
        temperature: 0.5,
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

  return NextResponse.json({ note: content.trim() });
}
