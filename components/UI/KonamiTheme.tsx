"use client";

import { useEffect } from "react";
import { isTypingTarget } from "@/lib/keyboard";
import { applyStoredTheme, toggleTheme } from "@/lib/theme";

// ↑ ↑ ↓ ↓ ← → ← → B A
const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function KonamiTheme() {
  useEffect(() => {
    applyStoredTheme();

    let cursor = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const key =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === SEQUENCE[cursor]) {
        cursor += 1;
        if (cursor === SEQUENCE.length) {
          cursor = 0;
          toggleTheme();
        }
      } else {
        cursor = key === SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
