"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isTypingTarget } from "@/lib/keyboard";

// Workspace-level hotkeys. Deliberately tiny and always mounted, so it stays
// in the shared layout chunk rather than becoming a lazy dialog bundle.

const SCROLL_STEP = 120;

/** Key 1–4 → workspace route. Missing entries are not workspace keys. */
function routeFor(key: string): string | null {
  switch (key) {
    case "1":
      return "/";
    case "2":
      return "/about";
    case "3":
      return "/projects";
    case "4":
      return "/contact";
    default:
      return null;
  }
}

export default function KeyboardNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Leave every modified chord (tab switching, devtools, …) alone.
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      // The palette / vim / help dialogs own the keyboard while open.
      if (document.querySelector('[role="dialog"]') !== null) return;

      const route = routeFor(event.key);
      if (route) {
        if (pathname !== route) {
          event.preventDefault();
          router.push(route);
          // Next also resets scroll on navigation; doing it here keeps the
          // keystroke instant and is idempotent when Next lands at the top too.
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "auto" });
          }
        }
        return;
      }

      if (event.key === "j" || event.key === "k") {
        const scroller = document.scrollingElement;
        if (!scroller) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches;
        // No preventDefault: these are navigation conveniences, not a mode.
        scroller.scrollBy({
          top: event.key === "j" ? SCROLL_STEP : -SCROLL_STEP,
          behavior: reduced ? "auto" : "smooth",
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router]);

  return null;
}
