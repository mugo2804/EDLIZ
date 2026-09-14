import { EDLIZ_CHAPTERS, type EdlizChapter, type EdlizSection } from "@/lib/edlizData";

export type Topic = {
  id: string;
  index: number;
  chapterIndex: number;
  chapterTitle: string;
  sectionTitle: string;
  text: string;
};

export type ChapterGroup = {
  chapterIndex: number;
  chapterTitle: string;
  topics: Topic[];
};

function makeId(chapterIndex: number, sectionIndex: number): string {
  return `c${chapterIndex}-s${sectionIndex}`;
}

function cleanChapterTitle(title: string): string {
  return title.replace(/^\d+\.\s*/, "").trim();
}

function buildTopics(): Topic[] {
  const topics: Topic[] = [];
  let runningIndex = 0;

  EDLIZ_CHAPTERS.forEach((chapter: EdlizChapter, chapterIndex: number) => {
    chapter.subsections.forEach((section: EdlizSection, sectionIndex: number) => {
      const text = section.text.trim();
      if (!text) return;

      // A handful of chapters in the source extraction have a single
      // subsection that just echoes the chapter's own heading + a short
      // list of sub-headings (an artifact of the PDF's table of contents
      // being mis-bookmarked as content) rather than real guidance. Skip
      // those short echoes; real chapter content that happens to live in
      // one undivided subsection is long enough to survive this check.
      const isTocEcho =
        chapter.subsections.length === 1 &&
        section.longTitle.trim() === chapter.longTitle.trim() &&
        text.length < 700;
      if (isTocEcho) return;

      topics.push({
        id: makeId(chapterIndex, sectionIndex),
        index: runningIndex,
        chapterIndex,
        chapterTitle: cleanChapterTitle(chapter.longTitle),
        sectionTitle: section.longTitle.trim(),
        text,
      });
      runningIndex += 1;
    });
  });

  return topics;
}

export const TOPICS: Topic[] = buildTopics();

export const TOPICS_BY_ID: Map<string, Topic> = new Map(TOPICS.map((t) => [t.id, t]));

export function getTopic(id: string): Topic | undefined {
  return TOPICS_BY_ID.get(id);
}

export function getAdjacentTopics(id: string): { prev: Topic | null; next: Topic | null } {
  const topic = getTopic(id);
  if (!topic) return { prev: null, next: null };
  return {
    prev: topic.index > 0 ? TOPICS[topic.index - 1] : null,
    next: topic.index < TOPICS.length - 1 ? TOPICS[topic.index + 1] : null,
  };
}

export function groupByChapter(): ChapterGroup[] {
  const groups = new Map<number, ChapterGroup>();
  for (const topic of TOPICS) {
    let group = groups.get(topic.chapterIndex);
    if (!group) {
      group = { chapterIndex: topic.chapterIndex, chapterTitle: topic.chapterTitle, topics: [] };
      groups.set(topic.chapterIndex, group);
    }
    group.topics.push(topic);
  }
  return [...groups.values()].sort((a, b) => a.chapterIndex - b.chapterIndex);
}

export const TOTAL_TOPICS = TOPICS.length;
