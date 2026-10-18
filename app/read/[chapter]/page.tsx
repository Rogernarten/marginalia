import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterNav } from "@/components/reader/chapter-nav";
import { Reader } from "@/components/reader/reader";
import { TextLink } from "@/components/ui/button";
import { getChapter } from "@/lib/book";
import { CHAPTER_COUNT, isChapter } from "@/lib/chapters";
import { getNotes } from "@/lib/notes";

export function generateStaticParams() {
  return Array.from({ length: CHAPTER_COUNT }, (_, i) => ({ chapter: String(i + 1) }));
}

export async function generateMetadata({ params }: PageProps<"/read/[chapter]">): Promise<Metadata> {
  const { chapter } = await params;
  return { title: `Chapter ${chapter}` };
}

export default async function ChapterPage({ params }: PageProps<"/read/[chapter]">) {
  const { chapter } = await params;
  const n = Number(chapter);
  if (!isChapter(n) || String(n) !== chapter) notFound();

  return (
    <div className="mx-auto max-w-[62rem] px-5 py-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 font-sans text-sm">
        <ol className="flex items-center gap-2 text-muted">
          <li>
            <TextLink href="/read">Contents</TextLink>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Chapter {n}</li>
        </ol>
      </nav>
      <Reader
        chapter={n}
        paragraphs={getChapter(n)}
        notes={getNotes(n)}
        heading={<h1 className="mb-6 font-serif text-3xl">Chapter {n}</h1>}
        after={<ChapterNav chapter={n} />}
      />
    </div>
  );
}
