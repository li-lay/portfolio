"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { isTypingTarget } from "@/lib/keyboard";
import { onOpenHelp, openHelp } from "@/lib/palette";

// The cheatsheet is pulled in on first use only, so it never lands in the
// first-load JS for any route.
const HelpModal = dynamic(() => import("./HelpModal"), { ssr: false });

export default function HelpLauncher() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // `help` in the command palette, and the statusline's `? help` button.
  useEffect(() => onOpenHelp(() => setOpen(true)), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "?") return;
      if (isTypingTarget(event.target)) return;
      // Another dialog (palette, vim) owns the screen; `?` is theirs.
      if (document.querySelector('[role="dialog"]') !== null) return;
      event.preventDefault();
      openHelp();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return open ? <HelpModal onClose={close} /> : null;
}
