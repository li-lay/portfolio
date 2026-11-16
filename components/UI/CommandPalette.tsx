"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { socialLinks } from "@/lib/content";
import {
  isLayoutUnlocked,
  resetLayout,
  toggleLayout,
} from "@/lib/layout";
import { closeLastPane } from "@/lib/panes";
import { openHelp } from "@/lib/palette";
import { currentTheme, toggleTheme, type Theme } from "@/lib/theme";

// The `:vim` easter egg is pulled in only when its command runs, so it never
// lands in any route's first-load JS (and this file's own chunk is lazy too).
const VimModal = dynamic(() => import("./VimModal"), { ssr: false });

type Command = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  /** Keep the palette open after running (inline confirmation commands). */
  keepOpen?: boolean;
  run: () => void;
};

const EMAIL = "contact@lilay.dev";
const LIST_ID = "command-palette-list";
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const optionId = (index: number) => `command-palette-option-${index}`;

/**
 * Substring first, ordered subsequence as a fallback ("gtp" → "go to
 * /projects"). Returns null when the haystack cannot match at all.
 */
function score(haystack: string, needle: string): number | null {
  if (!needle) return 0;

  const direct = haystack.indexOf(needle);
  if (direct !== -1) return 1000 - direct;

  let cursor = 0;
  let gaps = 0;
  for (const char of needle) {
    const hit = haystack.indexOf(char, cursor);
    if (hit === -1) return null;
    gaps += hit - cursor;
    cursor = hit + 1;
  }
  return 500 - gaps;
}

function openExternal(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>("gruvbox-dark");
  const [unlocked, setUnlocked] = useState(false);
  const [vimOpen, setVimOpen] = useState(false);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, []);

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      {
        id: "nav-home",
        label: "go to /",
        hint: "home",
        keywords: "navigate page start",
        run: () => router.push("/"),
      },
      {
        id: "nav-about",
        label: "go to /about",
        hint: "about",
        keywords: "navigate page profile neofetch",
        run: () => router.push("/about"),
      },
      {
        id: "nav-projects",
        label: "go to /projects",
        hint: "projects",
        keywords: "navigate page work",
        run: () => router.push("/projects"),
      },
      {
        id: "nav-contact",
        label: "go to /contact",
        hint: "contact",
        keywords: "navigate page reach channels",
        run: () => router.push("/contact"),
      },
      {
        id: "nav-sudo",
        label: "go to /sudo",
        hint: "403",
        keywords: "navigate page permission denied",
        run: () => router.push("/sudo"),
      },
      {
        id: "nav-log",
        label: "go to /log",
        hint: "git",
        keywords: "navigate page history commits timeline",
        run: () => router.push("/log"),
      },
      {
        id: "copy-email",
        label: "copy email",
        hint: EMAIL,
        keywords: "clipboard mail contact yank",
        keepOpen: true,
        run: () => {
          void copyEmail();
        },
      },
    ];

    // Socials, in authoring order. Email stays as the `copy email` action.
    for (const link of socialLinks) {
      if (link.name === "Email") continue;
      list.push({
        id: `social-${link.name}`,
        label: `open ${link.name} ↗`,
        hint: "social",
        keywords: "external profile contact link",
        run: () => openExternal(link.url),
      });
    }

    list.push(
      {
        id: "toggle-theme",
        label: "toggle theme",
        hint: theme === "gruvbox-light" ? "light" : "dark",
        keywords: "gruvbox light dark colour scheme konami",
        run: () => setTheme(toggleTheme()),
      },
      {
        id: "close-pane",
        label: "close pane",
        hint: "×",
        keywords: "hide window section",
        run: () => {
          closeLastPane();
        },
      },
      {
        id: "toggle-layout",
        label: unlocked ? "lock layout" : "unlock layout",
        hint: unlocked ? "static panes" : "drag panes",
        keywords: "draggable windows move position arrange",
        run: () => setUnlocked(toggleLayout()),
      },
      {
        id: "vim",
        label: ":vim",
        hint: "editor",
        keywords: "neovim easter egg modal buffer text",
        run: () => setVimOpen(true),
      },
      {
        id: "help",
        label: "help",
        hint: "?",
        keywords: "shortcuts keys keyboard cheatsheet",
        run: () => openHelp(),
      },
      {
        id: "reset-layout",
        label: "reset layout",
        hint: "restore",
        keywords: "restore windows panes positions clear",
        run: () => {
          resetLayout();
          setUnlocked(false);
        },
      },
    );

    return list;
  }, [copyEmail, router, theme, unlocked]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;

    return commands.filter((command) => {
      const haystack = [command.label, command.hint, command.keywords]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return score(haystack, needle) !== null;
    });
  }, [commands, query]);

  const selected = results.length ? Math.min(index, results.length - 1) : -1;

  // Keep the active option inside the list's own scroll box. Computing the
  // offsets by hand (instead of scrollIntoView) guarantees the page behind the
  // dialog never scrolls, and wrap-around arrows bring the new row into view
  // because the effect follows `selected`. `query` re-runs it so a filtered
  // list whose scrollTop survived the last keystroke snaps back to its active
  // row.
  useEffect(() => {
    if (!open || selected < 0) return;

    const option = optionRefs.current[selected];
    const container = listRef.current;
    if (!option || !container) return;

    const item = option.getBoundingClientRect();
    const box = container.getBoundingClientRect();

    if (item.top < box.top) {
      container.scrollTop -= box.top - item.top;
    } else if (item.bottom > box.bottom) {
      container.scrollTop += item.bottom - box.bottom;
    }
  }, [open, selected, query]);

  const runCommand = useCallback(
    (command: Command) => {
      if (!command.keepOpen) onClose();
      command.run();
    },
    [onClose],
  );

  // Reset the prompt on every open, focus the input, and hand focus back to
  // whatever had it when the palette closes.
  useEffect(() => {
    if (!open) return;

    setQuery("");
    setIndex(0);
    setCopied(false);
    setTheme(currentTheme());
    setUnlocked(isLayoutUnlocked());

    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [open]);

  // Escape is handled at the window so it still closes if focus ever lands
  // outside the dialog (e.g. the focused row was removed).
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex(results.length ? (selected + 1) % results.length : 0);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex(
        results.length ? (selected - 1 + results.length) % results.length : 0,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const command = results[selected];
      if (command) runCommand(command);
      return;
    }

    if (event.key === "Tab") {
      // Focus trap: the input is normally the only tab stop, so Tab wraps back
      // to it instead of escaping into the page behind the dialog.
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.tabIndex !== -1);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const palette = open ? (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-bg-hard/70 p-4 pt-[14vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-pane border-2 border-bg3 bg-bg1 shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b-2 border-bg3 bg-bg2/40 px-3 py-2">
          <span aria-hidden="true" className="font-mono text-base text-green">
            :
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
              setCopied(false);
            }}
            role="combobox"
            aria-label="Command"
            aria-expanded="true"
            aria-controls={LIST_ID}
            aria-activedescendant={
              selected >= 0 ? optionId(selected) : undefined
            }
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder="type a command…"
            className="min-w-0 flex-1 bg-transparent font-mono text-base text-fg0 caret-yellow outline-none placeholder:text-gray"
          />
        </div>

        {results.length === 0 && (
          <p className="px-3 py-3 font-mono text-sm text-gray">
            no matching command
          </p>
        )}

        <ul
          ref={listRef}
          id={LIST_ID}
          role="listbox"
          aria-label="Commands"
          className="max-h-[46vh] overflow-y-auto py-1"
        >
          {results.map((command, i) => (
            <li
              key={command.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === selected}
              ref={(node) => {
                optionRefs.current[i] = node;
              }}
              onMouseEnter={() => setIndex(i)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runCommand(command)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 font-mono text-sm ${
                i === selected ? "bg-yellow text-bg0" : "text-fg1"
              }`}
            >
              <span className="min-w-0 truncate">{command.label}</span>
              {command.hint && (
                <span
                  className={`shrink-0 text-xs ${
                    i === selected ? "text-bg0/80" : "text-gray"
                  }`}
                >
                  {command.id === "copy-email" && copied
                    ? "copied!"
                    : command.hint}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-2 border-t-2 border-bg3 bg-bg2/40 px-3 py-1.5 font-mono text-xs text-gray">
          <span aria-hidden="true">↑↓ move · ↵ run · esc close</span>
          <span aria-live="polite">
            {copied ? "copied to clipboard" : `${results.length} cmds`}
          </span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {palette}
      {vimOpen && <VimModal onClose={() => setVimOpen(false)} />}
    </>
  );
}
