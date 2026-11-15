"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { SocialLink } from "@/lib/content";

const EMAIL = "contact@lilay.dev";
const CONFIRM_MS = 1600;

/**
 * Email row on /contact: copies instead of handing the address to a mail
 * client. Modified / middle clicks still fall through to the mailto: link.
 */
export default function CopyEmail({ social }: { social: SocialLink }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return;

    event.preventDefault();

    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), CONFIRM_MS);
    } catch {
      // Clipboard blocked (insecure context / permissions): keep the mailto.
      window.location.href = social.url;
    }
  };

  return (
    <a
      href={social.url}
      onClick={onClick}
      className="flex items-center justify-between border-b border-bg3 px-1 py-4 font-mono text-base text-fg1 underline-offset-4 transition-colors last:border-0 hover:bg-bg2/30 hover:text-yellow hover:underline focus-visible:text-yellow"
    >
      <span className="min-w-0 break-words">
        <span aria-hidden="true" className="mr-2">
          {social.emoji}
        </span>
        <span className="text-green">$ cp</span>{" "}
        {social.name.toLowerCase()}
      </span>
      <span aria-hidden="true" className="ml-2 shrink-0">
        {copied ? "copied!" : "copy"}
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </a>
  );
}
