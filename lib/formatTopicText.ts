// The source PDF extraction hard-breaks text at the original document's line
// wraps, not at sentence or paragraph boundaries -- so raw text renders as a
// choppy fragment-per-line wall rather than flowing prose. This reconstructs
// paragraphs, headings, and lists from those line breaks using only
// structural cues already present in the text (blank lines, ALL-CAPS lines,
// bullet/number markers) -- it never reorders or infers content.
//
// Deliberately NOT attempted: reconstructing dosing tables. The extraction
// dumps table cells one per line with no reliable column boundaries (e.g. a
// "codes" cell sometimes spans two lines, durations get split mid-value), so
// any automatic column-guessing risks misattributing a dose or duration to
// the wrong drug -- a real safety issue in a clinical guideline. Table-like
// runs are left as plain reflowed text instead of a fabricated table.

export type TopicBlock =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "p"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] };

const BULLET_ALONE = /^[▪•]$/;
const BULLET_INLINE = /^[▪•]\s+(\S.*)$/;
const DASH_INLINE = /^-\s+(\S.*)$/;
const NUM_ALONE = /^\d{1,2}\.$/;
const NUM_INLINE = /^(\d{1,2})\.\s+(\S.*)$/;

function isHeadingLine(trimmed: string): boolean {
  if (trimmed.length < 3 || trimmed.length > 90) return false;
  if (!/\s/.test(trimmed)) return false; // single emphasized words ("NOT") aren't headings
  const alpha = trimmed.replace(/[^A-Za-z]/g, "");
  if (alpha.length < 6) return false;
  const upper = alpha.replace(/[^A-Z]/g, "");
  if (upper.length / alpha.length < 0.85) return false;
  if (/[,;]$/.test(trimmed)) return false;
  return true;
}

function isListMarker(t: string): boolean {
  return BULLET_ALONE.test(t) || BULLET_INLINE.test(t) || DASH_INLINE.test(t) || NUM_ALONE.test(t) || NUM_INLINE.test(t);
}

// A blank line here is often a PDF page-break artifact, not a real paragraph
// break -- if the next non-blank line starts lowercase, it's almost
// certainly the tail of a sentence/item interrupted by a page boundary.
function blankIsPageBreak(lines: string[], i: number): boolean {
  let j = i;
  while (j < lines.length && lines[j].trim() === "") j++;
  if (j >= lines.length) return false;
  return /^[a-z]/.test(lines[j].trim());
}

export function formatTopicText(text: string): TopicBlock[] {
  const lines = text.split("\n");
  const blocks: TopicBlock[] = [];
  let buf: string[] = [];

  function flushParagraph() {
    if (!buf.length) return;
    const t = buf.join(" ").trim();
    buf = [];
    // Short, unpunctuated (or colon-terminated) standalone text is almost
    // always a mixed-case section label the ALL-CAPS heading detector above
    // misses (e.g. "Principles of antimicrobial use", "General
    // Recommendations:") rather than a real paragraph.
    if (t.length <= 70 && (/:$/.test(t) || !/[.!?]$/.test(t))) {
      blocks.push({ type: "subheading", text: t });
    } else {
      blocks.push({ type: "p", text: t });
    }
  }

  function consumeItem(start: number, firstChunk: string | null): { text: string; next: number } {
    const chunk = firstChunk ? [firstChunk] : [];
    let j = start;
    while (j < lines.length) {
      const t = lines[j].trim();
      if (t === "") {
        if (blankIsPageBreak(lines, j)) {
          j++;
          continue;
        }
        break;
      }
      if (isHeadingLine(t) || isListMarker(t)) break;
      chunk.push(t);
      j++;
    }
    return { text: chunk.join(" "), next: j };
  }

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed === "") {
      if (blankIsPageBreak(lines, i)) {
        i++;
        continue;
      }
      flushParagraph();
      i++;
      continue;
    }

    if (isHeadingLine(trimmed) && !isListMarker(trimmed)) {
      flushParagraph();
      blocks.push({ type: "heading", text: trimmed });
      i++;
      continue;
    }

    const numInlineMatch = NUM_INLINE.exec(trimmed);
    // Only treat "N." as the start of a real list when it begins at 1 --
    // an isolated "2. Some Section Title" without a preceding "1." is a
    // numbered section heading, not a list item.
    const startsOrderedList = trimmed === "1." || (numInlineMatch !== null && numInlineMatch[1] === "1");
    const startsUnorderedList = BULLET_ALONE.test(trimmed) || BULLET_INLINE.test(trimmed) || DASH_INLINE.test(trimmed);

    if (startsOrderedList || startsUnorderedList) {
      flushParagraph();
      const listType: "ol" | "ul" = startsOrderedList ? "ol" : "ul";
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        let m: RegExpExecArray | null;
        if (listType === "ol" && NUM_ALONE.test(t)) {
          const r = consumeItem(i + 1, null);
          items.push(r.text);
          i = r.next;
        } else if (listType === "ol" && (m = NUM_INLINE.exec(t))) {
          const r = consumeItem(i + 1, m[2]);
          items.push(r.text);
          i = r.next;
        } else if (listType === "ul" && BULLET_ALONE.test(t)) {
          const r = consumeItem(i + 1, null);
          items.push(r.text);
          i = r.next;
        } else if (listType === "ul" && (m = BULLET_INLINE.exec(t))) {
          const r = consumeItem(i + 1, m[1]);
          items.push(r.text);
          i = r.next;
        } else if (listType === "ul" && (m = DASH_INLINE.exec(t))) {
          const r = consumeItem(i + 1, m[1]);
          items.push(r.text);
          i = r.next;
        } else {
          break;
        }
      }
      blocks.push({ type: listType, items });
      continue;
    }

    buf.push(trimmed);
    if (/\.$/.test(trimmed) && buf.join(" ").length >= 220) {
      flushParagraph();
    }
    i++;
  }
  flushParagraph();
  return blocks;
}

// A clean plain-text rendering of the reflowed blocks -- real paragraphs and
// "- " list items instead of one-line-per-PDF-break fragments. Used as LLM
// context (e.g. for background notes) so the model reads coherent text
// instead of the raw extraction's broken lines.
export function formatTopicTextPlain(text: string): string {
  const blocks = formatTopicText(text);
  const lines: string[] = [];
  for (const b of blocks) {
    if (b.type === "heading" || b.type === "subheading" || b.type === "p") {
      lines.push(b.text);
    } else {
      for (const item of b.items) lines.push(`- ${item}`);
    }
  }
  return lines.join("\n");
}
