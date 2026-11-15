"use client";

import { closePane } from "@/lib/panes";

/**
 * The `×` in a pane header. Closes the closest `[data-pane]` section; the
 * restore chip it leaves behind lives in lib/panes.
 */
export default function PaneCloseButton() {
  return (
    <button
      type="button"
      aria-label="Close pane"
      onClick={(event) => closePane(event.currentTarget.closest("[data-pane]"))}
      className="-my-1 -mr-1 cursor-pointer rounded-pane px-1 leading-none text-gray transition-colors hover:text-yellow focus-visible:text-yellow"
    >
      <span aria-hidden="true">×</span>
    </button>
  );
}
