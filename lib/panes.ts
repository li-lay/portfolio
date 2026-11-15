// Pane close / restore, shared by the × button in every pane header and by the
// command palette's `close pane`. State lives only for the current page load.
//
// The restore chip is a plain DOM singleton (a real <button>) so the palette —
// which itself unmounts whenever it is closed — does not have to own it.

const CHIP_SELECTOR = "button.pane-restore-chip";
const PANE_SELECTOR = "[data-pane]";

let observer: MutationObserver | null = null;
let frame = 0;

function closedPanes(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(`${PANE_SELECTOR}[hidden]`),
  );
}

function chip(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(CHIP_SELECTOR);
}

function syncChip() {
  if (typeof document === "undefined" || !document.body) return;

  const count = closedPanes().length;
  let el = chip();

  if (count === 0) {
    el?.remove();
    return;
  }

  if (!el) {
    el = document.createElement("button");
    el.type = "button";
    el.className = "pane-restore-chip";
    el.addEventListener("click", restorePanes);
    document.body.appendChild(el);
  }

  const label = `${count} pane${count === 1 ? "" : "s"} closed · restore`;
  if (el.textContent !== label) el.textContent = label;
}

function scheduleSync() {
  if (typeof window === "undefined" || frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    syncChip();
  });
}

/** Watches for panes leaving the DOM (client-side navigation) so no chip lingers. */
function watch() {
  if (observer || typeof MutationObserver === "undefined" || !document.body)
    return;
  observer = new MutationObserver(scheduleSync);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden"],
  });
}

export function closePane(pane: Element | null | undefined) {
  if (!(pane instanceof HTMLElement) || typeof document === "undefined") return;

  watch();
  const hadFocus = pane.contains(document.activeElement);
  pane.hidden = true;
  syncChip();
  if (hadFocus) chip()?.focus();
}

/** Closes the last pane still visible on the page. Returns false if none. */
export function closeLastPane(): boolean {
  if (typeof document === "undefined") return false;

  const visible = Array.from(
    document.querySelectorAll<HTMLElement>(PANE_SELECTOR),
  ).filter((pane) => !pane.hidden);
  const last = visible[visible.length - 1];
  if (!last) return false;

  closePane(last);
  return true;
}

export function restorePanes() {
  if (typeof document === "undefined") return;

  const closed = closedPanes();
  for (const pane of closed) pane.hidden = false;

  // Keep the keyboard where the user was: the chip disappears on restore.
  chip()?.remove();
  if (closed.length > 0) {
    const first = closed[0];
    first.setAttribute("tabindex", "-1");
    first.focus({ preventScroll: true });
  }
}
