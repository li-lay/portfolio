// Opt-in draggable panes, mirroring lib/theme.ts: an optional
// `<html data-layout="unlocked">` attribute plus localStorage persistence.
// The attribute is absent (locked) by default.
//
// Positions are keyed by the pane's stable id (`data-pane-id`) and are only
// applied while the layout is unlocked on a desktop-sized, fine pointer.

export const LAYOUT_STORAGE_KEY = "layout-unlocked";
export const PANE_POSITIONS_KEY = "pane-positions";

export interface PanePosition {
  x: number;
  y: number;
}

export type PanePositions = Record<string, PanePosition>;

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** True when panes are currently draggable (`<html data-layout="unlocked">`). */
export function isLayoutUnlocked(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.layout === "unlocked";
}

/** Writes the attribute only; nothing is persisted. */
export function applyLayout(unlocked: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (unlocked) root.dataset.layout = "unlocked";
  else delete root.dataset.layout;
}

export function storedLayoutUnlocked(): boolean {
  return storage()?.getItem(LAYOUT_STORAGE_KEY) === "1";
}

/** Applies the persisted state without rewriting it. */
export function applyStoredLayout(): boolean {
  const unlocked = storedLayoutUnlocked();
  applyLayout(unlocked);
  return unlocked;
}

/** Persists and applies a new state; returns it. */
export function setLayoutUnlocked(unlocked: boolean): boolean {
  applyLayout(unlocked);
  try {
    storage()?.setItem(LAYOUT_STORAGE_KEY, unlocked ? "1" : "0");
  } catch {
    // Private mode / storage disabled: the toggle still works for this page.
  }
  return unlocked;
}

export function toggleLayout(): boolean {
  return setLayoutUnlocked(!isLayoutUnlocked());
}

/** Reads and validates the stored offsets; malformed data is ignored. */
export function readPanePositions(): PanePositions {
  const raw = storage()?.getItem(PANE_POSITIONS_KEY);
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const positions: PanePositions = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const { x, y } = value as { x?: unknown; y?: unknown };
      if (
        typeof x === "number" &&
        Number.isFinite(x) &&
        typeof y === "number" &&
        Number.isFinite(y)
      ) {
        positions[id] = { x, y };
      }
    }
    return positions;
  } catch {
    return {};
  }
}

export function setPanePosition(id: string, position: PanePosition) {
  const positions = readPanePositions();
  positions[id] = position;
  try {
    storage()?.setItem(PANE_POSITIONS_KEY, JSON.stringify(positions));
  } catch {
    // Storage full / disabled: the drag still applies for this page load.
  }
}

/** Drops every stored offset, re-locks the layout and resets live transforms. */
export function resetLayout() {
  if (typeof document === "undefined") return;

  try {
    storage()?.removeItem(PANE_POSITIONS_KEY);
  } catch {
    // Nothing to clear.
  }
  // Persist the locked state too, otherwise the unlock flag would re-apply the
  // (now empty) layout on the next load.
  setLayoutUnlocked(false);

  // Dropping a dragged pane's transform puts it back in flow, and that restored
  // layout may start above the current scroll offset: follow it back to the
  // top. `auto` keeps it instant, and the call is a no-op when already there.
  for (const pane of document.querySelectorAll<HTMLElement>("[data-pane]")) {
    pane.style.transform = "";
    pane.style.zIndex = "";
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}
