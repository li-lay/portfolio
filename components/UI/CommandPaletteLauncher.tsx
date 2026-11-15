"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { isTypingTarget } from "@/lib/keyboard";

// The palette (and its command list) is pulled in on first use only, so it
// never lands in the first-load JS for any route.
const CommandPalette = dynamic(() => import("./CommandPalette"), {
  ssr: false,
});

export default function CommandPaletteLauncher() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const show = useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) return;

      // The `:vim` easter egg owns the keyboard while it is open (`:` belongs
      // to its command prompt, not to us).
      if (
        document.querySelector('[role="dialog"][aria-label="vim"]') !== null
      ) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        show();
        return;
      }

      // `:` opens the palette, Neovim style — but never while typing in a field.
      if (event.key === ":" && !event.ctrlKey && !event.metaKey) {
        if (isTypingTarget(event.target)) return;
        event.preventDefault();
        show();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show]);

  if (!mounted) return null;

  return <CommandPalette open={open} onClose={close} />;
}
