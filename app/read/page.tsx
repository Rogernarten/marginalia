import type { Metadata } from "next";
import Link from "next/link";
import { ContinueReading, HereBadge } from "@/components/reader/contents-progress";
import { cx, FOCUS } from "@/components/ui/cx";
import { getChapter } from "@/lib/book";
import { CHAPTER_COUNT } from "@/lib/chapters";
import { hasNotes } from "@/lib/notes";
import { plain } from "@/lib/text";

export const metadata: Metadata = { title: "Contents" };

function opening(n: number) {
  const first = plain(getChapter(n)[0]);
  return first.length > 90 ? `${first.slice(0, 90).replace(/\s+\S*$/, "")}…` : first;
}

export default function Contents() {
  const chapters = Array.from({ length: CHAPTER_COUNT }, (_, i) => i + 1);
  return (
    <div className="mx-auto max-w-[62rem] px-5 py-8 lg:py-12">
      <header className="mb-8 max-w-[38rem]">
        <p className="eyebrow">Pride and Prejudice · Jane Austen · 1813</p>
        <h1 className="mt-2 font-serif text-3xl">Contents</h1>
        <p className="mt-3 text-muted">Guide notes cover Chapters 1 to 3. Every chapter can be read in full.</p>
        <div className="mt-6">
          <ContinueReading />
        </div>
      </header>
      <ol className="max-w-[38rem] divide-y divide-rule border-y border-rule">
        {chapters.map((n) => (
          <li key={n}>
            <Link href={`/read/${n}`} className={cx("group flex items-baseline gap-4 rounded-sm py-3", FOCUS)}>
              <span className="w-24 shrink-0 font-sans text-sm font-medium group-hover:underline">Chapter {n}</span>
              <span className="min-w-0 flex-1 font-serif text-[1.0625rem] text-muted">{opening(n)}</span>
              <HereBadge chapter={n} />
              {hasNotes(n) && (
                <span className="shrink-0 rounded-full border border-edge px-2 py-0.5 font-sans text-xs">Guide notes</span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
