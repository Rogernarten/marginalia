"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { Note } from "@/lib/notes/types";
import { findWord, useSaved } from "@/lib/storage";
import { toRuns } from "@/lib/text";
import { Legend } from "./legend";
import { NoteCard } from "./note-card";
import { arrivalTarget, jumpTo, useReadingPosition } from "./reading-position";
import { useMediaQuery } from "./use-media-query";

/**
 * A chapter with its underlined words. Opening a word shows its note in the margin on wide
 * screens, or in a bottom sheet on small ones. Esc or × closes it and returns focus to the word.
 *
 * With `resumable`, reopening the chapter you stopped in offers to jump back to your paragraph,
 * unless you arrived with #p-N (Continue links), which jumps straight there.
 */
export function Reader({
  chapter,
  paragraphs,
  notes,
  heading,
  after,
  resumable = false,
}: {
  chapter: number;
  paragraphs: string[];
  notes: Note[];
  heading: React.ReactNode;
  after?: React.ReactNode;
  resumable?: boolean;
}) {
  const saved = useSaved();
  const wide = useMediaQuery("(min-width: 64rem)");
  const [activeId, setActiveId] = useState<string | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  useReadingPosition(chapter);

  // Decided once, when saved data first arrives, so the offer doesn't chase the reader's scroll.
  // No offer when this visit already opens at a paragraph (a Continue link).
  const [resumeAt, setResumeAt] = useState<number | null | undefined>(undefined);
  if (saved && resumeAt === undefined) {
    const p = saved.position;
    const offer = resumable && p?.chapter === chapter && p.paragraph > 1 && arrivalTarget(chapter) === null;
    setResumeAt(offer ? p.paragraph : null);
  }

  const byParagraph = useMemo(() => {
    const map = new Map<number, Note[]>();
    for (const n of notes) map.set(n.paragraph, [...(map.get(n.paragraph) ?? []), n]);
    return map;
  }, [notes]);
  const active = notes.find((n) => n.id === activeId) ?? null;

  function open(note: Note, el: HTMLElement) {
    trigger.current = el;
    setActiveId(note.id);
  }

  function close() {
    setActiveId(null);
    trigger.current?.focus();
  }

  // Show or hide the bottom sheet, and move focus to the note's heading.
  useEffect(() => {
    const dialog = sheet.current;
    if (!wide && dialog) {
      if (active && !dialog.open) dialog.showModal();
      if (!active && dialog.open) dialog.close();
    }
    if (active) headingRef.current?.focus();
  }, [active, wide]);

  // Esc closes the margin note wherever focus is (the dialog handles Esc itself).
  useEffect(() => {
    if (!active || !wide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setActiveId(null);
      trigger.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, wide]);

  const card = active && (
    <NoteCard
      key={active.id}
      note={active}
      chapter={chapter}
      paragraph={paragraphs[active.paragraph]}
      headingRef={headingRef}
      onClose={close}
    />
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,38rem)_20rem] lg:gap-16">
      <article className="min-w-0">
        {heading}
        {resumeAt != null && (
          <Notice className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span>You stopped at paragraph {resumeAt + 1} of this chapter.</span>
            <Button
              variant="secondary"
              onClick={() => {
                setResumeAt(null);
                requestAnimationFrame(() => jumpTo(chapter, resumeAt));
              }}
            >
              Jump there
            </Button>
          </Notice>
        )}
        {notes.length > 0 && <Legend className="mb-8 rounded-lg border border-rule bg-surface p-4 lg:hidden" />}
        <div data-chapter={chapter} className="font-serif text-[1.1875rem] leading-[1.75]">
          {paragraphs.map((text, i) => (
            <Paragraph
              key={i}
              index={i}
              text={text}
              notes={byParagraph.get(i) ?? []}
              activeId={activeId}
              isSaved={(phrase) => !!saved && !!findWord(saved, phrase)}
              onOpen={open}
            />
          ))}
        </div>
        {after}
      </article>

      <aside aria-label="Notes" className="hidden lg:block">
        <div className="sticky top-6 rounded-lg border border-rule bg-surface p-5">
          {wide && card ? (
            card
          ) : (
            <>
              <p className="eyebrow">In the margin</p>
              <p className="mt-2 font-serif text-lg leading-snug">
                {notes.length > 0
                  ? "Tap an underlined word to see what it meant in 1813."
                  : "Guide notes cover Chapters 1 to 3."}
              </p>
              {notes.length > 0 && <Legend className="mt-4" />}
              <p className="mt-4 font-sans text-sm text-muted">Using a keyboard? Tab to a word and press Enter.</p>
            </>
          )}
        </div>
      </aside>

      {!wide && (
        <dialog
          ref={sheet}
          className="sheet"
          aria-labelledby={active ? `${active.id}-heading` : undefined}
          onClose={() => activeId && close()}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          {card}
        </dialog>
      )}
    </div>
  );
}

function Paragraph({
  index,
  text,
  notes,
  activeId,
  isSaved,
  onOpen,
}: {
  index: number;
  text: string;
  notes: Note[];
  activeId: string | null;
  isSaved: (phrase: string) => boolean;
  onOpen: (note: Note, el: HTMLElement) => void;
}) {
  const runs = toRuns(text, notes);
  const parts: React.ReactNode[] = [];

  // Group consecutive runs that belong to the same note into one underlined word.
  for (let i = 0; i < runs.length; ) {
    const noteId = runs[i].noteId;
    let j = i;
    while (j < runs.length && runs[j].noteId === noteId) j++;
    const inner = runs.slice(i, j).map((r, k) => (r.italic ? <em key={k}>{r.text}</em> : r.text));
    const note = noteId ? notes.find((n) => n.id === noteId) : undefined;
    if (note) {
      parts.push(
        <NoteWord
          key={i}
          note={note}
          active={activeId === note.id}
          saved={isSaved(note.phrase)}
          onOpen={onOpen}
        >
          {inner}
        </NoteWord>,
      );
    } else {
      parts.push(<Fragment key={i}>{inner}</Fragment>);
    }
    i = j;
  }

  return (
    <p id={`p-${index}`} data-paragraph={index} className="mb-5 scroll-mt-24">
      {parts}
    </p>
  );
}

// A span with role="button" rather than <button>, so long phrases wrap across lines like text.
function NoteWord({
  note,
  active,
  saved,
  onOpen,
  children,
}: {
  note: Note;
  active: boolean;
  saved: boolean;
  onOpen: (note: Note, el: HTMLElement) => void;
  children: React.ReactNode;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      className="note-word"
      data-kind={note.kind}
      data-saved={saved}
      aria-expanded={active}
      onClick={(e) => onOpen(note, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(note, e.currentTarget);
        }
      }}
    >
      {children}
    </span>
  );
}
