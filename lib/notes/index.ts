import { chapter01 } from "./chapter-01";
import type { Note } from "./types";

const NOTES: Record<number, Note[]> = {
  1: chapter01,
};

export function getNotes(chapter: number): Note[] {
  return NOTES[chapter] ?? [];
}

export function hasNotes(chapter: number) {
  return getNotes(chapter).length > 0;
}
