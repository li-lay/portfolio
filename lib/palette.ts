// Tiny window-event bridge so the statusline (and anything else) can open the
// palette / help without importing the lazy dialog bundles.
//
// Both dialogs are mounted by small always-present launchers; the only thing
// shared here is the event names and the first-visit hint flag.

const OPEN_EVENT = "palette:open";
const HELP_EVENT = "palette:help";
const HINT_EVENT = "hint:seen";
const HINT_KEY = "hint-seen";

function emit(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name));
}

function subscribe(name: string, handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = () => handler();
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}

/** True once the shortcut hint has been dismissed (localStorage). */
export function hintSeen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Persists the hint dismissal and notifies subscribers. */
export function markHintSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HINT_KEY, "1");
  } catch {
    // Private mode / storage disabled: the hint just comes back next load.
  }
  emit(HINT_EVENT);
}

export function openPalette() {
  markHintSeen();
  emit(OPEN_EVENT);
}

export function onOpenPalette(handler: () => void): () => void {
  return subscribe(OPEN_EVENT, handler);
}

export function openHelp() {
  markHintSeen();
  emit(HELP_EVENT);
}

export function onOpenHelp(handler: () => void): () => void {
  return subscribe(HELP_EVENT, handler);
}

export function onHintSeen(handler: () => void): () => void {
  return subscribe(HINT_EVENT, handler);
}
