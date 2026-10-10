import { notFound } from "next/navigation";
import { getTopic, TOPICS } from "@/lib/topics";
import { TopicPageClient } from "@/components/TopicPageClient";

// Pre-renders all 540 topics as static HTML at build time -- both for
// performance and so a service worker can genuinely cache "the guideline"
// rather than relying on a live per-request server render that doesn't
// exist offline.
export function generateStaticParams() {
  return TOPICS.map((t) => ({ id: t.id }));
}

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getTopic(id);
  if (!topic) notFound();

  return <TopicPageClient topic={topic} />;
}
