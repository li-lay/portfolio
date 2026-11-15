"use client";

import { useEffect } from "react";
import {
  applyStoredLayout,
  isLayoutUnlocked,
  readPanePositions,
  setPanePosition,
  type PanePositions,
} from "@/lib/layout";

// One delegated pointer handler for every pane header on the page. Mounted once
// from the root layout; renders nothing.
//
// Only the header (the row that owns `[data-window-controls]`) is a handle, so
// links, text selection and the 3D canvas keep working untouched.

const PANE_SELECTOR = "[data-pane]";
const HEADER_SELECTOR = "[data-pane-header]";
const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, [contenteditable='true']";

function paneId(pane: HTMLElement): string {
  return pane.dataset.paneId ?? pane.getAttribute("aria-label") ?? "";
}

function isDesktop(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(min-width: 768px)").matches
  );
}

/** Touch / coarse input never gets a drag handle. */
function hasFinePointer(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(pointer: coarse)").matches
  );
}

/** The pane currently being dragged, so background syncs leave it alone. */
let dragging: HTMLElement | null = null;
let pending = 0;

function syncPositions() {
  if (typeof document === "undefined") return;

  const positions: PanePositions =
    isLayoutUnlocked() && isDesktop() ? readPanePositions() : {};

  for (const pane of document.querySelectorAll<HTMLElement>(PANE_SELECTOR)) {
    if (pane === dragging) continue;

    const position = positions[paneId(pane)];
    const value = position
      ? `translate(${position.x}px, ${position.y}px)`
      : "";
    if (pane.style.transform !== value) pane.style.transform = value;
  }
}

function scheduleSync() {
  if (typeof window === "undefined" || pending) return;
  // A timeout rather than rAF: background tabs throttle animation frames, and
  // positions must still land after client-side navigation there.
  pending = window.setTimeout(() => {
    pending = 0;
    syncPositions();
  }, 16);
}

/** Drags one pane by its header until pointerup / pointercancel. */
function beginDrag(
  pane: HTMLElement,
  header: HTMLElement,
  id: string,
  event: PointerEvent,
) {
  const start = readPanePositions()[id] ?? { x: 0, y: 0 };
  const startX = event.clientX;
  const startY = event.clientY;
  let x = start.x;
  let y = start.y;
  let moved = false;

  const previousZ = pane.style.zIndex;
  dragging = pane;
  pane.style.zIndex = "30";
  pane.style.willChange = "transform";
  header.style.cursor = "grabbing";
  document.documentElement.classList.add("pane-dragging");

  try {
    header.setPointerCapture(event.pointerId);
  } catch {
    // The pointer may be gone already; the up event still arrives.
  }

  const transform = (value: { x: number; y: number } | null) => {
    pane.style.transform = value
      ? `translate(${value.x}px, ${value.y}px)`
      : "";
  };

  const move = (moveEvent: PointerEvent) => {
    if (moveEvent.pointerId !== event.pointerId) return;
    x = Math.round(start.x + moveEvent.clientX - startX);
    y = Math.round(start.y + moveEvent.clientY - startY);
    moved = true;
    transform({ x, y });
  };

  const up = (upEvent: PointerEvent) => {
    if (upEvent.pointerId !== event.pointerId) return;
    finish(true);
  };

  const cancel = (cancelEvent: PointerEvent) => {
    if (cancelEvent.pointerId !== event.pointerId) return;
    finish(false);
  };

  const finish = (commit: boolean) => {
    header.removeEventListener("pointermove", move);
    header.removeEventListener("pointerup", up);
    header.removeEventListener("pointercancel", cancel);

    try {
      if (header.hasPointerCapture(event.pointerId)) {
        header.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Capture already released.
    }

    header.style.cursor = "";
    pane.style.willChange = "";
    pane.style.zIndex = previousZ;
    document.documentElement.classList.remove("pane-dragging");
    dragging = null;

    if (commit && moved) setPanePosition(id, { x, y });
    else if (!commit) transform(start.x || start.y ? start : null);
  };

  header.addEventListener("pointermove", move);
  header.addEventListener("pointerup", up);
  header.addEventListener("pointercancel", cancel);
}

export default function PaneDrag() {
  useEffect(() => {
    applyStoredLayout();
    syncPositions();

    // Panes come and go with client-side navigation, and the palette can flip
    // the layout attribute at any time.
    const bodyObserver = new MutationObserver(scheduleSync);
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    const rootObserver = new MutationObserver(scheduleSync);
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-layout"],
    });

    const desktopQuery = window.matchMedia("(min-width: 768px)");
    desktopQuery.addEventListener("change", scheduleSync);

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      if (event.pointerType === "touch") return;
      if (!isLayoutUnlocked() || !isDesktop() || !hasFinePointer()) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(INTERACTIVE_SELECTOR)) return;

      const header = target.closest<HTMLElement>(HEADER_SELECTOR);
      if (!header) return;

      const pane = header.closest<HTMLElement>(PANE_SELECTOR);
      if (!pane || pane.hidden) return;

      const id = paneId(pane);
      if (!id) return;

      event.preventDefault();
      beginDrag(pane, header, id, event);
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      bodyObserver.disconnect();
      rootObserver.disconnect();
      desktopQuery.removeEventListener("change", scheduleSync);
      document.removeEventListener("pointerdown", onPointerDown);
      if (pending) {
        window.clearTimeout(pending);
        pending = 0;
      }
    };
  }, []);

  return null;
}
