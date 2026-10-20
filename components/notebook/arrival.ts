// Set just before navigating to /notebook#word-ID. On a client navigation the notebook can
// render before the URL's hash updates, so the hash alone can't say which word to show.
let arriving: string | null = null;

export function showInNotebook(wordId: string) {
  arriving = wordId;
}

/** The word to scroll to on this visit: from showInNotebook(), or #word-ID in the URL. */
export function takeArrival() {
  const id = arriving ?? (window.location.hash.startsWith("#word-") ? window.location.hash.slice(6) : null);
  arriving = null;
  return id;
}
