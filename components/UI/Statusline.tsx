"use client";

import { useEffect, useState } from "react";
import WorkspaceTabs from "./WorkspaceTabs";
import Clock from "./Clock";
import Uptime from "./Uptime";
import { hintSeen, onHintSeen, openHelp, openPalette } from "@/lib/palette";

const builtAt = process.env.NEXT_PUBLIC_BUILD_TIME ?? "";

const affordance =
  "cursor-pointer font-mono text-sm text-gray transition-colors hover:text-yellow focus-visible:text-yellow";

export default function Statusline() {
  const [hint, setHint] = useState(false);

  // Mount-only: the server HTML has no hint, so reading localStorage during
  // render would mismatch. Opening help or the palette clears it for good.
  useEffect(() => {
    if (hintSeen()) return;
    setHint(true);
    return onHintSeen(() => setHint(false));
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between gap-2 border-b-2 border-yellow-dim bg-bg-hard">
      <WorkspaceTabs />
      <div className="flex h-full min-w-0 shrink-0 items-center gap-2 whitespace-nowrap pr-2 sm:gap-3">
        <button
          type="button"
          onClick={openPalette}
          aria-label="Command palette (Ctrl+K)"
          className={affordance}
        >
          <span className="lg:hidden">^K</span>
          <span className="hidden lg:inline">^K palette</span>
        </button>
        <button
          type="button"
          onClick={openHelp}
          aria-label="Keyboard shortcuts"
          className={affordance}
        >
          <span className="lg:hidden">?</span>
          <span className="hidden lg:inline">? help</span>
        </button>
        {hint && (
          <span className="hidden min-w-0 truncate font-mono text-xs text-gray sm:inline">
            press ? for shortcuts
          </span>
        )}
        <Clock />
        <span className="inline-flex shrink-0 items-center whitespace-nowrap bg-green px-1.5 py-0.5 font-mono text-xs leading-none tabular-nums text-bg0 sm:text-sm">
          <Uptime builtAt={builtAt} className="tabular-nums" />
        </span>
      </div>
    </div>
  );
}
