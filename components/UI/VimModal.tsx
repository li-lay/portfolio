"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

// `:vim` easter egg. Loaded only from the command palette, with ssr disabled.
// It edits an in-memory copy of the page text — the real DOM is never touched.

const FILENAME = "~/index.txt";
const MAX_LINES = 200;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const FALLBACK = [
  "vim — the editor you cannot quit.",
  "",
  "i   insert text",
  ":   command",
  "esc close",
];

type Mode = "normal" | "insert";
type Buffer = { lines: string[]; line: number; col: number };
type Message = { id: number; text: string };

function captureBuffer(): string[] {
  const main =
    typeof document === "undefined" ? null : document.querySelector("main");
  const text = main instanceof HTMLElement ? main.innerText : "";

  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .slice(0, MAX_LINES);

  // Drop the blank margins the page layout leaves around the real content.
  while (lines.length > 0 && !lines[0]) lines.shift();
  while (lines.length > 0 && !lines[lines.length - 1]) lines.pop();

  return lines.length > 0 ? lines : FALLBACK;
}

function clampCol(line: string, col: number, mode: Mode): number {
  const max = mode === "insert" ? line.length : Math.max(0, line.length - 1);
  return Math.max(0, Math.min(col, max));
}

export default function VimModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLPreElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const [buffer, setBuffer] = useState<Buffer>(() => ({
    lines: captureBuffer(),
    line: 0,
    col: 0,
  }));
  const [mode, setMode] = useState<Mode>("normal");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const promptOpen = prompt !== null;

  const focusEditor = useCallback(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  // Lock the page behind the overlay and hand focus back on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    // Focus immediately: a background/throttled tab may never fire rAF.
    focusEditor();
    const frame = requestAnimationFrame(() => focusEditor());

    return () => {
      cancelAnimationFrame(frame);
      body.style.overflow = previousOverflow;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [focusEditor]);

  // `E492: …` flashes for ~1.5s, like a real status line.
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 1500);
    return () => window.clearTimeout(timer);
  }, [message]);

  // Keep the caret visible inside the editor viewport. Offsets are computed
  // against the `<pre>` box and assigned to its scrollTop/scrollLeft directly,
  // so neither the page nor the overlay scrolls. `buffer` changes on every
  // normal-mode move and insert-mode edit (line, col, and text), so this runs
  // after each of them.
  useEffect(() => {
    const editor = editorRef.current;
    const caret = caretRef.current;
    if (!editor || !caret) return;

    const caretBox = caret.getBoundingClientRect();
    const box = editor.getBoundingClientRect();

    if (caretBox.top < box.top) {
      editor.scrollTop -= box.top - caretBox.top;
    } else if (caretBox.bottom > box.bottom) {
      editor.scrollTop += caretBox.bottom - box.bottom;
    }

    if (caretBox.left < box.left) {
      editor.scrollLeft -= box.left - caretBox.left;
    } else if (caretBox.right > box.right) {
      editor.scrollLeft += caretBox.right - box.right;
    }
  }, [buffer]);

  useEffect(() => {
    if (!promptOpen) return;
    promptRef.current?.focus();
    const frame = requestAnimationFrame(() => promptRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [promptOpen]);

  const fail = useCallback((text: string) => {
    setMessage((prev) => ({ id: (prev?.id ?? 0) + 1, text }));
  }, []);

  const execute = useCallback(
    (raw: string) => {
      const command = raw.trim();
      if (!command) {
        setPrompt(null);
        setMode("normal");
        focusEditor();
        return;
      }

      if (command === "q" || command === "q!") {
        onClose();
        return;
      }

      setPrompt(null);
      setMode("normal");
      fail(`E492: Not an editor command: ${command}`);
      focusEditor();
    },
    [fail, focusEditor, onClose],
  );

  const move = useCallback((dx: number, dy: number) => {
    setBuffer((prev) => {
      const line = Math.max(0, Math.min(prev.lines.length - 1, prev.line + dy));
      const text = prev.lines[line] ?? "";
      const col =
        dx === 0
          ? clampCol(text, prev.col, "normal")
          : clampCol(text, prev.col + dx, "normal");
      return { ...prev, line, col };
    });
  }, []);

  const enterInsert = useCallback(() => {
    setMode("insert");
    setBuffer((prev) => ({
      ...prev,
      col: clampCol(prev.lines[prev.line] ?? "", prev.col, "insert"),
    }));
  }, []);

  const exitInsert = useCallback(() => {
    setMode("normal");
    setBuffer((prev) => ({
      ...prev,
      col: clampCol(prev.lines[prev.line] ?? "", prev.col, "normal"),
    }));
  }, []);

  const insertText = useCallback((text: string) => {
    setBuffer((prev) => {
      const lines = [...prev.lines];
      const line = lines[prev.line] ?? "";
      const col = Math.min(prev.col, line.length);
      lines[prev.line] = line.slice(0, col) + text + line.slice(col);
      return { lines, line: prev.line, col: col + text.length };
    });
  }, []);

  const insertNewline = useCallback(() => {
    setBuffer((prev) => {
      if (prev.lines.length >= MAX_LINES) return prev;

      const lines = [...prev.lines];
      const line = lines[prev.line] ?? "";
      const col = Math.min(prev.col, line.length);
      lines[prev.line] = line.slice(0, col);
      lines.splice(prev.line + 1, 0, line.slice(col));
      return { lines, line: prev.line + 1, col: 0 };
    });
  }, []);

  const backspace = useCallback(() => {
    setBuffer((prev) => {
      const lines = [...prev.lines];
      const line = lines[prev.line] ?? "";
      const col = Math.min(prev.col, line.length);

      if (col > 0) {
        lines[prev.line] = line.slice(0, col - 1) + line.slice(col);
        return { lines, line: prev.line, col: col - 1 };
      }

      if (prev.line === 0) return prev;

      const previousLine = lines[prev.line - 1] ?? "";
      lines[prev.line - 1] = previousLine + line;
      lines.splice(prev.line, 1);
      return { lines, line: prev.line - 1, col: previousLine.length };
    });
  }, []);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // The command prompt owns its own keys (see the input handler below).
    if (event.target instanceof HTMLInputElement) return;

    if (event.key === "Tab") {
      // Focus trap: the dialog and its close button are the only stops.
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.tabIndex !== -1 && node.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key;

    if (key === "Escape") {
      event.preventDefault();
      if (mode === "insert") {
        exitInsert();
        return;
      }
      onClose();
      return;
    }

    if (mode === "normal") {
      switch (key) {
        case "h":
        case "ArrowLeft":
          event.preventDefault();
          move(-1, 0);
          return;
        case "l":
        case "ArrowRight":
          event.preventDefault();
          move(1, 0);
          return;
        case "j":
        case "ArrowDown":
          event.preventDefault();
          move(0, 1);
          return;
        case "k":
        case "ArrowUp":
          event.preventDefault();
          move(0, -1);
          return;
        case "i":
          event.preventDefault();
          enterInsert();
          return;
        case ":":
          event.preventDefault();
          setMessage(null);
          setPrompt("");
          return;
        default:
          return;
      }
    }

    if (key === "Enter") {
      event.preventDefault();
      insertNewline();
      return;
    }

    if (key === "Backspace") {
      event.preventDefault();
      backspace();
      return;
    }

    if (key.length === 1) {
      event.preventDefault();
      insertText(key);
    }
  };

  const live = `-- ${mode.toUpperCase()} --`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-bg-hard/80 p-4 pt-[10vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="vim"
        aria-describedby="vim-help"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-pane border-2 border-bg3 bg-bg0 font-mono shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between gap-2 border-b-2 border-bg3 bg-bg2/40 px-2 py-1.5">
          <span className="min-w-0 truncate text-sm text-gray">
            vim <span aria-hidden="true">·</span>{" "}
            <span className="text-fg1">{FILENAME}</span>
          </span>
          <button
            type="button"
            aria-label="Close vim"
            onClick={onClose}
            className="-my-1 -mr-1 cursor-pointer rounded-pane px-1 leading-none text-gray transition-colors hover:text-yellow focus-visible:text-yellow"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <pre
          ref={editorRef}
          aria-hidden="true"
          className="max-h-[56vh] min-h-[40vh] overflow-auto overscroll-contain p-3 text-[13px] leading-[1.45] whitespace-pre text-fg1"
        >
          {buffer.lines.map((line, i) => (
            <div key={i} className="min-h-[1.45em]">
              {i === buffer.line ? (
                <>
                  {line.slice(0, buffer.col)}
                  {mode === "insert" ? (
                    <span ref={caretRef} className="vim-caret-insert">
                      {line.charAt(buffer.col) || " "}
                    </span>
                  ) : (
                    <span ref={caretRef} className="vim-caret">
                      {line.charAt(buffer.col) || " "}
                    </span>
                  )}
                  {line.slice(buffer.col + 1)}
                </>
              ) : (
                line || " "
              )}
            </div>
          ))}
        </pre>

        {promptOpen && (
          <div className="flex items-center gap-1 border-t-2 border-bg3 bg-bg0 px-3 py-1.5 text-sm text-fg1">
            <span aria-hidden="true" className="text-yellow">
              :
            </span>
            <input
              ref={promptRef}
              value={prompt ?? ""}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setPrompt(null);
                  setMode("normal");
                  focusEditor();
                  return;
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  execute(prompt ?? "");
                }
              }}
              aria-label="vim command"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-fg0 caret-yellow outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t-2 border-bg3 bg-bg1 px-2 py-1 text-xs text-fg1">
          <span
            className={`shrink-0 ${mode === "insert" ? "text-aqua" : "text-green"}`}
          >
            -- {mode.toUpperCase()} --
          </span>
          {message ? (
            <span
              role="status"
              aria-live="polite"
              className="min-w-0 truncate text-red"
            >
              {message.text}
            </span>
          ) : (
            <span className="min-w-0 truncate text-gray">
              {FILENAME} <span aria-hidden="true">·</span> {buffer.line + 1}:
              {buffer.col + 1}
            </span>
          )}
        </div>

        <p id="vim-help" className="sr-only">
          vim easter egg. use h j k l to move the cursor, i to insert, colon for
          commands, escape to close.
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {live}
        </p>
      </div>
    </div>
  );
}
