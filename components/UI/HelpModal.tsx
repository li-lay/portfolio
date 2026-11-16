"use client";

import { useEffect, useRef } from "react";
import { isTypingTarget } from "@/lib/keyboard";

const ROWS = `Ctrl/⌘+K|command palette
:|command palette
?|this help
1 – 4|switch workspace
j / k|scroll down / up
:vim|vim easter egg
Esc|close dialogs (vim: insert first)
x|close help
Konami ↑↑↓↓←→←→BA|toggle theme
unlock layout|drag panes (desktop)
×|close pane`.split("\n").map((r) => r.split("|"));

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    // Esc closes; so do `x`/`X`, unless the event came from a field.
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k !== "Escape" && k !== "x" && k !== "X") return;
      if (k !== "Escape" && isTypingTarget(e.target)) return;
      e.preventDefault();
      onClose();
    };
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      if (back?.isConnected) back.focus();
    };
  }, [onClose]);

  return (
    <div onMouseDown={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-[65] flex justify-center bg-bg-hard/80 p-4 pt-[16vh]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shortcuts"
        onKeyDown={(e) => e.key === "Tab" && (e.preventDefault(), closeRef.current?.focus())}
        className="h-fit w-full max-w-md rounded-pane border-2 border-bg3 bg-bg1 font-mono"
      >
        <div className="flex justify-between border-b-2 border-bg3 bg-bg2/40 px-3 py-1">
          <h2 className="text-sm text-gray">~/shortcuts</h2>
          <button ref={closeRef} type="button" aria-label="Close help" onClick={onClose} className="px-1 text-gray hover:text-yellow focus-visible:text-yellow">×</button>
        </div>
        <table className="w-full text-sm"><tbody>
          {ROWS.map(([key, action]) => (
            <tr key={key} className="border-t border-bg3">
              <th className="px-3 py-1 text-left text-yellow">{key}</th>
              <td className="px-3 py-1 text-right text-fg1">{action}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}
