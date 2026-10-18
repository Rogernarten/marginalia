// Text helpers shared by the reader, the form and the notebook.
// Paragraphs come from Gutenberg with italics marked _like this_.

export type Run = { text: string; italic: boolean; noteId?: string };

/** Split a paragraph into runs of plain/italic text, tagging the ranges covered by notes. */
export function toRuns(paragraph: string, notes: { id: string; phrase: string }[]): Run[] {
  const ranges = notes
    .map((n) => ({ id: n.id, start: paragraph.indexOf(n.phrase), length: n.phrase.length }))
    .filter((r) => r.start >= 0)
    .sort((a, b) => a.start - b.start)
    .filter((r, i, all) => i === 0 || r.start >= all[i - 1].start + all[i - 1].length);

  const noteAt = (i: number) => ranges.find((r) => i >= r.start && i < r.start + r.length)?.id;

  const runs: Run[] = [];
  let italic = false;
  for (let i = 0; i < paragraph.length; i++) {
    const ch = paragraph[i];
    if (ch === "_") {
      italic = !italic;
      continue;
    }
    const noteId = noteAt(i);
    const last = runs.at(-1);
    if (last && last.italic === italic && last.noteId === noteId) last.text += ch;
    else runs.push({ text: ch, italic, noteId });
  }
  return runs;
}

export function plain(text: string) {
  return text.replace(/_/g, "");
}

/** Lowercase, straight quotes, single spaces, no italics or edge punctuation. */
export function normalize(text: string) {
  return plain(text)
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s"'.,;:!?()-]+|[\s"'.,;:!?()-]+$/g, "");
}

const ABBREVIATIONS = /\b(Mr|Mrs|Dr|St|Col|Capt)\.$/;

/** The sentence of `paragraph` that contains character `index`, without italics markers. */
export function sentenceAt(paragraph: string, index: number) {
  const ends: number[] = [];
  const boundary = /[.!?]+[”’"]?(?=\s+[“"‘A-Z])/g;
  for (const m of paragraph.matchAll(boundary)) {
    const end = m.index + m[0].length;
    if (!ABBREVIATIONS.test(paragraph.slice(0, end))) ends.push(end);
  }
  let start = 0;
  for (const end of ends) {
    if (index < end) return plain(paragraph.slice(start, end)).trim();
    start = end;
  }
  return plain(paragraph.slice(start)).trim();
}
